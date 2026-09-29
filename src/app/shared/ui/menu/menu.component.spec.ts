import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuComponent, MenuItem } from './menu.component';

describe('MenuComponent', () => {
  let fixture: ComponentFixture<MenuComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const panel = (): HTMLElement => el().querySelector<HTMLElement>('[role="menu"]')!;
  const opciones = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('[role^="menuitem"]'));

  const items: MenuItem[] = [
    { label: 'Ver detalle', value: 'ver', icon: 'visibility' },
    { label: 'Exportar', value: 'exportar', icon: 'download', hasChildren: true, divider: true },
    { label: 'Anular', value: 'anular', icon: 'block', disabled: true },
    { label: 'Duplicar', value: 'duplicar', icon: 'content_copy', trailingIcon: 'info' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MenuComponent] }).compileComponents();
    fixture = TestBed.createComponent(MenuComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  });

  it('panel de 280 px con sombra de elevación 8 y opciones de 48 px', () => {
    expect(panel().style.width).toBe('280px');
    expect(panel().classList).toContain('shadow-siaf-elevation-8');
    expect(opciones()[0].classList).toContain('min-h-12');
    expect(opciones()[0].getAttribute('role')).toBe('menuitem');
  });

  it('leading none no muestra íconos iniciales; icon los muestra', () => {
    expect(opciones()[0].querySelectorAll('siaf-icon').length).toBe(0);
    fixture.componentRef.setInput('leading', 'icon');
    fixture.detectChanges();
    expect(opciones()[0].querySelector('siaf-icon')?.textContent).toContain('visibility');
  });

  it('trailing: flecha de submenú con hasChildren, ícono propio con trailingIcon, y divisor', () => {
    expect(opciones()[1].textContent).toContain('arrow_right');
    expect(opciones()[1].getAttribute('aria-haspopup')).toBe('menu');
    expect(opciones()[3].textContent).toContain('info');
    expect(el().querySelectorAll('siaf-divider').length).toBe(1);
  });

  it('compact: opciones de 32 px e íconos de 20', () => {
    fixture.componentRef.setInput('density', 'compact');
    fixture.detectChanges();
    expect(opciones()[0].classList).toContain('min-h-8');
    expect(fixture.componentInstance.tamIcono).toBe(20);
  });

  it('Enter y Espacio eligen la opción enfocada', () => {
    const elegidos: string[] = [];
    fixture.componentInstance.selected.subscribe((v) => elegidos.push(v));
    opciones()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    opciones()[3].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(elegidos).toEqual(['ver', 'duplicar']);
    expect(opciones()[2].getAttribute('aria-disabled')).toBe('true');
    expect(opciones()[2].getAttribute('tabindex')).toBe('-1');
  });

  it('elige y emite el valor; una deshabilitada no emite', () => {
    const elegidos: string[] = [];
    fixture.componentInstance.selected.subscribe((v) => elegidos.push(v));
    opciones()[0].click();
    opciones()[2].click();
    expect(elegidos).toEqual(['ver']);
  });

  it('radio marca una sola opción y emite selectedValue', () => {
    fixture.componentRef.setInput('leading', 'radio');
    fixture.componentRef.setInput('selectedValue', 'ver');
    fixture.detectChanges();
    expect(opciones()[0].getAttribute('role')).toBe('menuitemradio');
    expect(opciones()[0].getAttribute('aria-checked')).toBe('true');

    const valores: string[] = [];
    fixture.componentInstance.selectedValueChange.subscribe((v) => valores.push(v));
    opciones()[1].click();
    fixture.detectChanges();
    expect(valores).toEqual(['exportar']);
    expect(opciones()[0].getAttribute('aria-checked')).toBe('false');
    const radio = opciones()[1].querySelector<HTMLInputElement>('input[type="radio"]')!;
    expect(radio.checked).toBeTrue();
    expect(radio.classList).toContain('accent-brand-primary');
    expect(radio.getAttribute('tabindex')).toBe('-1');
  });

  it('checkbox marca y desmarca varias', () => {
    fixture.componentRef.setInput('leading', 'checkbox');
    fixture.detectChanges();
    const cambios: string[][] = [];
    fixture.componentInstance.selectedValuesChange.subscribe((v) => cambios.push(v));
    opciones()[0].click();
    opciones()[1].click();
    opciones()[0].click();
    fixture.detectChanges();
    expect(cambios).toEqual([['ver'], ['ver', 'exportar'], ['exportar']]);
    expect(opciones()[1].getAttribute('aria-checked')).toBe('true');
    // El checkbox es el nativo del kit (estilo global de styles.css), decorativo dentro de la opción.
    const checks = opciones().map((o) => o.querySelector<HTMLInputElement>('input[type="checkbox"]')!);
    expect(checks.map((c) => c.checked)).toEqual([false, true, false, false]);
    expect(checks[0].getAttribute('aria-hidden')).toBe('true');
  });

  describe('submenú', () => {
    const conHijos: MenuItem[] = [
      { label: 'Ver detalle', value: 'ver', icon: 'visibility' },
      {
        label: 'Exportar', value: 'exportar', icon: 'download',
        children: [
          { label: 'Excel', value: 'excel', icon: 'table_view' },
          { label: 'PDF', value: 'pdf', icon: 'picture_as_pdf' },
        ],
      },
    ];
    const submenu = (): HTMLElement | null => el().querySelector<HTMLElement>(':scope > [data-submenu] > siaf-menu');

    beforeEach(() => {
      fixture.componentRef.setInput('items', conHijos);
      fixture.componentRef.setInput('leading', 'icon');
      fixture.detectChanges();
    });

    it('la opción con hijos lleva flecha y abre el submenú al pasar el puntero, sin emitir', () => {
      const elegidos: string[] = [];
      fixture.componentInstance.selected.subscribe((v) => elegidos.push(v));
      expect(opciones()[1].textContent).toContain('arrow_right');
      expect(opciones()[1].getAttribute('aria-expanded')).toBe('false');

      opciones()[1].dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      expect(submenu()).not.toBeNull();
      expect(opciones()[1].getAttribute('aria-expanded')).toBe('true');
      expect(submenu()!.textContent).toContain('Excel');
      expect(submenu()!.parentElement!.style.left).toBe('280px');
      expect(getComputedStyle(submenu()!.parentElement!).position).toBe('absolute');

      opciones()[1].click();
      fixture.detectChanges();
      expect(submenu()).not.toBeNull();
      expect(elegidos).toEqual([]);
    });

    it('el nivel 2 hereda los íconos, salvo submenuLeading="none"', () => {
      opciones()[1].click();
      fixture.detectChanges();
      expect(submenu()!.querySelectorAll('siaf-icon').length).toBe(2);

      fixture.componentRef.setInput('submenuLeading', 'none');
      opciones()[0].dispatchEvent(new MouseEvent('mouseenter'));
      opciones()[1].dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      expect(submenu()!.querySelectorAll('siaf-icon').length).toBe(0);
      expect(submenu()!.textContent).toContain('Excel');
    });

    it('elegir en el submenú emite el valor hijo y lo cierra', () => {
      const elegidos: string[] = [];
      fixture.componentInstance.selected.subscribe((v) => elegidos.push(v));
      opciones()[1].click();
      fixture.detectChanges();
      submenu()!.querySelectorAll<HTMLElement>('[role="menuitem"]')[1].click();
      fixture.detectChanges();
      expect(elegidos).toEqual(['pdf']);
      expect(submenu()).toBeNull();
    });

    it('pasar a una opción sin hijos o salir del menú lo cierra', () => {
      opciones()[1].dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      opciones()[0].dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      expect(submenu()).toBeNull();

      opciones()[1].dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      el().dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();
      expect(submenu()).toBeNull();
    });

    it('→ abre y enfoca el submenú; ← lo cierra y devuelve el foco', async () => {
      opciones()[1].focus();
      opciones()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      fixture.detectChanges();
      await new Promise((r) => setTimeout(r));
      const hijos = submenu()!.querySelectorAll<HTMLElement>('[role="menuitem"]');
      expect(document.activeElement).toBe(hijos[0]);

      submenu()!.querySelector<HTMLElement>('[role="menu"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      fixture.detectChanges();
      expect(submenu()).toBeNull();
      expect(document.activeElement).toBe(opciones()[1]);
    });
  });

  it('el menú es una sola parada de Tab: la última opción enfocada o, al principio, la primera habilitada', () => {
    const tabulables = (): number[] =>
      opciones().flatMap((opcion, i) => (opcion.getAttribute('tabindex') === '0' ? [i] : []));
    expect(tabulables()).toEqual([0]);

    // Con la primera deshabilitada, la parada inicial es la siguiente habilitada.
    fixture.componentRef.setInput('items', items.map((item, i) => (i === 0 ? { ...item, disabled: true } : item)));
    fixture.detectChanges();
    expect(tabulables()).toEqual([1]);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    opciones()[1].focus();
    panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(opciones()[3]);
    expect(tabulables()).toEqual([3]);

    // Si la opción con la parada se deshabilita, la toma la primera habilitada.
    fixture.componentRef.setInput('items', items.map((item, i) => (i === 3 ? { ...item, disabled: true } : item)));
    fixture.detectChanges();
    expect(tabulables()).toEqual([0]);
  });

  it('teclado: flechas saltan las deshabilitadas y Escape emite closed', () => {
    let cierres = 0;
    fixture.componentInstance.closed.subscribe(() => cierres++);
    opciones()[1].focus();
    panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(opciones()[3]);
    panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(opciones()[0]);
    panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(cierres).toBe(1);
  });
});
