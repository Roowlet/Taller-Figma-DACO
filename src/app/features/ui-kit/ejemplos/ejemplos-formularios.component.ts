import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { CheckboxComponent } from '../../../shared/ui/checkbox/checkbox.component';
import { DateTimePickerComponent } from '../../../shared/ui/date-time-picker/date-time-picker.component';
import { RadioComponent, RadioOption } from '../../../shared/ui/radio/radio.component';
import { ReadonlyComponent } from '../../../shared/ui/readonly/readonly.component';
import { ReadonlyFieldComponent } from '../../../shared/ui/readonly-field/readonly-field.component';
import { SelectOption, SelectOptionsComponent } from '../../../shared/ui/select-options/select-options.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { TextAreaControlComponent } from '../../../shared/ui/text-area-control/text-area-control.component';
import { TextFieldComponent, TextFieldOption } from '../../../shared/ui/text-field/text-field.component';
import { UploadedFileCardComponent } from '../../../shared/ui/uploaded-file-card/uploaded-file-card.component';
import { UploaderComponent } from '../../../shared/ui/uploader/uploader.component';

/** Ejemplos en vivo de la categoría Formularios. */
@Component({
  selector: 'ui-kit-ejemplos-formularios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CheckboxComponent, DateTimePickerComponent, RadioComponent, ReadonlyComponent, ReadonlyFieldComponent,
    SelectOptionsComponent, SwitchComponent, TextAreaControlComponent, TextFieldComponent, UploadedFileCardComponent, UploaderComponent,
  ],
  template: `
    @switch (selector) {
      @case ('siaf-input') {
        <div class="space-y-6">
          <section>
            <h5 class="mb-3 text-[11px] font-bold uppercase tracking-widest text-text-muted">Tipos</h5>
            <div class="grid gap-4 sm:grid-cols-2">
              <siaf-input label="Texto" placeholder="Nombre de la cuenta" />
              <siaf-input label="Correo (type correo o email)" type="correo" autocomplete="email" />
              <siaf-input label="Número entero (number)" type="number" hint="Solo enteros: con decimales el campo se vacía" />
              <siaf-input label="Importe (decimal)" type="decimal" [decimals]="2" hint="Para importes: acepta 1250.50" />
              <siaf-input label="Contraseña" type="password" autocomplete="current-password" />
              <siaf-input label="Tipo de documento (select)" type="select" [options]="opciones" />
              <div class="sm:col-span-2">
                <siaf-input label="Ámbitos institucionales (select-multiple)" type="select-multiple" [options]="ambitos" [value]="['GN', 'GR']" />
              </div>
              <div class="sm:col-span-2">
                <siaf-input label="Ámbitos con casillas (selectAllLabel)" type="select-multiple" selectAllLabel="Seleccionar todo" [options]="ambitos" [value]="['GN']" />
              </div>
            </div>
          </section>

          <section>
            <h5 class="mb-3 text-[11px] font-bold uppercase tracking-widest text-text-muted">Estados</h5>
            <div class="grid gap-4 sm:grid-cols-2">
              <siaf-input label="Normal (enabled)" />
              <siaf-input label="Con ayuda" hint="Se usa para notificar al integrante" />
              <siaf-input label="Año fiscal" [required]="true" error="El año es obligatorio" />
              <siaf-input label="Éxito (success)" state="success" value="1101.01" />
              <siaf-input label="Deshabilitado" value="Ministerio de Economía y Finanzas" [disabled]="true" />
            </div>
          </section>

          <section>
            <h5 class="mb-3 text-[11px] font-bold uppercase tracking-widest text-text-muted">Adornos y comportamiento</h5>
            <div class="grid gap-4 sm:grid-cols-2">
              <siaf-input label="Ícono al inicio (leadingIcon)" leadingIcon="search" />
              <div>
                <siaf-input
                  label="Ícono con acción al final (trailingIcon)"
                  trailingIcon="search"
                  trailingButtonLabel="Buscar cuenta"
                  (trailingAction)="acciones.set(acciones() + 1)"
                />
                <p class="mt-1 text-xs text-text-muted">trailingAction emitido {{ acciones() }} {{ acciones() === 1 ? 'vez' : 'veces' }}</p>
              </div>
              <siaf-input label="Select con botón para limpiar (clearable)" type="select" [options]="opciones" value="sraa" [clearable]="true" />
              <siaf-input label="Sin borde verde al escribir (autoSuccess=false)" value="Valor ya grabado" [autoSuccess]="false" />
            </div>
            <p class="mt-3 text-xs text-text-muted">clearable solo actúa en los select; en un campo de texto no muestra nada.</p>
          </section>
        </div>
      }
      @case ('text-area-control') {
        <text-area-control title="Motivo de la observación" placeholder="Describe el motivo" [maxlength]="200" />
      }
      @case ('siaf-checkbox') {
        <div class="flex flex-col gap-3">
          <siaf-checkbox label="Acepto los términos" [checked]="true" />
          <siaf-checkbox label="Notificar al aprobador" description="Se envía un correo cuando el documento pasa a Verificado" />
          <siaf-checkbox label="Deshabilitado" [disabled]="true" />
        </div>
      }
      @case ('siaf-switch') {
        <div class="flex flex-col gap-3">
          <siaf-switch label="Notificar por correo" [(checked)]="notificar" />
          <p class="text-xs text-text-muted" aria-live="polite">Notificar por correo: {{ notificar() ? 'activo' : 'inactivo' }}</p>
          <siaf-switch label="Deshabilitado encendido" [checked]="true" [disabled]="true" />
          <siaf-switch label="Deshabilitado apagado" [disabled]="true" />
        </div>
      }
      @case ('siaf-radio-group') {
        <div class="flex flex-col gap-4">
          <siaf-radio-group label="Modalidad" name="uikit-modalidad" [options]="modalidades" value="presencial" />
          <siaf-radio-group label="¿Afecta presupuesto?" name="uikit-si-no" [inline]="true" [options]="siNo" value="si" />
        </div>
      }
      @case ('siaf-select-options') {
        <div class="grid gap-4 sm:grid-cols-2">
          <siaf-select-options [options]="entidades" selectedValue="mef" />
          <siaf-select-options [options]="entidades" [multiple]="true" [selectedValues]="['mef', 'minsa']" />
        </div>
      }
      @case ('siaf-date-time-picker') {
        <div class="grid min-h-[80px] gap-4 sm:grid-cols-2">
          <siaf-date-time-picker label="Fecha de inicio" variant="date" [defaultToToday]="true" />
          <siaf-date-time-picker label="Fecha y hora" variant="datetime" error="La fecha es obligatoria" />
        </div>
      }
      @case ('siaf-uploader') {
        <div class="grid max-w-md gap-6">
          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Extendida (por defecto)</p>
            <siaf-uploader accept=".pdf" hint="PDF de hasta 10 MB" [maxSizeMb]="10" />
          </div>
          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Compacta (variant="compact")</p>
            <siaf-uploader variant="compact" accept=".pdf" [maxSizeMb]="10" />
          </div>
        </div>
        <p class="mt-3 text-xs text-text-muted">Elige o suelta un archivo que no sea PDF para ver la tarjeta de error.</p>
      }
      @case ('siaf-uploaded-file-card') {
        <div class="grid max-w-md gap-4">
          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Cargado</p>
            <siaf-uploaded-file-card [file]="archivo" />
          </div>
          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Fallido (error)</p>
            <siaf-uploaded-file-card [file]="archivoFallido" error="No se pudo cargar el archivo" />
          </div>
          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Solo lectura (readonly)</p>
            <siaf-uploaded-file-card [file]="archivo" [readonly]="true" />
          </div>
        </div>
      }
      @case ('readonly-field') {
        <div class="grid gap-4 sm:grid-cols-2">
          <readonly-field caption="Número de documento" value="PCC-SCC-00001-2026-MEF-DGCP" />
          <readonly-field caption="Unidad ejecutora" [required]="true" value="" />
        </div>
      }
      @case ('siaf-readonly') {
        <div class="grid gap-4 sm:grid-cols-2">
          <siaf-readonly label="Entidad" value="Ministerio de Economía y Finanzas" />
          <siaf-readonly label="Año fiscal" value="2026" />
        </div>
      }
    }
  `,
})
export class EjemplosFormulariosComponent {
  static readonly selectores = [
    'siaf-input', 'text-area-control', 'siaf-checkbox', 'siaf-switch', 'siaf-radio-group', 'siaf-select-options',
    'siaf-date-time-picker', 'siaf-uploader', 'siaf-uploaded-file-card', 'readonly-field', 'siaf-readonly',
  ];
  @Input({ required: true }) selector!: string;

  readonly opciones: TextFieldOption[] = [
    { label: 'Solicitud de cuenta contable', value: 'scc' },
    { label: 'Registro de asiento de ajuste', value: 'sraa' },
  ];
  readonly ambitos: TextFieldOption[] = [
    { label: 'Gobierno Nacional', value: 'GN' },
    { label: 'Gobierno Regional', value: 'GR' },
    { label: 'Gobierno Local', value: 'GL' },
  ];
  /** Veces que se pulsó el ícono con acción del ejemplo de `trailingIcon`. */
  readonly acciones = signal(0);
  /** Estado del switch del ejemplo: `[(checked)]` lo mantiene al día. */
  readonly notificar = signal(true);

  readonly modalidades: RadioOption[] = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'Remota', value: 'remota' },
  ];
  readonly siNo: RadioOption[] = [
    { label: 'Sí', value: 'si' },
    { label: 'No', value: 'no' },
  ];
  readonly entidades: SelectOption[] = [
    { label: 'Ministerio de Economía y Finanzas', value: 'mef' },
    { label: 'Ministerio de Salud', value: 'minsa' },
    { label: 'Gobierno Regional de Lima', value: 'grlima' },
  ];
  readonly archivo = new File(['contenido de ejemplo'], 'acta-sustento-2026.pdf', { type: 'application/pdf' });
  readonly archivoFallido = { name: 'DocEntregable001.xls', size: 512_000 };
}
