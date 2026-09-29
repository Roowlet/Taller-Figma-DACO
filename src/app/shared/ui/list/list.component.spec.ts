import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListComponent, ListItem, ListSwitchChange } from './list.component';

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const items = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('li'));
  const fila = (i: number): HTMLElement => items()[i].firstElementChild as HTMLElement;

  const lista: ListItem[] = [
    { id: 'a', title: 'Acta de inventario', leading: { type: 'icon', icon: 'description' }, trailing: { type: 'icon', icon: 'info' } },
    { id: 'b', title: 'Comisión', description: 'Juan Carlos Pérez', leading: { type: 'avatar', initials: 'JP' }, trailing: { type: 'badge', label: 88 } },
    { id: 'c', title: 'Notificar', leading: { type: 'switch', checked: false }, trailing: { type: 'switch', checked: true } },
    { id: 'd', title: 'Toma de inventario', overline: 'Almacén', description: 'Foto del almacén', leading: { type: 'thumbnail', src: 'data:,', alt: 'Almacén' } },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ListComponent] }).compileComponents();
    fixture = TestBed.createComponent(ListComponent);
    fixture.componentRef.setInput('items', lista);
    fixture.detectChanges();
  });

  it('pinta cada tipo de leading y trailing', () => {
    expect(items()[0].querySelectorAll('siaf-icon').length).toBe(2);
    expect(items()[1].textContent).toContain('JP');
    expect(items()[1].querySelector('siaf-badge')?.textContent?.trim()).toBe('88');
    expect(items()[2].querySelectorAll('siaf-switch').length).toBe(2);
    expect(items()[3].querySelector('img')?.getAttribute('alt')).toBe('Almacén');
    expect(items()[3].textContent).toContain('Almacén');
  });

  it('standard mide 48 px mínimo con íconos de 24; compact 32 px con íconos de 20', () => {
    expect(fila(0).classList).toContain('min-h-12');
    fixture.componentRef.setInput('size', 'compact');
    fixture.detectChanges();
    expect(fila(0).classList).toContain('min-h-8');
    expect(fixture.componentInstance.tamIcono).toBe(20);
  });

  it('la descripción se corta en una línea salvo wrapDescription', () => {
    const descripcion = (): HTMLElement => items()[1].querySelector<HTMLElement>('.text-xs')!;
    expect(descripcion().classList).toContain('truncate');
    fixture.componentRef.setInput('wrapDescription', true);
    fixture.detectChanges();
    expect(descripcion().classList).not.toContain('truncate');
  });

  it('dividers pone siaf-divider bajo cada ítem menos el último', () => {
    fixture.componentRef.setInput('dividers', true);
    fixture.detectChanges();
    expect(el().querySelectorAll('siaf-divider').length).toBe(lista.length - 1);
  });

  it('estática no es seleccionable; selectable elige con clic y teclado y marca el seleccionado', () => {
    items()[0].click();
    expect(items()[0].getAttribute('aria-selected')).toBeNull();

    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();
    const elegidos: string[] = [];
    fixture.componentInstance.selectedIdChange.subscribe((id) => elegidos.push(id));

    items()[0].click();
    fixture.detectChanges();
    expect(items()[0].getAttribute('aria-selected')).toBe('true');
    expect(items()[0].classList).toContain('bg-[var(--sys-color-bg-states-light-selected)]');
    expect(items()[0].querySelector('.text-sm')!.classList).toContain('font-bold');
    expect(items()[0].querySelector('siaf-icon')!.classList).toContain('text-[var(--sys-color-icon-states-active)]');

    items()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(elegidos).toEqual(['a', 'b']);
    expect(items()[0].getAttribute('aria-selected')).toBe('false');
  });

  it('un switch emite switchChange sin cambiar la selección', () => {
    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();
    const cambios: ListSwitchChange[] = [];
    fixture.componentInstance.switchChange.subscribe((c) => cambios.push(c));

    items()[2].querySelectorAll<HTMLInputElement>('input[role="switch"]')[1].click();
    fixture.detectChanges();

    expect(cambios).toEqual([{ id: 'c', position: 'trailing', checked: false }]);
    expect(items()[2].getAttribute('aria-selected')).toBe('false');
    expect(items()[2].querySelectorAll('input[role="switch"]')[0].getAttribute('aria-label')).toBe('Notificar');
  });

  it('seleccionable: una sola parada de Tab y las flechas, Inicio y Fin recorren las opciones', () => {
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('selectedId', 'b');
    fixture.detectChanges();
    if (!el().isConnected) document.body.appendChild(el());
    const tabulables = (): (string | undefined)[] => items().filter((li) => li.getAttribute('tabindex') === '0').map((li) => li.dataset['id']);
    const tecla = (key: string): void => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    };

    // Entra por la elegida; las demás quedan fuera del orden de Tab.
    expect(tabulables()).toEqual(['b']);
    items()[1].focus();

    tecla('ArrowDown');
    expect(document.activeElement).toBe(items()[2]);
    expect(tabulables()).toEqual(['c']);
    tecla('End');
    expect(document.activeElement).toBe(items()[3]);
    tecla('ArrowDown');
    expect(document.activeElement).withContext('da la vuelta').toBe(items()[0]);
    tecla('ArrowUp');
    expect(document.activeElement).toBe(items()[3]);
    tecla('Home');
    expect(document.activeElement).toBe(items()[0]);
    expect(tabulables()).toEqual(['a']);
  });

  it('sin selectable, las filas no entran al orden de Tab', () => {
    expect(items().some((li) => li.hasAttribute('tabindex'))).toBeFalse();
  });

  it('acepta el atajo icon de los ítems anteriores', () => {
    fixture.componentRef.setInput('items', [{ title: 'Plan de trabajo', icon: 'event_note' }]);
    fixture.detectChanges();
    expect(items()[0].querySelector('siaf-icon')?.textContent).toContain('event_note');
  });

  it('horizontal con outlined: ítems en fila de 230 px con borde, contenido centrado y sin divisores', () => {
    document.body.appendChild(el());
    try {
      fixture.componentRef.setInput('orientation', 'horizontal');
      fixture.componentRef.setInput('outlined', true);
      fixture.componentRef.setInput('dividers', true);
      fixture.detectChanges();

      expect(getComputedStyle(el().querySelector('ul')!).flexDirection).toBe('row');
      expect(getComputedStyle(items()[0]).width).toBe('230px');
      expect(parseFloat(getComputedStyle(items()[0]).borderTopWidth)).toBeGreaterThan(0);
      expect(fila(1).classList).withContext('con descripción, centrado igual').toContain('items-center');
      expect(fila(1).querySelector('.text-sm')?.classList).withContext('título en una línea').toContain('truncate');
      expect(el().querySelector('siaf-divider')).toBeNull();
      // Los dos primeros quedan uno al lado del otro, separados 4 px.
      const [primero, segundo] = [items()[0].getBoundingClientRect(), items()[1].getBoundingClientRect()];
      expect(Math.round(segundo.left - primero.right)).toBe(4);
    } finally {
      el().remove();
    }
  });

  it('seleccionable en horizontal: derecha e izquierda también recorren las opciones', () => {
    document.body.appendChild(el());
    try {
      fixture.componentRef.setInput('orientation', 'horizontal');
      fixture.componentRef.setInput('selectable', true);
      fixture.detectChanges();
      expect(el().querySelector('ul')?.getAttribute('aria-orientation')).toBe('horizontal');

      items()[0].focus();
      items()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      expect(document.activeElement).toBe(items()[1]);
      items()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
      expect(document.activeElement).toBe(items()[0]);
    } finally {
      el().remove();
    }
  });
});
