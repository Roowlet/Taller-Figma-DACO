import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabItem, TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
  let fixture: ComponentFixture<TabsComponent>;
  const fila = (): HTMLElement => fixture.nativeElement.querySelector('[role="tablist"]');
  const pestanas = (): HTMLButtonElement[] => Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
  const color = (token: string): string => {
    const prueba = document.createElement('span');
    prueba.style.color = `var(${token})`;
    document.body.append(prueba);
    const valor = getComputedStyle(prueba).color;
    prueba.remove();
    return valor;
  };
  const tabs: TabItem[] = [
    { id: 'a', label: 'Datos generales' },
    { id: 'b', label: 'Ítems', count: 8 },
    { id: 'c', label: 'Sustentos' },
  ];

  let sinTransiciones: HTMLStyleElement;

  beforeEach(async () => {
    // Sin transiciones: los colores y sombras se leen apenas cambia el estado.
    sinTransiciones = document.createElement('style');
    sinTransiciones.textContent = '*, *::before { transition: none !important; }';
    document.head.append(sinTransiciones);

    await TestBed.configureTestingModule({ imports: [TabsComponent] }).compileComponents();
    fixture = TestBed.createComponent(TabsComponent);
    fixture.componentRef.setInput('tabs', tabs);
    fixture.componentRef.setInput('activeId', 'b');
    fixture.detectChanges();
  });

  afterEach(() => sinTransiciones.remove());

  it('pinta una pestaña de 40 px por entrada; la activa en negrita azul y las demás en gris medium', () => {
    expect(pestanas().length).toBe(3);
    expect(pestanas()[0].getBoundingClientRect().height).toBe(40);
    expect(pestanas()[1].getAttribute('aria-selected')).toBe('true');
    expect(pestanas()[1].tabIndex).toBe(0);
    expect(pestanas()[0].tabIndex).toBe(-1);

    const activa = pestanas()[1].querySelector('span')!;
    const inactiva = pestanas()[0].querySelector('span')!;
    expect(getComputedStyle(activa).fontWeight).toBe('700');
    expect(getComputedStyle(activa).fontSize).toBe('14px');
    expect(getComputedStyle(pestanas()[1]).color).toBe(color('--sys-color-text-neutral-activated'));
    expect(getComputedStyle(inactiva).fontWeight).toBe('500');
    expect(getComputedStyle(pestanas()[0]).color).toBe(color('--sys-color-text-neutral-low'));
  });

  it('el contador va con siaf-badge azul', () => {
    const badge = pestanas()[1].querySelector('siaf-badge')!;
    expect(badge.textContent!.trim()).toBe('8');
    expect(pestanas()[0].querySelector('siaf-badge')).toBeNull();
  });

  it('border=true: fila con fondo de superficie y la activa como carpeta con borde gris', () => {
    expect(fila().hasAttribute('data-borde')).toBeTrue();
    expect(getComputedStyle(fila()).backgroundColor).toBe(color('--sys-color-bg-surfaces-surface'));
    const estilo = getComputedStyle(pestanas()[1]);
    expect(estilo.backgroundColor).toBe(color('--sys-color-bg-surfaces-surface'));
    expect(estilo.boxShadow).toContain(color('--sys-color-divider-strong'));
    expect(estilo.borderTopLeftRadius).toBe('4px');
    expect(estilo.borderBottomLeftRadius).toBe('0px');
  });

  it('border=false: la activa lleva el subrayado azul de 2 px', () => {
    fixture.componentRef.setInput('border', false);
    fixture.detectChanges();
    expect(fila().hasAttribute('data-borde')).toBeFalse();
    const sombra = getComputedStyle(pestanas()[1]).boxShadow;
    expect(sombra).toContain(color('--sys-color-border-states-active'));
    expect(sombra).toContain('0px -2px 0px 0px inset');
    expect(getComputedStyle(pestanas()[0]).boxShadow).toBe('none');
  });

  it('al pulsar otra pestaña emite activeIdChange y selected; la activa no vuelve a emitir', () => {
    const emitidos: string[] = [];
    const elegidas: TabItem[] = [];
    fixture.componentInstance.activeIdChange.subscribe((id) => emitidos.push(id));
    fixture.componentInstance.selected.subscribe((tab) => elegidas.push(tab));

    pestanas()[1].click();
    pestanas()[2].click();
    expect(emitidos).toEqual(['c']);
    expect(elegidas.map((t) => t.label)).toEqual(['Sustentos']);
  });

  it('teclado: flechas rotan, Inicio y Fin van a los extremos y enfocan la pestaña', () => {
    const emitidos: string[] = [];
    fixture.componentInstance.activeIdChange.subscribe((id) => emitidos.push(id));
    const tecla = (i: number, key: string) => {
      pestanas()[i].dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    };

    tecla(1, 'ArrowRight');
    tecla(2, 'ArrowRight');
    tecla(0, 'ArrowLeft');
    tecla(2, 'Home');
    tecla(0, 'End');
    expect(emitidos).toEqual(['c', 'a', 'c', 'a', 'c']);
    expect(document.activeElement).toBe(pestanas()[2]);
  });

  it('fullWidth reparte el ancho en partes iguales sin desbordar la fila', () => {
    fixture.componentRef.setInput('tabs', [
      { id: 'entidades', label: 'Entidades del Estado' },
      { id: 'proveedores', label: 'Proveedores y Externos' },
    ]);
    fixture.componentRef.setInput('activeId', 'entidades');
    fixture.componentRef.setInput('fullWidth', true);
    fixture.nativeElement.style.width = '360px';
    fixture.detectChanges();
    expect(pestanas().map((p) => p.getBoundingClientRect().width)).toEqual([180, 180]);
    expect(fila().scrollWidth).toBe(fila().clientWidth);
  });

  it('los ids de las pestañas no se repiten entre filas y siguen idBase si se da', () => {
    const otra = TestBed.createComponent(TabsComponent);
    otra.componentRef.setInput('tabs', tabs);
    otra.detectChanges();
    const ids = (f: ComponentFixture<TabsComponent>) => Array.from<HTMLElement>(f.nativeElement.querySelectorAll('[role="tab"]')).map((p) => p.id);
    expect(ids(fixture).some((id) => ids(otra).includes(id))).toBeFalse();

    fixture.componentRef.setInput('idBase', 'ficha-siaf-tabs');
    fixture.detectChanges();
    expect(ids(fixture)).toEqual(['ficha-siaf-tabs-a', 'ficha-siaf-tabs-b', 'ficha-siaf-tabs-c']);
  });

  it('sin pestaña activa, la primera queda en el orden de tabulación', () => {
    fixture.componentRef.setInput('activeId', '');
    fixture.detectChanges();
    expect(pestanas().map((p) => p.tabIndex)).toEqual([0, -1, -1]);
  });
});
