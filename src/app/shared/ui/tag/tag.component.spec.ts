import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagComponent, TagSize, TagVariant } from './tag.component';

@Component({
  standalone: true,
  imports: [TagComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-tag
      [variant]="variante()"
      [size]="tamano()"
      [selected]="elegido()"
      [disabled]="deshabilitado()"
      [dragged]="arrastrado()"
      [icon]="icono()"
      [removable]="quitable()"
      [expanded]="expandido()"
      removeLabel="Quitar filtro Estado"
      (removed)="quitados.set(quitados() + 1)"
      (selectedChange)="anotarCambio($event)"
      (clicked)="pulsados.set(pulsados() + 1)"
      (click)="clicsDelPadre.set(clicsDelPadre() + 1)"
    >Estado: Aprobado</siaf-tag>
  `,
})
class AnfitrionComponent {
  readonly variante = signal<TagVariant>('input');
  readonly tamano = signal<TagSize>('standard');
  readonly elegido = signal(false);
  readonly deshabilitado = signal(false);
  readonly arrastrado = signal(false);
  readonly icono = signal('');
  readonly quitable = signal(false);
  readonly expandido = signal<boolean | null>(null);
  readonly quitados = signal(0);
  readonly cambios = signal<boolean[]>([]);
  readonly pulsados = signal(0);
  readonly clicsDelPadre = signal(0);

  anotarCambio(elegido: boolean): void {
    this.cambios.update((cambios) => [...cambios, elegido]);
  }
}

type Rgba = [number, number, number, number];

const canales = (color: string): Rgba => {
  const [r, g, b, a = 1] = (color.match(/[\d.]+/g) ?? []).map(Number);
  return [r, g, b, a];
};

/** `frente` (con su transparencia) sobre un fondo opaco. */
const mezclar = ([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba => [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];

const contraste = (uno: Rgba, otro: Rgba): number => {
  const luminancia = ([r, g, b]: Rgba): number => {
    const [lr, lg, lb] = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };
  const [claro, oscuro] = [luminancia(uno), luminancia(otro)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
};

describe('TagComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  let app: AnfitrionComponent;
  let sinTransiciones: HTMLStyleElement;
  let temaPrevio: string | null;
  const q = <T extends HTMLElement = HTMLElement>(selector: string): T | null => (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
  const caja = (): HTMLElement => q('siaf-tag > span')!;
  /** Los íconos se pintan como ligaduras: su texto es el nombre. */
  const iconos = (): string[] => Array.from(caja().querySelectorAll('siaf-icon')).map((icono) => icono.textContent?.trim() ?? '');
  const pintar = (cambios: () => void): void => {
    cambios();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    temaPrevio = document.documentElement.getAttribute('data-theme');
    // `transition-colors` arranca del color anterior: se apaga para leer el estado final.
    sinTransiciones = document.createElement('style');
    sinTransiciones.textContent = '*, *::before, *::after { transition: none !important; }';
    document.head.appendChild(sinTransiciones);

    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    app = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
    sinTransiciones.remove();
    if (temaPrevio === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', temaPrevio);
  });

  it('input: es texto, sin botón; con removable, la × nombrada emite removed sin llegar al click del padre', () => {
    expect(q('[data-tag-boton]')).toBeNull();
    expect(q('[data-tag-quitar]')).toBeNull();
    expect(caja().textContent).toContain('Estado: Aprobado');

    pintar(() => app.quitable.set(true));
    const quitar = q<HTMLButtonElement>('[data-tag-quitar]')!;
    expect(quitar.getAttribute('aria-label')).toBe('Quitar filtro Estado');
    quitar.click();
    expect(app.quitados()).toBe(1);
    expect(app.clicsDelPadre()).toBe(0);

    pintar(() => app.deshabilitado.set(true));
    expect(q('[data-tag-quitar]')).toBeNull();
  });

  it('choice: aria-pressed sigue a selected y pulsarlo pide el estado contrario; sin ×, y deshabilitado no emite', () => {
    pintar(() => {
      app.variante.set('choice');
      app.quitable.set(true);
    });
    const boton = q<HTMLButtonElement>('[data-tag-boton]')!;
    expect(q('[data-tag-quitar]')).toBeNull();
    expect(boton.getAttribute('aria-pressed')).toBe('false');
    boton.click();
    expect(app.cambios()).toEqual([true]);
    expect(app.pulsados()).toBe(1);

    pintar(() => app.elegido.set(true));
    expect(boton.getAttribute('aria-pressed')).toBe('true');
    expect(caja().getAttribute('data-elegido')).toBe('true');
    boton.click();
    expect(app.cambios()).toEqual([true, false]);

    pintar(() => app.deshabilitado.set(true));
    expect(boton.disabled).toBeTrue();
    boton.click();
    expect(app.cambios()).toEqual([true, false]);
    expect(app.pulsados()).toBe(2);
  });

  it('filter: la flecha gira con expanded, el check aparece al elegir y la × reemplaza a la flecha', () => {
    pintar(() => app.variante.set('filter'));
    const boton = q<HTMLButtonElement>('[data-tag-boton]')!;
    expect(boton.hasAttribute('aria-haspopup')).toBeFalse();
    expect(boton.hasAttribute('aria-expanded')).toBeFalse();
    expect(iconos()).toEqual(['expand_more']);

    pintar(() => app.expandido.set(true));
    expect(boton.getAttribute('aria-haspopup')).toBe('menu');
    expect(boton.getAttribute('aria-expanded')).toBe('true');
    expect(iconos()).toEqual(['expand_less']);

    pintar(() => {
      app.expandido.set(false);
      app.elegido.set(true);
    });
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    expect(iconos()).toEqual(['check', 'expand_more']);

    pintar(() => app.quitable.set(true));
    expect(iconos()).toEqual(['check', 'close']);
    expect(q('[data-tag-quitar]')!.closest('[data-tag-boton]')).withContext('la × no va dentro del botón').toBeNull();

    pintar(() => {
      app.quitable.set(false);
      app.deshabilitado.set(true);
    });
    expect(iconos()).toEqual(['check']);
  });

  it('action: no se elige ni se quita, y pulsarlo emite clicked', () => {
    pintar(() => {
      app.variante.set('action');
      app.icono.set('check');
      app.elegido.set(true);
      app.quitable.set(true);
    });
    const boton = q<HTMLButtonElement>('[data-tag-boton]')!;
    expect(boton.hasAttribute('aria-pressed')).toBeFalse();
    expect(caja().getAttribute('data-elegido')).toBe('false');
    expect(q('[data-tag-quitar]')).toBeNull();
    expect(iconos()).toEqual(['check']);

    boton.click();
    expect(app.pulsados()).toBe(1);
    expect(app.cambios()).toEqual([]);
  });

  it('mide 32 px en standard y 24 px en small, con esquinas de 8 px, 8 px a los lados, íconos de 20 px y texto de 14 px (12 px en choice)', () => {
    pintar(() => {
      app.variante.set('filter');
      app.elegido.set(true);
    });
    const estilo = getComputedStyle(caja());
    expect(caja().getBoundingClientRect().height).toBe(32);
    expect(estilo.borderTopLeftRadius).toBe('8px');
    expect(estilo.borderTopWidth).toBe('1px');
    expect(estilo.fontSize).toBe('14px');
    expect(getComputedStyle(q('[data-tag-boton]')!).paddingLeft).toBe('8px');
    for (const icono of Array.from(caja().querySelectorAll('siaf-icon'))) {
      expect(Math.round(icono.getBoundingClientRect().width)).toBe(20);
    }

    pintar(() => app.tamano.set('small'));
    expect(caja().getBoundingClientRect().height).toBe(24);

    pintar(() => app.variante.set('choice'));
    expect(getComputedStyle(caja()).fontSize).toBe('12px');
  });

  it('arrastrado pinta la sombra «Elevation 1»; deshabilitado manda sobre arrastrado y apaga el texto', () => {
    pintar(() => app.arrastrado.set(true));
    expect(caja().classList).toContain('shadow-siaf-elevation-1');
    expect(getComputedStyle(caja()).boxShadow).not.toBe('none');

    pintar(() => app.deshabilitado.set(true));
    expect(caja().classList).not.toContain('shadow-siaf-elevation-1');
    expect(caja().classList).toContain('text-[var(--sys-color-text-neutral-disabled)]');
  });

  it('el texto contrasta al menos 4.5:1 sin elegir y elegido, en claro y en oscuro', () => {
    const sonda = document.createElement('span');
    document.body.appendChild(sonda);
    try {
      for (const tema of ['light', 'dark']) {
        document.documentElement.setAttribute('data-theme', tema);
        sonda.style.color = 'var(--sys-color-bg-surfaces-surface)';
        const superficie = canales(getComputedStyle(sonda).color);
        for (const elegido of [false, true]) {
          pintar(() => app.elegido.set(elegido));
          const estilo = getComputedStyle(caja());
          const fondo = mezclar(canales(estilo.backgroundColor), superficie);
          const texto = mezclar(canales(estilo.color), fondo);
          expect(contraste(texto, fondo)).withContext(`${tema}, elegido: ${elegido}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    } finally {
      sonda.remove();
    }
  });
});
