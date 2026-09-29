import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { BarChartComponent } from '../../../shared/ui/bar-chart/bar-chart.component';
import { ChartLegendComponent, ChartLegendItem } from '../../../shared/ui/chart-legend/chart-legend.component';
import { ChartSectionComponent } from '../../../shared/ui/chart-section/chart-section.component';
import { ChartTooltipComponent, ChartTooltipItem } from '../../../shared/ui/chart-tooltip/chart-tooltip.component';
import { tokenDeSerie } from '../../../shared/ui/charts/chart-tema';
import { ChartSeries } from '../../../shared/ui/charts/grafico-base';
import { DivergingChartComponent } from '../../../shared/ui/diverging-chart/diverging-chart.component';
import { DonutChartComponent } from '../../../shared/ui/donut-chart/donut-chart.component';
import { KpiCardComponent } from '../../../shared/ui/kpi-card/kpi-card.component';
import { LineChartComponent } from '../../../shared/ui/line-chart/line-chart.component';

/** Ejemplos en vivo de la categoría Gráficos, con los datos de muestra del Figma («Graphics»). */
@Component({
  selector: 'ui-kit-ejemplos-graficos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BarChartComponent,
    ChartLegendComponent,
    ChartSectionComponent,
    ChartTooltipComponent,
    DivergingChartComponent,
    DonutChartComponent,
    KpiCardComponent,
    LineChartComponent,
  ],
  template: `
    @switch (selector) {
      @case ('siaf-chart-section') {
        <siaf-chart-section title="Evolución comparada" description="Crecimiento acumulado de recaudación">
          <siaf-bar-chart [categories]="meses" [series]="activos" ariaLabel="Activos por mes" categoryLabel="Mes" />
        </siaf-chart-section>
      }
      @case ('siaf-kpi-card') {
        <div class="grid gap-4 sm:grid-cols-2">
          <siaf-kpi-card title="Total Activos" amount="$1,245,800.00" [progress]="80" />
          <siaf-kpi-card title="Patrimonio" amount="$845,300.00" [progress]="62" tone="success" />
          <siaf-kpi-card title="Pasivos por vencer" amount="$120,450.00" [progress]="35" tone="warning" icon="schedule" />
          <siaf-kpi-card title="Documentos observados" amount="18" [progress]="15" tone="danger" icon="error_outline" />
        </div>
      }
      @case ('siaf-bar-chart') {
        <div class="flex flex-col gap-6">
          <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Simple · vertical</p>
          <siaf-bar-chart [categories]="meses" [series]="activos" ariaLabel="Activos por mes" categoryLabel="Mes" />
          <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Agrupado · dos series</p>
          <siaf-bar-chart [categories]="meses" [series]="activosYExistencias" ariaLabel="Activos y existencias por mes" categoryLabel="Mes" />
          <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Horizontal · porcentaje</p>
          <siaf-bar-chart [categories]="mesesHorizontal" [series]="variacion" orientation="horizontal" valueSuffix="%" ariaLabel="Variación de activos por mes" categoryLabel="Mes" />
          <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Comparativo · cuatro series</p>
          <siaf-bar-chart [series]="comparativo" ariaLabel="Activos, existencias, patrimonio y pasivos" />
          <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Apilado · barra 100 %</p>
          <siaf-bar-chart [series]="composicion" [stacked]="true" ariaLabel="Composición de activos y patrimonio" />
          <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Apilado · por mes</p>
          <siaf-bar-chart [categories]="meses" [series]="activosYExistencias" [stacked]="true" ariaLabel="Activos y existencias apilados por mes" categoryLabel="Mes" />
        </div>
      }
      @case ('siaf-line-chart') {
        <div class="flex flex-col gap-6">
          <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Dos series · rango del Figma</p>
          <siaf-line-chart [categories]="semestre" [series]="evolucion" [max]="500" ariaLabel="Activos y existencias por mes" categoryLabel="Mes" />
          <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Una serie · porcentaje con rango automático</p>
          <siaf-line-chart [categories]="mesesHorizontal" [series]="variacion" valueSuffix="%" ariaLabel="Variación de activos por mes" categoryLabel="Mes" />
        </div>
      }
      @case ('siaf-diverging-chart') {
        <siaf-diverging-chart
          [categories]="mesesHorizontal"
          [values]="variacionExistencias"
          negativeLabel="Disminución"
          positiveLabel="Aumento"
          valueSuffix="%"
          ariaLabel="Variación de existencias por mes"
          categoryLabel="Mes"
        />
      }
      @case ('siaf-donut-chart') {
        <siaf-donut-chart [categories]="rubros" [values]="balance" ariaLabel="Composición del balance" categoryLabel="Rubro" />
      }
      @case ('siaf-chart-legend') {
        <siaf-chart-legend [items]="leyenda" />
      }
      @case ('siaf-chart-tooltip') {
        <siaf-chart-tooltip class="w-fit" title="Mar" [items]="tooltip" />
      }
    }
  `,
})
export class EjemplosGraficosComponent {
  static readonly selectores = [
    'siaf-chart-section',
    'siaf-kpi-card',
    'siaf-bar-chart',
    'siaf-line-chart',
    'siaf-diverging-chart',
    'siaf-donut-chart',
    'siaf-chart-legend',
    'siaf-chart-tooltip',
  ];
  @Input({ required: true }) selector!: string;

  readonly meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May'];
  readonly mesesHorizontal = ['Feb', 'Mar', 'Abr', 'May', 'Jun'];
  readonly activos: ChartSeries[] = [{ name: 'Activos', values: [225, 300, 350, 320, 270] }];
  readonly activosYExistencias: ChartSeries[] = [
    { name: 'Activos', values: [200, 265, 310, 285, 240] },
    { name: 'Existencias', values: [225, 300, 350, 320, 270] },
  ];
  readonly variacion: ChartSeries[] = [{ name: 'Activos', values: [1.4, 3.5, 4.6, 6.3, 7.8] }];
  readonly semestre = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  readonly evolucion: ChartSeries[] = [
    { name: 'Activos', values: [100, 200, 100, 300, 400, 300] },
    { name: 'Existencias', values: [100, 125, 165, 195, 195, 215] },
  ];
  readonly variacionExistencias = [-8.5, 14.5, -15.3, -14.1, 16.3];
  readonly composicion: ChartSeries[] = [
    { name: 'Activos', values: [38] },
    { name: 'Patrimonio', values: [62] },
  ];
  readonly rubros = ['Activos', 'Patrimonio', 'Pasivos'];
  readonly balance = [450, 300, 250];
  readonly comparativo: ChartSeries[] = [
    { name: 'Activos', values: [225] },
    { name: 'Existencias', values: [350] },
    { name: 'Patrimonio', values: [265] },
    { name: 'Pasivos', values: [190] },
  ];
  readonly leyenda: ChartLegendItem[] = ['Activos', 'Existencias', 'Patrimonio', 'Pasivos'].map((label, i) => ({ label, token: tokenDeSerie(i) }));
  readonly tooltip: ChartTooltipItem[] = [
    { label: 'Activos', value: '310', token: tokenDeSerie(0) },
    { label: 'Existencias', value: '350', token: tokenDeSerie(1) },
  ];
}
