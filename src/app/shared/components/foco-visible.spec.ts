import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnulmentModalComponent } from '../ui/annulment-modal/annulment-modal.component';
import { DateTimePickerComponent } from '../ui/date-time-picker/date-time-picker.component';
import { DeskCardComponent } from '../ui/desk-card/desk-card.component';
import { ListComponent, ListItem } from '../ui/list/list.component';
import { MenuComponent, MenuItem } from '../ui/menu/menu.component';
import { ReportTableColumn, ReportTableComponent, ReportTableRow } from '../ui/report-table/report-table.component';
import { SelectOption, SelectOptionsComponent } from '../ui/select-options/select-options.component';
import { TabItem, TabsComponent } from '../ui/tabs/tabs.component';
import { TagComponent } from '../ui/tag/tag.component';
import { TextFieldComponent } from '../ui/text-field/text-field.component';
import { UploaderComponent } from '../ui/uploader/uploader.component';
import { MANIFIESTO_UI_KIT } from '../../features/ui-kit/ui-kit.manifest';
import { CreateDocumentComponent } from './create-document/create-document.component';
import { PaginationComponent } from './pagination/pagination.component';

/** Foco visible (WCAG 2.4.7): cada control muestra el azul `border-states-focus` al recibir el foco, en claro y oscuro. */
@Component({
  standalone: true,
  imports: [
    CreateDocumentComponent,
    DateTimePickerComponent,
    DeskCardComponent,
    ListComponent,
    MenuComponent,
    PaginationComponent,
    ReportTableComponent,
    SelectOptionsComponent,
    TabsComponent,
    TagComponent,
    TextFieldComponent,
    UploaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-tabs data-prueba="subrayado" [tabs]="pestanas" activeId="documentos" [border]="false" ariaLabel="Vistas" idBase="subrayado" />
    <siaf-tabs data-prueba="carpeta" [tabs]="pestanas" activeId="documentos" ariaLabel="Vistas en carpeta" idBase="carpeta" />
    <siaf-menu data-prueba="menu" [items]="acciones" ariaLabel="Acciones" />
    <siaf-list data-prueba="lista" [items]="filas" [selectable]="true" ariaLabel="Filas" />
    <siaf-select-options data-prueba="opciones" [options]="entidades" selectedValue="mef" />
    <siaf-input data-prueba="exito" label="Moneda" type="select" [options]="entidades" value="mef" />
    <siaf-input data-prueba="error" label="Glosa" value="Texto" error="La glosa es obligatoria" />
    <siaf-date-time-picker data-prueba="fecha" label="Fecha" [defaultToToday]="false" />
    <siaf-date-time-picker data-prueba="fecha-error" label="Fecha" [defaultToToday]="false" error="La fecha es obligatoria" />
    <siaf-uploader data-prueba="subir" variant="extended" />
    <siaf-uploader data-prueba="subir-compacto" variant="compact" />
    <siaf-create-document data-prueba="crear" variant="dropdown" />
    <siaf-pagination data-prueba="paginacion" position="Bottom" [rowPage]="true" [page]="1" [totalPages]="3" [totalItems]="30" />
    <siaf-desk-card data-prueba="panel" variant="featured" title="Procesos" icon="picture_in_picture" [interactive]="true" />
    <siaf-report-table data-prueba="reporte" [columns]="columnasReporte" [rows]="filasReporte" ariaLabel="Reporte" />
    <siaf-tag data-prueba="tag" variant="filter" [selected]="true" [removable]="true" removeLabel="Quitar filtro Estado">Estado: Aprobado</siaf-tag>
  `,
})
class ControlesComponent {
  readonly pestanas: TabItem[] = [{ id: 'documentos', label: 'Documentos' }, { id: 'registros', label: 'Registros' }];
  readonly acciones: MenuItem[] = [{ label: 'Editar' }, { label: 'Anular' }];
  readonly filas: ListItem[] = [{ id: 'a', title: 'Primera fila' }, { id: 'b', title: 'Segunda fila' }];
  readonly entidades: SelectOption[] = [{ label: 'Ministerio de Economía', value: 'mef' }, { label: 'Ministerio de Salud', value: 'minsa' }];
  readonly columnasReporte: ReportTableColumn[] = [{ key: 'documento', label: 'Documento', kind: 'link' }, { key: 'saldo', label: 'Saldo', align: 'right', fixed: true }];
  readonly filasReporte: ReportTableRow[] = [{ documento: '000001-2026', saldo: '10,000.00' }];
}

@Component({
  standalone: true,
  imports: [AnnulmentModalComponent],
  template: `<siaf-annulment-modal [open]="true" />`,
})
class AnulacionComponent {}

const TEMAS = ['light', 'dark'] as const;

function colorDe(variable: string): string {
  const sonda = document.createElement('span');
  sonda.style.color = `var(${variable})`;
  document.body.appendChild(sonda);
  const color = getComputedStyle(sonda).color;
  sonda.remove();
  return color;
}

/** Contraste de `frente` sobre `fondo`; si el frente es translúcido (el azul de foco va al 80 %), se mezcla primero. */
function contraste(frente: string, fondo: string): number {
  const canales = (color: string): number[] => (color.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  const [fr, fg, fb, alfa = 1] = canales(frente);
  const [br, bg, bb] = canales(fondo);
  const mezcla = [fr * alfa + br * (1 - alfa), fg * alfa + bg * (1 - alfa), fb * alfa + bb * (1 - alfa)];
  const luminancia = ([r, g, b]: number[]): number => {
    const [lr, lg, lb] = [r, g, b]
      .map((canal) => canal / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };
  const [claro, oscuro] = [luminancia(mezcla), luminancia([br, bg, bb])].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

describe('Foco visible del kit (WCAG 2.4.7)', () => {
  it('ningún componente del kit vuelve al anillo outline-brand-primary (2.66:1 en oscuro)', () => {
    // El anillo del kit es `border-states-focus`; el azul de marca no llega a 3:1 sobre la superficie oscura.
    const conAnilloViejo = MANIFIESTO_UI_KIT.filter((ficha) => ficha.tokens.some((t) => t.via.some((clase) => clase.includes('outline-brand-primary'))));
    expect(conAnilloViejo.map((ficha) => ficha.selector)).toEqual([]);
  });

  let temaPrevio: string | null;
  let sinTransiciones: HTMLStyleElement;

  beforeAll(() => {
    // Las transiciones de color arrancan del color anterior: se apagan para leer el estado final.
    sinTransiciones = document.createElement('style');
    sinTransiciones.textContent = '*, *::before, *::after { transition: none !important; }';
    document.head.appendChild(sinTransiciones);
  });

  afterAll(() => sinTransiciones.remove());

  beforeEach(() => {
    temaPrevio = document.documentElement.getAttribute('data-theme');
  });

  afterEach(() => {
    if (temaPrevio === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', temaPrevio);
  });

  for (const tema of TEMAS) {
    describe(`tema ${tema}`, () => {
      let fixture: ComponentFixture<ControlesComponent>;
      let foco: string;
      const q = <T extends HTMLElement>(selector: string): T => fixture.nativeElement.querySelector(selector) as T;

      /** Enfoca y comprueba que es foco de teclado (`:focus-visible`), que es lo que pintan los estilos. */
      const enfocar = (el: HTMLElement): void => {
        el.focus();
        expect(el.matches(':focus-visible')).withContext('foco visible del navegador').toBeTrue();
      };

      const esperarContorno = (el: HTMLElement, contexto: string): void => {
        const estilo = getComputedStyle(el);
        expect(estilo.outlineStyle).withContext(`${contexto}: estilo del contorno`).toBe('solid');
        expect(estilo.outlineWidth).withContext(`${contexto}: grosor del contorno`).toBe('2px');
        expect(estilo.outlineColor).withContext(`${contexto}: color del contorno`).toBe(foco);
      };

      beforeEach(async () => {
        document.documentElement.setAttribute('data-theme', tema);
        await TestBed.configureTestingModule({ imports: [ControlesComponent] }).compileComponents();
        fixture = TestBed.createComponent(ControlesComponent);
        document.body.appendChild(fixture.nativeElement);
        fixture.detectChanges();
        await fixture.whenStable();
        foco = colorDe('--sys-color-border-states-focus');
      });

      afterEach(() => fixture.nativeElement.remove());

      it('el azul de foco contrasta al menos 3:1 con la superficie', () => {
        // Con el 80 % de opacidad del token mezclado sobre la superficie: 5.35:1 en claro y 10.15:1 en oscuro.
        expect(contraste(foco, colorDe('--sys-color-bg-surfaces-surface'))).toBeGreaterThanOrEqual(3);
      });

      it('siaf-tabs: la pestaña activa enfocada muestra el contorno, con subrayado y en carpeta', () => {
        for (const variante of ['subrayado', 'carpeta']) {
          const activa = q(`[data-prueba="${variante}"] [role="tab"][aria-selected="true"]`);
          enfocar(activa);
          esperarContorno(activa, variante);
        }
      });

      it('opciones de siaf-menu, siaf-list y siaf-select-options: contorno interior', () => {
        for (const [prueba, selector] of [['menu', '[role="menuitem"][tabindex="0"]'], ['lista', '[role="option"]'], ['opciones', '[role="option"]']]) {
          const opcion = q(`[data-prueba="${prueba}"] ${selector}`);
          enfocar(opcion);
          esperarContorno(opcion, prueba);
          expect(getComputedStyle(opcion).outlineOffset).withContext(`${prueba}: por dentro`).toBe('-2px');
        }
      });

      it('siaf-input: el select con valor (éxito) pasa al borde azul al recibir el foco', () => {
        const boton = q('[data-prueba="exito"] button[aria-haspopup="listbox"]');
        expect(getComputedStyle(boton).borderTopColor).not.toBe(foco);
        enfocar(boton);
        expect(getComputedStyle(boton).borderTopColor).toBe(foco);
      });

      it('siaf-input con error: el borde sigue rojo y el foco suma un contorno azul por fuera', () => {
        const campo = q('[data-prueba="error"] input');
        enfocar(campo);
        const control = q('[data-prueba="error"] [class*="border-feedback-danger"]');
        expect(getComputedStyle(control).borderTopColor).toBe(colorDe('--sys-color-border-feedback-danger'));
        esperarContorno(control, 'campo con error');
      });

      it('siaf-date-time-picker: borde azul al enfocar el campo y, con error, contorno azul', () => {
        const campo = q('[data-prueba="fecha"] button[aria-haspopup="dialog"]');
        enfocar(campo);
        expect(getComputedStyle(campo).borderTopColor).toBe(foco);

        const conError = q('[data-prueba="fecha-error"] button[aria-haspopup="dialog"]');
        enfocar(conError);
        expect(getComputedStyle(conError).borderTopColor).toBe(colorDe('--sys-color-border-feedback-danger'));
        esperarContorno(conError, 'fecha con error');
      });

      it('siaf-uploader: la etiqueta del selector muestra el contorno cuando el input oculto recibe el foco', () => {
        for (const variante of ['subir', 'subir-compacto']) {
          const input = q<HTMLInputElement>(`[data-prueba="${variante}"] input[type="file"]`);
          enfocar(input);
          esperarContorno(input.closest('label')!, variante);
        }
      });

      it('siaf-pagination: el select de filas y las flechas muestran el anillo del kit (el select antes no lo pintaba)', () => {
        for (const selector of ['select', 'button[aria-label="Página siguiente"]']) {
          const control = q(`[data-prueba="paginacion"] ${selector}`);
          enfocar(control);
          esperarContorno(control, selector);
        }
      });

      it('siaf-report-table: la zona desplazable y el enlace de la fila muestran el contorno del kit', () => {
        for (const selector of ['[role="region"]', 'tbody button']) {
          const control = q(`[data-prueba="reporte"] ${selector}`);
          enfocar(control);
          esperarContorno(control, selector);
        }
      });

      it('siaf-desk-card interactiva: contorno del kit separado 2 px de la tarjeta', () => {
        const tarjeta = q('[data-prueba="panel"] button');
        enfocar(tarjeta);
        esperarContorno(tarjeta, 'tarjeta del Panel');
        expect(getComputedStyle(tarjeta).outlineOffset).toBe('2px');
      });

      it('siaf-tag: con el foco en su botón o en la ×, el tag pinta el borde azul y el anillo del kit separado 2 px', () => {
        const caja = q('[data-prueba="tag"] [data-variante]');
        for (const selector of ['[data-tag-boton]', '[data-tag-quitar]']) {
          enfocar(q(`[data-prueba="tag"] ${selector}`));
          esperarContorno(caja, selector);
          expect(getComputedStyle(caja).outlineOffset).withContext(selector).toBe('2px');
          expect(getComputedStyle(caja).borderTopColor).withContext(selector).toBe(foco);
        }
      });

      it('siaf-create-document: el select de Documento muestra el borde azul al llegar con Tab', () => {
        const documento = q('[data-prueba="crear"] button[aria-haspopup="listbox"]');
        enfocar(documento);
        expect(getComputedStyle(documento).borderTopColor).toBe(foco);
      });

      it('siaf-annulment-modal: el recuadro del detalle pasa al borde azul con el foco', async () => {
        const modal = TestBed.createComponent(AnulacionComponent);
        document.body.appendChild(modal.nativeElement);
        modal.detectChanges();
        await modal.whenStable();
        try {
          // El detalle es text-area-control: el borde vive en el recuadro que envuelve al textarea.
          const detalle = (modal.nativeElement as HTMLElement).querySelector<HTMLTextAreaElement>('textarea')!;
          enfocar(detalle);
          modal.detectChanges();
          expect(getComputedStyle(detalle.parentElement!).borderTopColor).toBe(foco);
        } finally {
          modal.nativeElement.remove();
        }
      });
    });
  }
});
