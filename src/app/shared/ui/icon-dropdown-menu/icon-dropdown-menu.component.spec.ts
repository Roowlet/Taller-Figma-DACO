import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { IconDropdownMenuComponent, IconDropdownMenuItem } from './icon-dropdown-menu.component';

describe('IconDropdownMenuComponent', () => {
  let fixture: ComponentFixture<IconDropdownMenuComponent>;
  let component: IconDropdownMenuComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IconDropdownMenuComponent] }).compileComponents();
    fixture = TestBed.createComponent(IconDropdownMenuComponent);
    component = fixture.componentInstance;
  });

  function render(opts: {
    icon?: string;
    ariaLabel?: string;
    items?: IconDropdownMenuItem[];
    align?: 'left' | 'right';
    menuWidth?: number;
    disabled?: boolean;
    closeOnSelect?: boolean;
  } = {}): void {
    if (opts.icon !== undefined) fixture.componentRef.setInput('icon', opts.icon);
    if (opts.ariaLabel !== undefined) fixture.componentRef.setInput('ariaLabel', opts.ariaLabel);
    if (opts.items !== undefined) fixture.componentRef.setInput('items', opts.items);
    if (opts.align !== undefined) fixture.componentRef.setInput('align', opts.align);
    if (opts.menuWidth !== undefined) fixture.componentRef.setInput('menuWidth', opts.menuWidth);
    if (opts.disabled !== undefined) fixture.componentRef.setInput('disabled', opts.disabled);
    if (opts.closeOnSelect !== undefined) fixture.componentRef.setInput('closeOnSelect', opts.closeOnSelect);
    fixture.detectChanges();
  }

  it('cerrado por default', () => {
    render({ icon: 'layers', items: [{ label: 'A' }] });
    expect(fixture.debugElement.query(By.css('[role="menu"]'))).toBeNull();
    expect(component.open()).toBeFalse();
  });

  it('click en trigger abre el menú', () => {
    render({ icon: 'layers', items: [{ label: 'A' }] });
    fixture.debugElement.query(By.css('button[aria-haspopup="menu"]')).triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="menu"]'))).not.toBeNull();
  });

  it('disabled no abre el menú', () => {
    render({ icon: 'layers', items: [{ label: 'A' }], disabled: true });
    fixture.debugElement.query(By.css('button[aria-haspopup="menu"]')).triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.open()).toBeFalse();
  });

  it('selecciona item y emite value', () => {
    render({
      icon: 'layers',
      items: [
        { label: 'Solicitudes observadas', value: 'observed' },
        { label: 'Guardar búsqueda actual', value: 'save-search' },
      ],
    });
    component.toggle();
    fixture.detectChanges();
    let emitted: string | undefined;
    component.selected.subscribe(v => (emitted = v));

    fixture.debugElement.queryAll(By.css('[role="menuitem"]'))[1].triggerEventHandler('click', null);
    expect(emitted).toBe('save-search');
    expect(component.open()).toBeFalse();
  });

  it('si no hay value emite el label', () => {
    render({ icon: 'layers', items: [{ label: 'Solo label' }] });
    component.toggle();
    fixture.detectChanges();
    let emitted: string | undefined;
    component.selected.subscribe(v => (emitted = v));

    fixture.debugElement.query(By.css('[role="menuitem"]')).triggerEventHandler('click', null);
    expect(emitted).toBe('Solo label');
  });

  it('closeOnSelect=false NO cierra después de seleccionar', () => {
    render({
      icon: 'layers',
      items: [{ label: 'Campos personalizados', hasChildren: true }],
      closeOnSelect: false,
    });
    component.toggle();
    fixture.detectChanges();

    fixture.debugElement.query(By.css('[role="menuitem"]')).triggerEventHandler('click', null);
    expect(component.open()).toBeTrue();
  });

  it('renderiza divider después del item marcado', () => {
    render({
      icon: 'layers',
      items: [
        { label: 'A', divider: true },
        { label: 'B' },
      ],
    });
    component.toggle();
    fixture.detectChanges();
    const dividers = fixture.debugElement.queryAll(By.css('siaf-divider'));
    expect(dividers.length).toBe(1);
  });

  it('items disabled no emiten ni cierran al click', () => {
    render({
      icon: 'layers',
      items: [{ label: 'No disponible', disabled: true }],
    });
    component.toggle();
    fixture.detectChanges();
    let emitted = false;
    component.selected.subscribe(() => (emitted = true));

    // click directo en el componente (saltea el disabled del DOM en tests)
    component.select(component.items[0]);
    expect(emitted).toBeFalse();
    expect(component.open()).toBeTrue();
  });

  it('dibuja el panel con siaf-menu compact, con el ancho pedido e íconos si alguna opción los trae', () => {
    render({ icon: 'more_vert', ariaLabel: 'Más opciones', menuWidth: 200, items: [{ label: 'Eliminar', icon: 'delete' }, { label: 'Campos', hasChildren: true }] });
    component.toggle();
    fixture.detectChanges();

    const menu = fixture.debugElement.query(By.css('siaf-menu'));
    expect(menu).not.toBeNull();
    const panel: HTMLElement = menu.nativeElement.querySelector('[role="menu"]');
    expect(panel.style.width).toBe('200px');
    expect(panel.getAttribute('aria-label')).toBe('Más opciones');
    const opciones: HTMLElement[] = Array.from(panel.querySelectorAll('[role="menuitem"]'));
    expect(opciones[0].classList).toContain('min-h-8');
    expect(opciones[0].textContent).toContain('delete');
    expect(opciones[1].textContent).toContain('arrow_right');
  });

  it('con label: botón de contorno con el texto, que nombra el botón y el menú sin aria-label', () => {
    render({ icon: 'open_in_new', ariaLabel: 'Más opciones', items: [{ label: 'Excel', value: 'excel' }] });
    fixture.componentRef.setInput('label', 'Exportar');
    fixture.detectChanges();

    const boton: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-haspopup="menu"]');
    expect(boton.textContent).toContain('Exportar');
    expect(boton.hasAttribute('aria-label')).toBeFalse();
    expect(boton.classList).toContain('border');
    expect(boton.classList).not.toContain('size-10');

    boton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]').getAttribute('aria-label')).toBe('Exportar');
  });

  it('density="standard" pasa al menú: opciones de 48 px', () => {
    render({ icon: 'open_in_new', items: [{ label: 'PDF', value: 'pdf', icon: 'picture_as_pdf' }] });
    fixture.componentRef.setInput('density', 'standard');
    component.toggle();
    fixture.detectChanges();

    const opcion: HTMLElement = fixture.nativeElement.querySelector('[role="menuitem"]');
    expect(opcion.classList).toContain('min-h-12');
    expect(opcion.classList).not.toContain('min-h-8');
  });

  it('pulsar fuera cierra el menú', () => {
    render({ icon: 'layers', items: [{ label: 'A' }] });
    component.toggle();
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button[data-capa-cierre]')).nativeElement.click();
    expect(component.open()).toBeFalse();
  });

  it('Escape cierra el menú', () => {
    render({ icon: 'layers', items: [{ label: 'A' }] });
    component.toggle();
    expect(component.open()).toBeTrue();
    component.onEscape();
    expect(component.open()).toBeFalse();
  });
});
