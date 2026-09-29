import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DateTimePickerComponent } from '../ui/date-time-picker/date-time-picker.component';
import { IconDropdownMenuComponent, IconDropdownMenuItem } from '../ui/icon-dropdown-menu/icon-dropdown-menu.component';
import { PopoverComponent } from '../ui/popover/popover.component';
import { TextFieldComponent } from '../ui/text-field/text-field.component';
import { BreadcrumbComponent, BreadcrumbItem } from './breadcrumb/breadcrumb.component';
import { CreateDocumentComponent } from './create-document/create-document.component';
import { FilterPillComponent } from './filter-pill/filter-pill.component';

/** Desplegables con siafFoco: el foco entra al abrir, Escape / elegir / salir con Tab cierran y el foco vuelve. */
@Component({
  standalone: true,
  imports: [CreateDocumentComponent, DateTimePickerComponent, FilterPillComponent, IconDropdownMenuComponent, PopoverComponent, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-popover title="Detalle" text="Texto" [open]="popover()" [actions]="accionesPopover" (closed)="popover.set(false)" (action)="popover.set(false)">
      <button id="abrir-popover" popover-trigger type="button" (click)="popover.set(!popover())">Abrir</button>
    </siaf-popover>
    <siaf-icon-dropdown-menu ariaLabel="Más opciones" [items]="acciones" />
    <siaf-filter-pill label="Estado" [options]="estados" [selectedValue]="estado()" (selectedValueChange)="estado.set($event)" />
    <siaf-input label="Moneda" type="select" [options]="monedas" [value]="moneda()" (valueChange)="moneda.set('' + $event)" />
    <siaf-date-time-picker label="Fecha" value="2026-03-15" [defaultToToday]="false" />
    <siaf-create-document variant="sidepanel" />
    <button id="afuera" type="button">Afuera</button>
  `,
})
class DesplegablesComponent {
  readonly acciones: IconDropdownMenuItem[] = [{ label: 'Editar', value: 'editar' }, { label: 'Eliminar', value: 'eliminar' }];
  readonly estados = [{ label: 'Activo', value: 'activo' }, { label: 'Inactivo', value: 'inactivo' }];
  readonly estado = signal('');
  readonly monedas = [{ label: 'Soles', value: 'PEN' }, { label: 'Dólares', value: 'USD' }];
  readonly moneda = signal('USD');
  readonly popover = signal(false);
  readonly accionesPopover = [{ label: 'Ver más' }, { label: 'Descartar' }];
}

@Component({
  standalone: true,
  imports: [BreadcrumbComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-breadcrumb [items]="niveles" />
    <button id="despues" type="button">Después</button>
  `,
})
class MigasComponent {
  // Cinco niveles: con cualquier ancho, «Contabilidad» es el primer nivel con enlace detrás de «…».
  readonly niveles: BreadcrumbItem[] = [
    { label: 'Contabilidad', href: '/contabilidad' },
    { label: 'Plan de cuentas', href: '/plan-cuentas' },
    { label: 'Solicitudes' },
    { label: 'Registro', href: '/registro' },
    { label: 'Detalle' },
  ];
}

describe('Niveles intermedios de siaf-breadcrumb con siafFoco', () => {
  let fixture: ComponentFixture<MigasComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const pintar = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const botonVisible = (): HTMLButtonElement =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('button[aria-label="Niveles intermedios"]')).find((b) => b.getClientRects().length > 0)!;
  const abrir = async (): Promise<HTMLButtonElement> => {
    const boton = botonVisible();
    boton.focus();
    boton.click();
    await pintar();
    return boton;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MigasComponent], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(MigasComponent);
    document.body.appendChild(fixture.nativeElement);
    await pintar();
  });

  afterEach(() => fixture.nativeElement.remove());

  it('es una lista de enlaces controlada por «…»; el foco entra en el primer nivel con enlace y Escape vuelve a «…»', async () => {
    const boton = await abrir();
    const lista = document.getElementById(boton.getAttribute('aria-controls') ?? '');
    expect(lista?.tagName).toBe('UL');
    expect(el().querySelector('[role="menu"], [role="menuitem"]')).toBeNull();
    expect(document.activeElement?.textContent?.trim()).toBe('Contabilidad');

    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await pintar();
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    expect(el().querySelector('siaf-breadcrumb ul')).toBeNull();
    expect(document.activeElement).toBe(boton);
  });

  it('salir de la lista con Tab la cierra y el foco sigue en el control siguiente', async () => {
    const boton = await abrir();
    // Como en la app (zone.js), el cierre se pinta dentro del mismo focusout.
    fixture.autoDetectChanges();
    const siguiente = el().querySelector<HTMLButtonElement>('#despues')!;
    siguiente.focus();
    await pintar();
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    expect(el().querySelector('siaf-breadcrumb ul')).toBeNull();
    expect(document.activeElement).toBe(siguiente);
  });
});

describe('Desplegables con siafFoco', () => {
  let fixture: ComponentFixture<DesplegablesComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const q = <T extends HTMLElement>(selector: string): T => el().querySelector<T>(selector)!;
  const pintar = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const tecla = (key: string, destino: Element = document.activeElement ?? document.body): KeyboardEvent => {
    const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    destino.dispatchEvent(evento);
    return evento;
  };
  const pulsar = async (boton: HTMLElement): Promise<void> => {
    boton.focus();
    boton.click();
    await pintar();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DesplegablesComponent] }).compileComponents();
    fixture = TestBed.createComponent(DesplegablesComponent);
    document.body.appendChild(fixture.nativeElement);
    await pintar();
  });

  afterEach(() => fixture.nativeElement.remove());

  it('siaf-icon-dropdown-menu: el foco entra en la primera opción, Escape cierra y vuelve al botón; la capa no es parada de Tab', async () => {
    const boton = q<HTMLButtonElement>('siaf-icon-dropdown-menu button[aria-haspopup="menu"]');
    await pulsar(boton);
    expect(document.activeElement?.textContent?.trim()).toBe('Editar');
    const capa = q<HTMLButtonElement>('siaf-icon-dropdown-menu button[data-capa-cierre]');
    expect(capa.tabIndex).toBe(-1);
    expect(capa.getAttribute('aria-hidden')).toBe('true');

    tecla('Escape');
    await pintar();
    expect(el().querySelector('siaf-icon-dropdown-menu siaf-menu')).toBeNull();
    expect(document.activeElement).toBe(boton);
  });

  it('siaf-icon-dropdown-menu: salir del menú con Tab lo cierra sin quitarle el foco al control siguiente', async () => {
    await pulsar(q<HTMLButtonElement>('siaf-icon-dropdown-menu button[aria-haspopup="menu"]'));
    // Como en la app (zone.js), el cierre se pinta dentro del mismo focusout.
    fixture.autoDetectChanges();
    q<HTMLButtonElement>('#afuera').focus();
    await pintar();
    expect(el().querySelector('siaf-icon-dropdown-menu siaf-menu')).toBeNull();
    expect(document.activeElement?.id).toBe('afuera');
  });

  it('siaf-popover: el foco entra en la primera acción y Escape lo devuelve al disparador', async () => {
    const disparador = q<HTMLButtonElement>('#abrir-popover');
    await pulsar(disparador);
    expect(document.activeElement?.textContent?.trim()).toBe('Ver más');
    tecla('Escape');
    await pintar();
    expect(el().querySelector('siaf-popover [role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(disparador);
  });

  it('siaf-popover: si ya se pinta abierto (sin que un control lo abriera), no toma el foco', async () => {
    (document.activeElement as HTMLElement | null)?.blur();
    fixture.componentInstance.popover.set(true);
    await pintar();
    expect(el().querySelector('siaf-popover [role="dialog"]')).not.toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it('siaf-filter-pill: al elegir y al limpiar con la ×, el foco queda en el botón de la píldora', async () => {
    await pulsar(q<HTMLButtonElement>('siaf-filter-pill button[data-tag-boton]'));
    const opcion = Array.from(el().querySelectorAll<HTMLElement>('siaf-filter-pill [role^="menuitem"]')).find((o) => o.textContent?.includes('Activo'))!;
    expect(document.activeElement).toBe(opcion);
    await pulsar(opcion);
    await pintar();
    const pildora = q<HTMLButtonElement>('siaf-filter-pill button[data-tag-boton]');
    expect(pildora.textContent).toContain('Activo');
    expect(document.activeElement).toBe(pildora);
    expect(pildora.getAttribute('aria-expanded')).toBe('false');

    // La × es un botón al lado del de la píldora: al limpiar desaparece y el foco pasa a la píldora.
    await pulsar(q<HTMLButtonElement>('siaf-filter-pill button[data-tag-quitar]'));
    await pintar();
    expect(el().querySelector('siaf-filter-pill button[data-tag-quitar]')).toBeNull();
    expect(pildora.textContent).not.toContain('Activo');
    expect(document.activeElement).toBe(pildora);
  });

  it('select de siaf-input: el foco entra en la opción elegida y al elegir vuelve al botón del campo', async () => {
    const campo = q<HTMLButtonElement>('siaf-input button[aria-haspopup="listbox"]');
    await pulsar(campo);
    // La opción elegida lleva el ícono check, que en el DOM es texto.
    expect(document.activeElement?.getAttribute('role')).toBe('option');
    expect(document.activeElement?.textContent).toContain('Dólares');
    await pulsar(Array.from(el().querySelectorAll<HTMLElement>('siaf-input [role="option"]')).find((o) => o.textContent?.includes('Soles'))!);
    expect(el().querySelector('siaf-input [role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(campo);
  });

  it('siaf-date-time-picker: el foco entra en el día elegido y Escape cierra y vuelve al campo', async () => {
    const campo = q<HTMLButtonElement>('siaf-date-time-picker button[aria-haspopup="dialog"]');
    await pulsar(campo);
    expect(document.activeElement?.textContent?.trim()).toBe('15');
    tecla('Escape');
    await pintar();
    expect(el().querySelector('siaf-date-time-picker [role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(campo);
  });

  it('buscador de procesos de siaf-create-document: flecha abajo entra a la lista y Enter elige, con el foco de vuelta en el buscador', async () => {
    const buscador = q<HTMLInputElement>('siaf-create-document input[role="combobox"]');
    buscador.focus();
    await pintar();
    expect(buscador.getAttribute('aria-expanded')).toBe('true');

    tecla('ArrowDown', buscador);
    await pintar();
    const lista = q<HTMLElement>('siaf-create-document [role="listbox"]');
    expect(lista).not.toBeNull();
    expect(lista.contains(document.activeElement)).withContext('el foco pasó a la lista y la lista sigue abierta').toBeTrue();

    const primero = document.activeElement as HTMLButtonElement;
    tecla('ArrowDown', primero);
    expect(document.activeElement).not.toBe(primero);

    (document.activeElement as HTMLButtonElement).click();
    await pintar();
    expect(document.activeElement).toBe(buscador);
    expect(buscador.value.length).toBeGreaterThan(0);
    expect(buscador.getAttribute('aria-expanded')).toBe('false');
    expect(buscador.className).withContext('conserva el borde de foco').toContain('border-states-focus');
  });

  it('buscador de procesos: Escape en un proceso cierra la lista y el foco vuelve al buscador', async () => {
    const buscador = q<HTMLInputElement>('siaf-create-document input[role="combobox"]');
    buscador.focus();
    await pintar();
    tecla('ArrowDown', buscador);
    await pintar();
    expect(document.activeElement?.getAttribute('role')).toBe('option');

    tecla('Escape');
    await pintar();
    expect(document.activeElement).toBe(buscador);
    expect(buscador.getAttribute('aria-expanded')).toBe('false');
    expect(el().querySelector('siaf-create-document [role="listbox"]')).toBeNull();

    tecla('ArrowDown', buscador);
    await pintar();
    expect(buscador.getAttribute('aria-expanded')).withContext('flecha abajo la vuelve a abrir').toBe('true');
    expect(document.activeElement).toBe(buscador);
    tecla('ArrowDown', buscador);
    expect(document.activeElement?.getAttribute('role')).toBe('option');
  });

  it('buscador de procesos: el proceso elegido queda marcado con aria-selected', async () => {
    const buscador = q<HTMLInputElement>('siaf-create-document input[role="combobox"]');
    buscador.focus();
    await pintar();
    const [primero, segundo] = Array.from(el().querySelectorAll<HTMLButtonElement>('siaf-create-document [role="option"]'));
    expect(primero.getAttribute('aria-selected')).toBe('false');
    segundo.focus();
    segundo.click();
    await pintar();

    tecla('ArrowDown', buscador);
    await pintar();
    const marcadas = Array.from(el().querySelectorAll('siaf-create-document [role="option"][aria-selected="true"]'));
    expect(marcadas.length).toBe(1);
    expect(marcadas[0].textContent?.trim()).toBe(buscador.value);
  });
});
