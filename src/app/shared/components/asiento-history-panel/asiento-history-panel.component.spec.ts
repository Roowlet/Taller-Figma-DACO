import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AsientoHistoryPanelComponent } from './asiento-history-panel.component';
import { SolicitudesApiService } from '../../../core/api/solicitudes-api.service';
import { AperturaContableApiService } from '../../../core/api/apertura-contable-api.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';

describe('AsientoHistoryPanelComponent', () => {
  let fixture: ComponentFixture<AsientoHistoryPanelComponent>;
  let component: AsientoHistoryPanelComponent;

  const solicitud = {
    id: 'doc-1',
    numero: 'PRAA-SRAA-00005-2026-GR-LIM-OGC',
    numeroAsientoContable: 'AA-045-2026-05',
    estado: 'APROBADO',
    tipoAccion: 'creacion',
    asuntoMotivo: '[OGC] Registro del asiento de ajuste',
    fechaRegistro: '2026-08-17T22:25:32.460Z',
    createdAt: '2026-08-17T22:25:32.460Z',
    catDocumento: { codigo: 'SRAA', nombre: 'Solicitud de Registro de Asiento de Ajuste' },
    entidadCreadora: { id: 'ent-1', codMef: '045', siglas: 'GR-LIM', nombre: 'Gobierno Regional de Lima' },
    detalleAsientoAjuste: {
      documentoId: 'doc-1',
      tipoAsientoAjusteId: 'taa-1',
      fechaAsiento: '2026-08-17T00:00:00.000Z',
      periodoLabel: '2026 - 08',
      glosa: 'Glosa de prueba',
      movimientos: [
        { id: 'm1', cuentaContableId: 'c1', tipoMovimiento: 'Debe', monto: '50000', glosaDetalle: null, orden: 0, cuentaContable: { codigoCompleto: '5.8.0.1.0.5', nombre: 'Estimaciones de cobranza dudosa' } },
        { id: 'm2', cuentaContableId: 'c2', tipoMovimiento: 'Haber', monto: '50000', glosaDetalle: null, orden: 1, cuentaContable: { codigoCompleto: '1.1.3.1.1.1', nombre: 'Venta de bienes por cobrar' } },
      ],
      tipoAsientoAjuste: {
        codigo: 'TAA0000001',
        ambitos: [{ ambitoInstitucionalId: 'amb-gr', ambitoInstitucional: { codigo: 'GR', descripcion: 'Gobiernos Regionales' } }],
        claseAjuste: { codigo: '1', descripcion: 'Provisiones' },
        detalleAjuste: { codigo: '1.1', descripcion: 'Provisión de cuentas por cobrar' },
      },
    },
    sustentos: [{ id: 's1', tipoSustento: 'sustento', archivo: { nombreOriginal: 'DocEntregable001.pdf', storagePath: 'x' } }],
    historialEstados: [
      { id: 'h1', estadoAnterior: 'NUEVO', estadoNuevo: 'ELABORADO', comentario: null, createdAt: '2026-08-17T22:25:32.460Z', creador: { nombres: 'Ricardo', apellidoPaterno: 'Doe', apellidoMaterno: 'Bustamante' } },
      { id: 'h2', estadoAnterior: 'ELABORADO', estadoNuevo: 'VERIFICADO', comentario: null, createdAt: '2026-08-17T22:26:00.000Z', creador: { nombres: 'Ricardo', apellidoPaterno: 'Doe', apellidoMaterno: 'Bustamante' } },
    ],
  } as any;

  const periodoAgosto = {
    id: 'p8', numero: 8, etiqueta: '2026 - 08',
    fechaInicio: '2026-08-01T00:00:00.000Z', fechaFin: '2026-08-31T00:00:00.000Z',
    fechaVigenciaAdicional: '2026-09-13T00:00:00.000Z', usuarioResponsable: 'SIAF - RP', estado: 'ABIERTO',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsientoHistoryPanelComponent],
      providers: [
        { provide: SolicitudesApiService, useValue: { obtenerDetalle: () => of(solicitud) } },
        { provide: AperturaContableApiService, useValue: { listarConfiguracion: () => of([{ ambitoId: 'ent-1', periodos: [periodoAgosto] }]) } },
        { provide: CurrentUserService, useValue: { user: () => ({ entidadAmbitoId: 'amb-gr' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AsientoHistoryPanelComponent);
    component = fixture.componentInstance;
  });

  function abrir(): void {
    fixture.componentRef.setInput('record', { recordId: 'doc-1' });
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    component.ngOnChanges({ open: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false } } as any);
    fixture.detectChanges();
  }

  it('carga el documento grabado y arma la cabecera del registro', () => {
    abrir();
    expect(component.documentSummaryField.value).toBe('Solicitud de Registro de Asiento de Ajuste');
    expect(component.numberSummaryField.value).toBe('PRAA-SRAA-00005-2026-GR-LIM-OGC');
    expect(component.accountingNumberField.value).toBe('AA-045-2026-05');
    expect(component.stepperSummary[0].value).toBe('00005');
  });

  it('la columna de versiones es siaf-steps con tarjetas: la de creación, elegida', () => {
    abrir();
    const tarjetas = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('siaf-steps[variant="cards"] siaf-stepper-card button');
    expect(tarjetas.length).toBe(1);
    expect(tarjetas[0].getAttribute('aria-pressed')).toBe('true');
    expect(tarjetas[0].textContent).toContain('00005');
    expect(tarjetas[0].textContent).toContain('Creación');
  });

  it('muestra ámbito, clase, detalle y glosa del asiento', () => {
    abrir();
    expect(component.ambitoField.value).toBe('GR - Gobiernos Regionales');
    expect(component.claseField.value).toBe('1. - Provisiones');
    expect(component.detalleField.value).toBe('1.1. - Provisión de cuentas por cobrar');
    expect(component.glosaField.value).toBe('Glosa de prueba');
  });

  it('resuelve las fechas del período contra la configuración de apertura', () => {
    abrir();
    const [periodo, inicio, fin, vigencia] = component.periodoFields;
    expect(periodo.value).toBe('2026 - 08');
    expect(inicio.value).toBe('01/08/2026');
    expect(fin.value).toBe('31/08/2026');
    expect(vigencia.value).toBe('13/09/2026');
  });

  it('lista los movimientos con totales Debe/Haber cuadrados', () => {
    abrir();
    expect(component.movimientosFiltrados.length).toBe(2);
    expect(component.totalDebe).toBe(50000);
    expect(component.totalHaber).toBe(50000);
  });

  it('el buscador filtra por código o nombre de cuenta', () => {
    abrir();
    component.filtro.set('venta');
    expect(component.movimientosFiltrados.length).toBe(1);
    expect(component.movimientosFiltrados[0].codigo).toBe('1.1.3.1.1.1');
  });

  it('muestra justificación sin el prefijo de órgano y el sustento adjunto', () => {
    abrir();
    expect(component.justificationField.value).toBe('Registro del asiento de ajuste');
    expect(component.supportDocument).toBe('DocEntregable001.pdf');
  });
});
