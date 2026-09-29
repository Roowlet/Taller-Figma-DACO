import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, OnChanges, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { Chart } from 'chart.js';
import type { ActiveDataPoint, ChartData, ChartOptions, ChartType, Element, Plugin, Scale, TooltipModel } from 'chart.js';

import type { ChartLegendItem } from '../chart-legend/chart-legend.component';
import type { ChartTooltipItem } from '../chart-tooltip/chart-tooltip.component';
import { alCambiarTema, colorDeToken, formatearValor } from './chart-tema';

export interface ChartSeries {
  name: string;
  /** Un valor por categoría, en el mismo orden que `categories`. */
  values: readonly number[];
}

/** Serie tal como la pinta un gráfico: nombre, un valor por categoría (`null`: sin barra ni punto) y token de color. */
export interface SerieDibujada {
  name: string;
  values: readonly (number | null | undefined)[];
  token: string;
}

/** Tooltip visible: el punto donde se apoya (centro de su borde de abajo), el título y una fila por serie con valor. */
export interface TooltipDelGrafico {
  x: number;
  y: number;
  /** Categoría activa. */
  indice: number;
  titulo: string;
  items: ChartTooltipItem[];
}

export const tieneValor = (valor: number | null | undefined): valor is number => valor !== null && valor !== undefined && !Number.isNaN(valor);

/**
 * `afterFit` de los ejes, para que el gráfico llegue al borde de su relleno como en el Figma. Chart.js reserva la
 * separación de las etiquetas (`ticks.padding`) dos veces, una a cada lado, y en un eje vertical la suma además arriba
 * y abajo: dejaba ~19 px vacíos sobre el gráfico y 12 px bajo las etiquetas del eje horizontal. Se descuenta después de
 * medir; entre las etiquetas y el gráfico siguen quedando esos 12 px.
 */
export function ajustarEje(eje: Scale): void {
  const marcas = (eje.options as { ticks?: { padding?: number; display?: boolean } }).ticks;
  // Sin etiquetas visibles, Chart.js no reservó la separación: no hay nada que descontar.
  if (marcas?.display === false) return;
  const separacion = Number(marcas?.padding) || 0;
  if (eje.isHorizontal()) {
    eje.height = Math.max(0, eje.height - separacion);
    return;
  }
  eje.width = Math.max(0, eje.width - separacion);
  eje.paddingTop = Math.max(0, eje.paddingTop - separacion);
  eje.paddingBottom = Math.max(0, eje.paddingBottom - separacion);
}

/**
 * Dónde apoyar el tooltip: centrado sobre los elementos activos y arriba del más alto. De una barra vertical toma su
 * extremo de arriba; de una horizontal, su centro y su borde de arriba; de un punto de la línea, su radio al activarse.
 */
function anclaDe(elementos: readonly Element[]): { x: number; y: number } {
  const bordes = elementos.map((elemento) => {
    const { x, y, base, height, horizontal } = elemento.getProps(['x', 'y', 'base', 'height', 'horizontal'], true);
    if (horizontal) return { x: (x + base) / 2, y: y - height / 2 };
    if (typeof base === 'number') return { x, y: Math.min(y, base) };
    return { x, y: y - ((elemento.options as { hoverRadius?: number } | undefined)?.hoverRadius ?? 0) };
  });
  return {
    x: bordes.reduce((suma, borde) => suma + borde.x, 0) / (bordes.length || 1),
    y: Math.min(...bordes.map((borde) => borde.y)),
  };
}

/**
 * Comportamiento común de los gráficos del kit dibujados con Chart.js (`siaf-bar-chart`, `siaf-line-chart`,
 * `siaf-diverging-chart` y `siaf-donut-chart`): crea el gráfico en el lienzo `#lienzo` de la plantilla, lo repinta al cambiar las entradas o
 * el tema, lo destruye con el componente, recorre las categorías con el teclado y alimenta el tooltip, el anuncio
 * `aria-live`, la leyenda y la tabla de datos. Cada gráfico declara sus entradas, su plantilla y sus opciones de
 * Chart.js; las fichas del catálogo salen de ahí.
 */
@Directive()
export abstract class GraficoBase<TTipo extends ChartType> implements AfterViewInit, OnChanges, OnDestroy {
  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documento = inject(DOCUMENT);

  @ViewChild('lienzo', { static: true }) private lienzo!: ElementRef<HTMLCanvasElement>;

  readonly tooltip = signal<TooltipDelGrafico | null>(null);
  readonly anuncio = signal('');

  /** Sufijo de los valores en el eje, el tooltip y la tabla (por ejemplo `%`). */
  abstract valueSuffix: string;
  /** Etiquetas de las categorías, en el orden en que las recorre el teclado. */
  abstract get etiquetas(): readonly string[];
  /** Series que pinta, con su color: arman la leyenda, el tooltip, el anuncio y la tabla de datos. */
  abstract get seriesDibujadas(): readonly SerieDibujada[];

  protected abstract readonly tipo: TTipo;
  /** Las categorías van en el eje vertical: el teclado las recorre con las flechas arriba y abajo. */
  protected abstract get categoriasEnVertical(): boolean;
  protected abstract datos(): ChartData<TTipo>;
  protected abstract opciones(): ChartOptions<TTipo>;

  private grafico: Chart<TTipo> | null = null;
  private dejarDeObservarTema: (() => void) | null = null;
  private activo = -1;

  get leyenda(): ChartLegendItem[] {
    return this.seriesDibujadas.map((serie) => ({ label: serie.name, token: serie.token }));
  }

  valor(serie: SerieDibujada, indice: number): string {
    return formatearValor(serie.values[indice], this.valueSuffix);
  }

  ngAfterViewInit(): void {
    this.grafico = new Chart(this.lienzo.nativeElement, {
      type: this.tipo,
      data: this.datos(),
      options: this.opciones(),
      plugins: this.complementos(),
    });
    this.dejarDeObservarTema = alCambiarTema(this.documento, () => this.repintar());
  }

  ngOnChanges(): void {
    this.repintar();
  }

  ngOnDestroy(): void {
    this.dejarDeObservarTema?.();
    this.grafico?.destroy();
    this.grafico = null;
  }

  alTeclado(evento: KeyboardEvent): void {
    const total = this.totalPosiciones;
    if (!this.grafico || !this.seriesDibujadas.length || !total) return;
    const vertical = this.categoriasEnVertical;
    let indice: number;
    switch (evento.key) {
      case vertical ? 'ArrowDown' : 'ArrowRight':
        indice = this.activo < 0 ? 0 : (this.activo + 1) % total;
        break;
      case vertical ? 'ArrowUp' : 'ArrowLeft':
        indice = this.activo < 0 ? total - 1 : (this.activo - 1 + total) % total;
        break;
      case 'Home':
        indice = 0;
        break;
      case 'End':
        indice = total - 1;
        break;
      case 'Escape':
        // Sin preventDefault: el panel que contiene al gráfico también recibe la tecla.
        this.ocultarTooltip();
        return;
      default:
        return;
    }
    evento.preventDefault();
    this.activar(indice);
  }

  ocultarTooltip(): void {
    this.activo = -1;
    this.tooltip.set(null);
    const grafico = this.grafico;
    if (!grafico) return;
    grafico.setActiveElements([]);
    grafico.tooltip?.setActiveElements([], { x: 0, y: 0 });
    grafico.update('none');
  }

  /** Cuántas posiciones recorre el teclado: por defecto, las categorías. */
  protected get totalPosiciones(): number {
    return this.etiquetas.length;
  }

  /** Lo que se activa al llegar con el teclado a la posición `posicion`: por defecto, cada serie con valor en esa categoría. */
  protected activosEn(posicion: number): ActiveDataPoint[] {
    return this.seriesDibujadas.flatMap((serie, datasetIndex) => (tieneValor(serie.values[posicion]) ? [{ datasetIndex, index: posicion }] : []));
  }

  /** Complementos de Chart.js propios del gráfico, como los rótulos dentro de los tramos de la barra apilada. */
  protected complementos(): Plugin<TTipo>[] {
    return [];
  }

  /** Lo que anuncia la región `aria-live` al llegar con el teclado a la posición `indice` (por defecto, una categoría). */
  protected textoDelAnuncio(indice: number): string {
    const series = this.seriesDibujadas.filter((serie) => tieneValor(serie.values[indice]));
    const texto = series.length ? series.map((serie) => `${serie.name} ${this.valor(serie, indice)}`).join(', ') : 'sin datos';
    return this.etiquetas[indice] ? `${this.etiquetas[indice]}: ${texto}` : texto;
  }

  /** Color calculado de un token en el tema vigente. */
  protected colorDe(token: string): string {
    return colorDeToken(this.host.nativeElement, token);
  }

  /** Estilo de los ejes del Figma, leído del tema vigente: marcas `text-neutral-low` de 12 px y grilla `divider-default`. */
  protected estiloDeEjes(): { colorTexto: string; colorGrilla: string; fuente: { family: string; size: number } } {
    return {
      colorTexto: this.colorDe('--sys-color-text-neutral-low'),
      colorGrilla: this.colorDe('--sys-color-divider-default'),
      fuente: { family: getComputedStyle(this.host.nativeElement).fontFamily, size: 12 },
    };
  }

  /** Opciones que comparten todos: ocupan su contenedor, sin animación, y con la leyenda y el tooltip del kit. */
  protected opcionesComunes() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      // Sin animación (el Figma no la define): Chart.js dibuja en el acto al crear, redimensionar o cambiar de tema.
      // Con animación, en una pestaña que no pinta cuadros las barras quedaban a medio camino de su posición.
      animation: false as const,
      // Al cambiar el tamaño del lienzo (se abre un panel, se oculta el contenedor) el tooltip queda con posiciones
      // viejas: Chart.js repite el último evento del puntero y lo dejaba en x = 0. Se oculta; el puntero lo vuelve a mostrar.
      onResize: () => this.ocultarTooltip(),
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false, external: ({ tooltip }: { tooltip: TooltipModel<TTipo> }) => this.alMoverTooltip(tooltip) },
      },
    };
  }

  private activar(indice: number): void {
    const grafico = this.grafico!;
    this.activo = indice;
    const activos = this.activosEn(indice);
    const elementos = activos.map(({ datasetIndex, index }) => grafico.getDatasetMeta(datasetIndex).data[index]).filter((elemento): elemento is Element => !!elemento);
    grafico.setActiveElements(activos);
    grafico.tooltip?.setActiveElements(activos, anclaDe(elementos));
    grafico.update('none');
    this.anuncio.set(this.textoDelAnuncio(indice));
  }

  private repintar(): void {
    const grafico = this.grafico;
    if (!grafico) return;
    this.ocultarTooltip();
    grafico.data = this.datos();
    grafico.options = this.opciones();
    grafico.update('none');
  }

  private alMoverTooltip(modelo: TooltipModel<TTipo>): void {
    const puntos = (modelo.dataPoints ?? []).filter((punto) => tieneValor(punto.raw as number | null));
    if (!modelo.opacity || !puntos.length) {
      this.tooltip.set(null);
      return;
    }
    const indice = puntos[0].dataIndex;
    this.tooltip.set({
      ...anclaDe(puntos.map((punto) => punto.element)),
      indice,
      titulo: this.etiquetas[indice] ?? '',
      items: puntos.map((punto) => {
        const serie = this.seriesDibujadas[punto.datasetIndex];
        return { label: serie?.name ?? '', value: formatearValor(Number(punto.raw), this.valueSuffix), token: serie?.token ?? '' };
      }),
    });
  }
}
