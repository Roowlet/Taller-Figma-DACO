import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { DivergingChartComponent } from '../diverging-chart/diverging-chart.component';
import { DonutChartComponent } from '../donut-chart/donut-chart.component';
import { LineChartComponent } from '../line-chart/line-chart.component';

/** Ancho de la columna angosta en la que se monta cada gráfico. */
const COLUMNA = 320;

/** Nombres largos: la tabla de datos no corta líneas (sr-only lleva `white-space: nowrap`) y queda más ancha que la columna. */
const CATEGORIAS = ['Recaudación de impuestos del primer trimestre', 'Transferencias a gobiernos regionales y locales', 'Donaciones'];
const SERIES = [
  { name: 'Activos corrientes al cierre del ejercicio', values: [10, 20, 30] },
  { name: 'Existencias valorizadas del periodo anterior', values: [15, 25, 35] },
];

/** Cada gráfico del kit con tabla de datos. Un gráfico nuevo se agrega aquí. */
const GRAFICOS: { selector: string; componente: Type<unknown>; entradas: Record<string, unknown> }[] = [
  { selector: 'siaf-bar-chart', componente: BarChartComponent, entradas: { categories: CATEGORIAS, series: SERIES } },
  { selector: 'siaf-line-chart', componente: LineChartComponent, entradas: { categories: CATEGORIAS, series: SERIES } },
  { selector: 'siaf-diverging-chart', componente: DivergingChartComponent, entradas: { categories: CATEGORIAS, values: [-12, 8, 20] } },
  { selector: 'siaf-donut-chart', componente: DonutChartComponent, entradas: { categories: CATEGORIAS, values: [40, 35, 25] } },
];

/**
 * La tabla de datos va oculta a la vista y la leen los lectores de pantalla. Con `sr-only` en la propia tabla, su caja
 * invisible ensanchaba la página (375 px de ventana, 382 de página en el catálogo): una tabla crece hasta su contenido
 * aunque declare 1 px de ancho, y `overflow: hidden` no la recorta. `sr-only` va en un div que sí la recorta.
 */
describe('Tabla de datos de los gráficos', () => {
  for (const { selector, componente, entradas } of GRAFICOS) {
    it(`${selector}: la tabla oculta no ensancha la página aunque el gráfico esté en una columna angosta`, async () => {
      await TestBed.configureTestingModule({ imports: [componente] }).compileComponents();
      const fixture = TestBed.createComponent(componente);
      const anfitrion = fixture.nativeElement as HTMLElement;
      // Pegada al borde derecho de la ventana: lo que sobresalga de la columna agranda el desplazamiento de la página.
      Object.assign(anfitrion.style, { position: 'absolute', top: '0', right: '0', width: `${COLUMNA}px` });
      document.body.appendChild(anfitrion);
      try {
        for (const [nombre, valor] of Object.entries(entradas)) fixture.componentRef.setInput(nombre, valor);
        fixture.detectChanges();
        await fixture.whenStable();

        const tabla = anfitrion.querySelector('table')!;
        expect(tabla.offsetWidth).withContext('la tabla es más ancha que la columna').toBeGreaterThan(COLUMNA);
        expect(tabla.classList).not.toContain('sr-only');
        expect(tabla.parentElement?.classList).withContext('oculta dentro de un div sr-only').toContain('sr-only');
        expect(document.documentElement.scrollWidth).withContext('ancho de la página').toBeLessThanOrEqual(document.documentElement.clientWidth);
      } finally {
        fixture.destroy();
        anfitrion.remove();
      }
    });
  }
});
