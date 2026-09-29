import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Chart } from 'chart.js';
import type { ChartDataset } from 'chart.js';

import { ChartSeries } from '../charts/grafico-base';
import { BarChartComponent, BarChartOrientation } from './bar-chart.component';

@Component({
  standalone: true,
  imports: [BarChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-bar-chart
      [categories]="categorias()"
      [series]="series()"
      [orientation]="orientacion()"
      [stacked]="apilado()"
      valueSuffix="%"
      ariaLabel="Variación por mes"
      categoryLabel="Mes"
    />
  `,
})
class AnfitrionComponent {
  readonly categorias = signal<string[]>(['Ene', 'Feb', 'Mar']);
  readonly series = signal<ChartSeries[]>([
    { name: 'Activos', values: [10, 20.5, 30] },
    { name: 'Existencias', values: [15, 25, 35] },
  ]);
  readonly orientacion = signal<BarChartOrientation>('vertical');
  readonly apilado = signal(false);
}

describe('BarChartComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  let temaPrevio: string | null;
  const q = <T extends HTMLElement>(selector: string): T | null => fixture.nativeElement.querySelector(selector);
  const lienzo = (): HTMLCanvasElement => q<HTMLCanvasElement>('canvas')!;
  const grafico = (): Chart => Chart.getChart(lienzo())!;
  /** Opciones resueltas de un eje, sin la unión de tipos de todas las escalas de Chart.js. */
  const eje = (id: string) => (grafico().options.scales as Record<string, { stacked?: boolean | string; display?: boolean | string; max?: number }>)[id];
  const tecla = (key: string): KeyboardEvent => {
    const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    lienzo().dispatchEvent(evento);
    fixture.detectChanges();
    return evento;
  };
  const colorDe = (token: string): string => {
    const sonda = document.createElement('span');
    sonda.style.color = `var(${token})`;
    document.body.appendChild(sonda);
    const color = getComputedStyle(sonda).color;
    sonda.remove();
    return color;
  };

  beforeEach(async () => {
    temaPrevio = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
    if (temaPrevio === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', temaPrevio);
  });

  it('dibuja un gráfico de barras de Chart.js con una serie por conjunto y los colores de la paleta del kit', () => {
    const g = grafico();
    expect((g.config as { type: string }).type).toBe('bar');
    expect(g.data.labels).toEqual(['Ene', 'Feb', 'Mar']);
    expect(g.data.datasets.map((d) => d.label)).toEqual(['Activos', 'Existencias']);
    expect(g.data.datasets[0].backgroundColor).toBe(colorDe('--sys-color-bg-brand-primary'));
    expect(g.data.datasets[1].backgroundColor).toBe(colorDe('--sys-color-bg-brand-secondary'));
    expect(g.options.indexAxis).toBe('x');
  });

  it('horizontal pone las categorías en el eje vertical', () => {
    fixture.componentInstance.orientacion.set('horizontal');
    fixture.detectChanges();
    expect(grafico().options.indexAxis).toBe('y');
  });

  it('con una sola categoría, o ninguna, es el comparativo: series lado a lado sin etiqueta de categoría', () => {
    fixture.componentInstance.categorias.set([]);
    fixture.componentInstance.series.set([
      { name: 'Activos', values: [225] },
      { name: 'Existencias', values: [350] },
      { name: 'Patrimonio', values: [265] },
    ]);
    fixture.detectChanges();
    const g = grafico();
    expect(g.data.labels).toEqual(['']);
    expect(g.options.scales?.['x']?.ticks?.display).toBeFalse();
    expect(g.data.datasets[2].backgroundColor).toBe(colorDe('--sys-color-bg-feedback-dark-success'));
  });

  it('apilado: las series se apilan en los dos ejes, en tramos rectos con 2 px de aire y el porcentaje de cada tramo', () => {
    fixture.componentInstance.apilado.set(true);
    fixture.detectChanges();
    const g = grafico();
    expect(eje('x').stacked).toBeTrue();
    expect(eje('y').stacked).toBeTrue();
    const [abajo, arriba] = g.data.datasets as ChartDataset<'bar'>[];
    expect(abajo.borderRadius).toBe(0);
    expect(abajo.borderWidth).withContext('aire hacia el tramo de arriba').toEqual({ top: 2, right: 0, bottom: 0, left: 0 });
    expect(arriba.borderWidth).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(g.config.plugins?.some((complemento) => complemento.id === 'siafTramosApilados')).toBeTrue();

    const barras = fixture.debugElement.query(By.directive(BarChartComponent)).componentInstance as BarChartComponent;
    expect(barras.textoDeTramo(0, 0)).withContext('Ene: 10 de 25').toBe('40.0%');
    expect(barras.textoDeTramo(1, 0)).toBe('60.0%');
  });

  it('apilado con una sola categoría es la barra 100 % del Figma: horizontal, sin ejes y de borde a borde', () => {
    fixture.componentInstance.categorias.set([]);
    fixture.componentInstance.series.set([
      { name: 'Activos', values: [38] },
      { name: 'Patrimonio', values: [62] },
    ]);
    fixture.componentInstance.apilado.set(true);
    fixture.detectChanges();
    const g = grafico();
    expect(g.options.indexAxis).toBe('y');
    expect(eje('x').display).toBeFalse();
    expect(eje('y').display).toBeFalse();
    expect(eje('x').max).toBe(100);
    expect(g.getDatasetMeta(0).data[0].getProps(['base'], true)['base']).toBeCloseTo(g.chartArea.left, 0);
    expect(g.getDatasetMeta(1).data[0].x).toBeCloseTo(g.chartArea.right, 0);

    const barras = fixture.debugElement.query(By.directive(BarChartComponent)).componentInstance as BarChartComponent;
    expect(barras.barraUnica).toBeTrue();
    expect(barras.comparativo).toBeFalse();
    expect(barras.textoDeTramo(0, 0)).toBe('38.0%');
  });

  it('comparativo: el tooltip muestra solo la barra más cercana al puntero y el teclado recorre las barras de a una', async () => {
    fixture.componentInstance.categorias.set([]);
    fixture.componentInstance.series.set([
      { name: 'Activos', values: [225] },
      { name: 'Existencias', values: [350] },
      { name: 'Patrimonio', values: [265] },
    ]);
    fixture.detectChanges();
    const textoDelTooltip = (): string =>
      Array.from(fixture.nativeElement.querySelectorAll('siaf-chart-tooltip p'))
        .map((parrafo) => (parrafo as HTMLElement).textContent?.replace(/\s+/g, ' ').trim())
        .join(' | ');

    const barra = grafico().getDatasetMeta(1).data[0];
    const caja = lienzo().getBoundingClientRect();
    lienzo().dispatchEvent(new MouseEvent('mousemove', { clientX: caja.left + barra.x, clientY: caja.top + barra.y + 10, bubbles: true }));
    await new Promise((resolver) => requestAnimationFrame(() => setTimeout(resolver)));
    fixture.detectChanges();
    expect(textoDelTooltip()).withContext('puntero sobre Existencias').toBe('Existencias: 350%');

    lienzo().focus();
    tecla('ArrowRight');
    expect(textoDelTooltip()).toBe('Activos: 225%');
    expect(q('[aria-live="polite"]')?.textContent?.trim()).toBe('Activos 225%');
    tecla('ArrowRight');
    expect(textoDelTooltip()).toBe('Existencias: 350%');
    tecla('ArrowLeft');
    tecla('ArrowLeft');
    expect(textoDelTooltip()).withContext('da la vuelta a la última barra').toBe('Patrimonio: 265%');
  });

  it('muestra la leyenda y una tabla de datos oculta con los valores formateados', () => {
    const leyenda = Array.from(fixture.nativeElement.querySelectorAll('siaf-chart-legend li')).map((li) => (li as HTMLElement).textContent?.trim());
    expect(leyenda).toEqual(['Activos', 'Existencias']);

    const tabla = q<HTMLTableElement>('table')!;
    expect(tabla.parentElement?.classList).toContain('sr-only');
    expect(tabla.caption?.textContent?.trim()).toBe('Variación por mes');
    const celdas = (fila: Element): string[] => Array.from(fila.children).map((celda) => celda.textContent?.trim() ?? '');
    expect(celdas(tabla.tHead!.rows[0])).toEqual(['Mes', 'Activos', 'Existencias']);
    expect(celdas(tabla.tBodies[0].rows[1])).toEqual(['Feb', '20.5%', '25%']);
    expect(lienzo().getAttribute('role')).toBe('img');
    expect(lienzo().getAttribute('aria-label')).toBe('Variación por mes');
  });

  it('teclado: las flechas recorren las categorías, muestran el tooltip y lo anuncian; Escape lo oculta', () => {
    lienzo().focus();
    expect(tecla('ArrowRight').defaultPrevented).toBeTrue();
    const tooltip = (): string =>
      Array.from(fixture.nativeElement.querySelectorAll('siaf-chart-tooltip p'))
        .map((parrafo) => (parrafo as HTMLElement).textContent?.replace(/\s+/g, ' ').trim())
        .join(' | ');
    expect(tooltip()).toBe('Ene | Activos: 10% | Existencias: 15%');
    expect(q('[aria-live="polite"]')?.textContent?.trim()).toBe('Ene: Activos 10%, Existencias 15%');

    // Desde la primera, flecha izquierda da la vuelta a la última.
    tecla('ArrowLeft');
    expect(tooltip()).toContain('Mar');
    tecla('ArrowLeft');
    expect(tooltip()).toContain('Feb');
    tecla('Home');
    expect(tooltip()).toContain('Ene');
    tecla('End');
    expect(tooltip()).toContain('Mar');

    const escape = tecla('Escape');
    expect(escape.defaultPrevented).withContext('el panel que lo contiene también recibe Escape').toBeFalse();
    expect(q('siaf-chart-tooltip')).toBeNull();
  });

  it('al cambiar el tamaño del lienzo oculta el tooltip en vez de dejarlo con posiciones viejas', () => {
    lienzo().focus();
    tecla('ArrowRight');
    expect(q('siaf-chart-tooltip')).not.toBeNull();
    grafico().resize(300, 200);
    fixture.detectChanges();
    expect(q('siaf-chart-tooltip')).toBeNull();
  });

  it('al cambiar de tema vuelve a leer los colores de la paleta', async () => {
    const claro = grafico().data.datasets[0].backgroundColor;
    document.documentElement.setAttribute('data-theme', 'dark');
    await new Promise((resolver) => setTimeout(resolver));
    const oscuro = colorDe('--sys-color-bg-brand-primary');
    expect(oscuro).not.toBe(claro as string);
    expect(grafico().data.datasets[0].backgroundColor).toBe(oscuro);
  });

  it('destruye el gráfico de Chart.js junto con el componente', () => {
    const canvas = lienzo();
    fixture.destroy();
    expect(Chart.getChart(canvas)).toBeUndefined();
  });
});
