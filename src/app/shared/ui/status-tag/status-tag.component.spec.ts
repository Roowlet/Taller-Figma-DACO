import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTagAppearance, StatusTagComponent, StatusTagSize, StatusTagTone } from './status-tag.component';

@Component({
  standalone: true,
  imports: [StatusTagComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<siaf-status-tag [tone]="tono()" [appearance]="apariencia()" [size]="tamano()" [icon]="icono()">Conciliado</siaf-status-tag>`,
})
class AnfitrionComponent {
  readonly tono = signal<StatusTagTone>('default');
  readonly apariencia = signal<StatusTagAppearance>('soft');
  readonly tamano = signal<StatusTagSize>('standard');
  readonly icono = signal('');
}

const TONOS: StatusTagTone[] = ['default', 'info', 'success', 'warning', 'danger'];

describe('StatusTagComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  let app: AnfitrionComponent;
  const etiqueta = (): HTMLElement => fixture.nativeElement.querySelector('siaf-status-tag > span');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    app = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it('solid (flow tags): fondo oscuro del tono, texto blanco y el borde de los estados', () => {
    app.apariencia.set('solid');
    for (const tono of TONOS) {
      app.tono.set(tono);
      fixture.detectChanges();
      expect(etiqueta().classList).withContext(tono).toContain(`bg-[var(--sys-color-bg-status-solid-${tono})]`);
      expect(etiqueta().classList).toContain('text-[var(--sys-color-text-brand-white)]');
      expect(etiqueta().classList).toContain('border-[var(--sys-color-border-states-enabled)]');
      expect(etiqueta().getAttribute('data-tono')).toBe(tono);
    }
  });

  it('soft (period, expediente y conciliación): fondo claro, borde y texto del tono', () => {
    for (const tono of TONOS) {
      app.tono.set(tono);
      fixture.detectChanges();
      for (const clase of [`bg-[var(--sys-color-bg-feedback-light-${tono})]`, `border-[var(--sys-color-border-feedback-${tono})]`, `text-[var(--sys-color-text-feedback-${tono})]`]) {
        expect(etiqueta().classList).withContext(`${tono}: ${clase}`).toContain(clase);
      }
    }
  });

  it('outline (status items): sin fondo, con el ícono relleno de 20 px en el color de ícono del tono', () => {
    app.apariencia.set('outline');
    app.tono.set('info');
    app.icono.set('send');
    fixture.detectChanges();

    expect(etiqueta().classList).toContain('bg-transparent');
    expect(etiqueta().classList).toContain('border-[var(--sys-color-border-feedback-info)]');
    const icono = etiqueta().querySelector<HTMLElement>('siaf-icon')!;
    expect(icono.textContent?.trim()).toBe('send');
    expect(icono.classList).toContain('text-[var(--sys-color-icon-feedback-light-info)]');
    expect(Math.round(icono.getBoundingClientRect().width)).toBe(20);
    expect(etiqueta().textContent).toContain('Conciliado');
  });

  it('sin icon no pinta ícono; en soft el ícono toma el color del texto', () => {
    expect(etiqueta().querySelector('siaf-icon')).toBeNull();
    app.icono.set('check_circle');
    fixture.detectChanges();
    expect(etiqueta().querySelector('siaf-icon')?.className).not.toContain('icon-feedback');
  });

  it('solid en oscuro: el texto blanco se lee (los fondos de feedback oscuro pasan a tintes claros en ese tema)', () => {
    const temaPrevio = document.documentElement.getAttribute('data-theme');
    const lum = (color: string): number => {
      const [r, g, b] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => {
        const c = Number(v) / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    try {
      document.documentElement.setAttribute('data-theme', 'dark');
      app.apariencia.set('solid');
      for (const tono of TONOS) {
        app.tono.set(tono);
        fixture.detectChanges();
        const estilo = getComputedStyle(etiqueta());
        const [claro, oscuro] = [lum(estilo.color), lum(estilo.backgroundColor)].sort((a, b) => b - a);
        expect((claro + 0.05) / (oscuro + 0.05)).withContext(tono).toBeGreaterThanOrEqual(4.5);
      }
    } finally {
      if (temaPrevio === null) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', temaPrevio);
    }
  });

  it('mide 32 px en standard y 24 px en small, con texto de 12 px y esquinas de 4 px, también con ícono', () => {
    app.icono.set('check_circle');
    fixture.detectChanges();
    expect(etiqueta().getBoundingClientRect().height).toBe(32);
    expect(getComputedStyle(etiqueta()).fontSize).toBe('12px');
    expect(getComputedStyle(etiqueta()).borderTopLeftRadius).toBe('4px');

    app.tamano.set('small');
    fixture.detectChanges();
    expect(etiqueta().getBoundingClientRect().height).toBe(24);
  });
});
