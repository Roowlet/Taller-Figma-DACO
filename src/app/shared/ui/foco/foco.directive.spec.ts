import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocoDirective } from './foco.directive';

@Component({
  standalone: true,
  imports: [FocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="disparador" type="button" (click)="abierto.set(true)">Abrir</button>
    <button id="afuera" type="button">Afuera</button>
    @if (abierto()) {
      <section id="panel" role="dialog" aria-modal="true" aria-label="Panel" [siafFoco]="activo()" [siafFocoAtrapar]="atrapar()" (siafFocoEscape)="escapes = escapes + 1; cerrarConEscape() && abierto.set(false)" (siafFocoSalida)="alSalir()">
        @if (sinControles()) {
          <p>Solo texto</p>
        } @else {
          <button id="primero" type="button">Primero</button>
          <span [attr.data-foco-inicial]="conInicial() ? '' : null"><input id="campo" /></span>
          <button id="deshabilitado" type="button" disabled>Deshabilitado</button>
          <button id="ultimo" type="button" (click)="interno.set(true)">Último</button>
        }
        @if (interno()) {
          <div id="interno" siafFoco (siafFocoEscape)="interno.set(false)">
            <button id="interno-boton" type="button">Interno</button>
          </div>
        }
      </section>
      @if (conGemelo()) {
        <!-- Como la lista de «…» de siaf-breadcrumb: la versión de otro breakpoint, oculta por CSS. -->
        <div id="gemelo" style="display: none" siafFoco [siafFocoAtrapar]="false">
          <button type="button">Oculto</button>
        </div>
      }
    }
  `,
})
class AnfitrionComponent {
  readonly abierto = signal(false);
  readonly activo = signal(true);
  readonly atrapar = signal(true);
  readonly sinControles = signal(false);
  readonly conInicial = signal(false);
  readonly interno = signal(false);
  readonly cerrarConEscape = signal(true);
  readonly cerrarAlSalir = signal(false);
  readonly conGemelo = signal(false);
  private readonly cdr = inject(ChangeDetectorRef);
  escapes = 0;
  salidas = 0;

  alSalir(): void {
    this.salidas++;
    if (!this.cerrarAlSalir()) return;
    // Como en la app con zone.js: el cierre se pinta dentro del mismo focusout, cuando activeElement todavía es body.
    this.abierto.set(false);
    this.cdr.detectChanges();
  }
}

describe('FocoDirective', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  let anfitrion: AnfitrionComponent;
  const $ = (id: string): HTMLElement => fixture.nativeElement.querySelector(`#${id}`);
  const activo = (): string | undefined => (document.activeElement as HTMLElement | null)?.id;
  const pintar = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const tecla = (key: string, shiftKey = false): KeyboardEvent => {
    const evento = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
    (document.activeElement ?? document.body).dispatchEvent(evento);
    return evento;
  };
  const abrirDesde = async (id = 'disparador'): Promise<void> => {
    $(id).focus();
    anfitrion.abierto.set(true);
    await pintar();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    anfitrion = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    await pintar();
  });

  afterEach(() => fixture.nativeElement.remove());

  it('al abrir lleva el foco al primer control', async () => {
    await abrirDesde();
    expect(activo()).toBe('primero');
  });

  it('un panel no modal que se pinta abierto sin un control enfocado no toma el foco ni avisa salidas', async () => {
    anfitrion.atrapar.set(false);
    (document.activeElement as HTMLElement | null)?.blur();
    anfitrion.abierto.set(true);
    await pintar();
    expect(document.activeElement).toBe(document.body);
    $('afuera').focus();
    expect(anfitrion.salidas).toBe(0);
  });

  it('un diálogo modal toma el foco aunque ningún control lo tuviera al abrirse', async () => {
    (document.activeElement as HTMLElement | null)?.blur();
    anfitrion.abierto.set(true);
    await pintar();
    expect(activo()).toBe('primero');
  });

  it('prefiere el elemento marcado con data-foco-inicial (o su primer control, si marca un envoltorio)', async () => {
    anfitrion.conInicial.set(true);
    await abrirDesde();
    expect(activo()).toBe('campo');
  });

  it('sin controles enfoca el contenedor, que recibe tabindex -1', async () => {
    anfitrion.sinControles.set(true);
    await abrirDesde();
    expect(activo()).toBe('panel');
    expect($('panel').getAttribute('tabindex')).toBe('-1');
  });

  it('Tab en el último control vuelve al primero y Shift + Tab en el primero va al último (salta los deshabilitados)', async () => {
    await abrirDesde();
    $('ultimo').focus();
    const adelante = tecla('Tab');
    expect(adelante.defaultPrevented).toBeTrue();
    expect(activo()).toBe('primero');

    const atras = tecla('Tab', true);
    expect(atras.defaultPrevented).toBeTrue();
    expect(activo()).toBe('ultimo');
  });

  it('en medio del recorrido Tab sigue el orden normal', async () => {
    await abrirDesde();
    expect(tecla('Tab').defaultPrevented).toBeFalse();
  });

  it('Escape avisa al componente, que cierra, y el foco vuelve al disparador', async () => {
    await abrirDesde();
    const evento = tecla('Escape');
    await pintar();
    expect(evento.defaultPrevented).toBeTrue();
    expect(anfitrion.escapes).toBe(1);
    expect($('panel')).toBeNull();
    expect(activo()).toBe('disparador');
  });

  it('al desactivarse sin destruirse devuelve el foco y deja de atrapar Tab', async () => {
    await abrirDesde();
    anfitrion.activo.set(false);
    await pintar();
    expect(activo()).toBe('disparador');
    $('ultimo').focus();
    expect(tecla('Tab').defaultPrevented).toBeFalse();
  });

  it('no le quita el foco a un control que el usuario eligió fuera del panel', async () => {
    await abrirDesde();
    $('afuera').focus();
    anfitrion.abierto.set(false);
    await pintar();
    expect(activo()).toBe('afuera');
  });

  it('con siafFocoAtrapar en false entra el foco y Escape cierra, pero Tab puede salir', async () => {
    anfitrion.atrapar.set(false);
    await abrirDesde();
    expect(activo()).toBe('primero');
    $('ultimo').focus();
    expect(tecla('Tab').defaultPrevented).toBeFalse();
    tecla('Escape');
    await pintar();
    expect($('panel')).toBeNull();
    expect(activo()).toBe('disparador');
  });

  it('no cierra si un control interno ya atendió el Escape (preventDefault)', async () => {
    await abrirDesde();
    $('campo').addEventListener('keydown', (e) => e.preventDefault(), { once: true });
    $('campo').focus();
    tecla('Escape');
    await pintar();
    expect(anfitrion.escapes).toBe(0);
    expect($('panel')).not.toBeNull();
  });

  it('siafFocoSalida avisa solo cuando el foco se va a un control de afuera', async () => {
    anfitrion.atrapar.set(false);
    await abrirDesde();
    $('ultimo').focus();
    expect(anfitrion.salidas).toBe(0);
    $('afuera').focus();
    expect(anfitrion.salidas).toBe(1);
  });

  it('un desplegable que se cierra al salir con Tab no le devuelve el foco al disparador', async () => {
    anfitrion.atrapar.set(false);
    anfitrion.cerrarAlSalir.set(true);
    await abrirDesde();
    $('afuera').focus();
    expect($('panel')).toBeNull();
    expect(activo()).toBe('afuera');
  });

  it('un gemelo oculto por CSS, que nunca tuvo el foco, no lo devuelve al disparador cuando el panel se cierra al salir', async () => {
    anfitrion.atrapar.set(false);
    anfitrion.cerrarAlSalir.set(true);
    anfitrion.conGemelo.set(true);
    await abrirDesde();
    expect(activo()).toBe('primero');
    $('afuera').focus();
    expect($('panel')).toBeNull();
    expect($('gemelo')).toBeNull();
    expect(activo()).toBe('afuera');
  });

  it('también avisa la salida si el foco pasó por fuera de la página (Tab desde el último control) y volvió afuera', async () => {
    anfitrion.atrapar.set(false);
    anfitrion.cerrarAlSalir.set(true);
    await abrirDesde();
    $('ultimo').focus();
    // Tab desde el último control del documento: el foco va a la barra del navegador (sin relatedTarget).
    $('ultimo').blur();
    expect(anfitrion.salidas).toBe(0);
    $('afuera').focus();
    expect(anfitrion.salidas).toBe(1);
    expect($('panel')).toBeNull();
    expect(activo()).toBe('afuera');
  });

  it('un clic en una zona sin foco dentro del panel no cuenta como salida', async () => {
    anfitrion.atrapar.set(false);
    await abrirDesde();
    $('primero').blur();
    $('ultimo').focus();
    expect(anfitrion.salidas).toBe(0);
  });

  it('si el foco sale y vuelve a entrar, al cerrar sí lo devuelve al disparador', async () => {
    await abrirDesde();
    $('afuera').focus();
    $('primero').focus();
    anfitrion.abierto.set(false);
    await pintar();
    expect(activo()).toBe('disparador');
  });

  it('un panel dentro de otro: Escape cierra solo el interno y el foco vuelve a su disparador', async () => {
    await abrirDesde();
    // Un click programático no mueve el foco: se enfoca antes, como haría el usuario.
    $('ultimo').focus();
    $('ultimo').click();
    await pintar();
    expect(activo()).toBe('interno-boton');

    tecla('Escape');
    await pintar();
    expect($('interno')).toBeNull();
    expect($('panel')).not.toBeNull();
    expect(anfitrion.escapes).toBe(0);
    expect(activo()).toBe('ultimo');
  });
});
