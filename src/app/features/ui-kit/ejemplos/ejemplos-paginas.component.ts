import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { CreateDocumentComponent } from '../../../shared/components/create-document/create-document.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PageShellComponent } from '../../../shared/components/page-shell/page-shell.component';
import { SolicitudeFormCardComponent } from '../../../shared/components/solicitude-form-card/solicitude-form-card.component';
import { SolicitudeHeaderComponent } from '../../../shared/components/solicitude-header/solicitude-header.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TextFieldComponent, TextFieldOption } from '../../../shared/ui/text-field/text-field.component';

/**
 * Ejemplos en vivo de la categoría Layouts de página. El layout y la cabecera de solicitud se
 * muestran en marcos de escritorio y móvil (`EJEMPLOS_RESPONSIVE`): cambian de forma según la
 * ventana (barra de acciones fija al pie en móvil, cabecera sticky en escritorio), así que aquí
 * van a pantalla completa, sin contenedores que los recorten.
 * La pantalla de bandeja no va aquí: es una plantilla de pantalla (`ejemplos-plantillas`).
 */
@Component({
  selector: 'ui-kit-ejemplos-paginas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent, CreateDocumentComponent, PageHeaderComponent, PageShellComponent, SolicitudeFormCardComponent,
    SolicitudeHeaderComponent, SolicitudeInfoCardComponent, SolicitudePageLayoutComponent, TextFieldComponent,
  ],
  template: `
    @switch (selector) {
      @case ('siaf-page-shell') {
        <div class="overflow-hidden rounded-siaf-md border border-border">
          <siaf-page-shell homeHref="/ui-kit" [breadcrumbs]="migas">
            <siaf-page-header pageHeader title="Consultas y reportes" />
            <p class="text-sm text-text-muted">Contenido de la página.</p>
          </siaf-page-shell>
        </div>
      }
      @case ('siaf-page-header') {
        <siaf-page-header title="Plan de cuentas" subtitle="Consulta de cuentas vigentes">
          <siaf-button actions variant="accent" icon="file_download" [iconOnly]="true" ariaLabel="Exportar" />
        </siaf-page-header>
      }
      @case ('siaf-solicitude-page-layout') {
        <siaf-solicitude-page-layout
          [breadcrumbs]="migasSolicitud"
          role="creator"
          state="new"
          heading="Solicitud de cuenta contable"
          secondaryText="Creación"
        >
          <siaf-solicitude-info-card [fields]="datosSolicitud" />
          <siaf-solicitude-form-card title="Datos de la cuenta contable">
            <div class="grid gap-4 md:grid-cols-3">
              <siaf-input label="Código de cuenta" value="1101.01" [required]="true" />
              <siaf-input label="Denominación" value="Caja M/N" [required]="true" />
              <siaf-input label="Naturaleza" type="select" [options]="naturalezas" value="deudora" />
            </div>
          </siaf-solicitude-form-card>
        </siaf-solicitude-page-layout>
      }
      @case ('siaf-solicitude-header') {
        <div class="flex flex-col">
          <siaf-solicitude-header
            role="approver"
            state="verified"
            heading="Registro de asiento de ajuste"
            secondaryText="PAA-SRAA-00012-2026-MEF-DGCP"
            [showReturn]="true"
          />
        </div>
      }
      @case ('siaf-create-document') {
        <div class="max-w-[380px]">
          <siaf-create-document variant="dropdown" title="Nuevo documento" />
        </div>
      }
    }
  `,
})
export class EjemplosPaginasComponent {
  static readonly selectores = ['siaf-solicitude-page-layout', 'siaf-solicitude-header', 'siaf-page-shell', 'siaf-page-header', 'siaf-create-document'];
  @Input({ required: true }) selector!: string;

  readonly migasSolicitud: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/ui-kit' },
    { label: 'Plan de cuentas contable', href: '/ui-kit' },
    { label: 'Solicitud de cuenta contable' },
  ];
  readonly datosSolicitud: SolicitudeInfoField[] = [
    { label: 'Entidad', value: '0001 - Ministerio de Economía y Finanzas' },
    { label: 'Unidad orgánica', value: 'Dirección General de Contabilidad Pública' },
    { label: 'Fecha de registro', value: '15/01/2026' },
  ];
  readonly naturalezas: TextFieldOption[] = [
    { label: 'Deudora', value: 'deudora' },
    { label: 'Acreedora', value: 'acreedora' },
  ];

  readonly migas: BreadcrumbItem[] = [
    { label: 'Gestión contable', href: '/ui-kit' },
    { label: 'Plan de cuentas' },
  ];
}
