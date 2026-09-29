import { Type } from '@angular/core';

import { EjemplosAccionesComponent } from './ejemplos-acciones.component';
import { EjemplosArmazonComponent, EjemplosArmazonSesionComponent } from './ejemplos-armazon.component';
import { EjemplosDatosComponent } from './ejemplos-datos.component';
import { EjemplosFeedbackComponent } from './ejemplos-feedback.component';
import { EjemplosFormulariosComponent } from './ejemplos-formularios.component';
import { EjemplosFundamentosComponent } from './ejemplos-fundamentos.component';
import { EjemplosGraficosComponent } from './ejemplos-graficos.component';
import { EjemplosNavegacionComponent } from './ejemplos-navegacion.component';
import { EjemplosOverlaysComponent } from './ejemplos-overlays.component';
import { EjemplosPaginasComponent } from './ejemplos-paginas.component';
import { EjemplosPlantillasComponent } from './ejemplos-plantillas.component';
import { EjemplosSuperficiesComponent } from './ejemplos-superficies.component';
import { EjemplosTrazabilidadComponent } from './ejemplos-trazabilidad.component';

/** Un componente de ejemplos por categoría: recibe `selector` y pinta el caso que corresponde. */
type ComponenteEjemplos = Type<{ selector: string }> & { readonly selectores: readonly string[] };

export const COMPONENTES_EJEMPLO: readonly ComponenteEjemplos[] = [
  EjemplosFundamentosComponent,
  EjemplosAccionesComponent,
  EjemplosFormulariosComponent,
  EjemplosDatosComponent,
  EjemplosGraficosComponent,
  EjemplosFeedbackComponent,
  EjemplosNavegacionComponent,
  EjemplosSuperficiesComponent,
  EjemplosTrazabilidadComponent,
  EjemplosOverlaysComponent,
  EjemplosPaginasComponent,
  EjemplosPlantillasComponent,
  EjemplosArmazonComponent,
  EjemplosArmazonSesionComponent,
];

/** Qué componente de ejemplos sabe pintar cada selector. */
export const EJEMPLO_POR_SELECTOR: ReadonlyMap<string, ComponenteEjemplos> = new Map(
  COMPONENTES_EJEMPLO.flatMap((c) => c.selectores.map((s) => [s, c] as const)),
);

/**
 * Ejemplos responsive: se muestran en dos marcos (iframe) con el ancho real de escritorio y de
 * móvil, porque sus breakpoints miran la ventana y en la columna de la ficha se verían comprimidos.
 * `alto` es el alto del marco en px, con lugar para los desplegables que abre el ejemplo.
 */
export interface VistaResponsive {
  altoEscritorio: number;
  altoMovil: number;
  /** Qué probar dentro del marco. */
  nota?: string;
}

export const EJEMPLOS_RESPONSIVE: Readonly<Record<string, VistaResponsive>> = {
  'siaf-navbar': {
    altoEscritorio: 640,
    altoMovil: 720,
    nota: 'Dentro de un armazón de muestra: Procesos y Ajustes abren su menú en árbol (en móvil, desde el botón de menú). La campana y el perfil también abren, con datos de muestra.',
  },
  'siaf-solicitude-page-layout': {
    altoEscritorio: 440,
    altoMovil: 760,
    nota: 'En escritorio la cabecera queda fija con las acciones a la derecha; en móvil se apila y las acciones bajan a una barra fija al pie.',
  },
  'siaf-solicitude-header': {
    altoEscritorio: 96,
    altoMovil: 220,
    nota: 'Rol aprobador con el documento verificado. En móvil las acciones pasan a la barra fija al pie.',
  },
  'siaf-notifications-panel': { altoEscritorio: 480, altoMovil: 560, nota: 'Pulsa «Notificaciones»: en escritorio se ancla al botón y en móvil ocupa el ancho de la pantalla.' },
};

/** Por qué un componente no tiene ejemplo en vivo. Hoy todos lo tienen: declararlo aquí solo si alguno no pudiera. */
export const MOTIVO_SIN_EJEMPLO: Readonly<Record<string, string>> = {};
