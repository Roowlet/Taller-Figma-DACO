import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SolicitudesFacadeService } from './solicitudes-facade.service';
import { SolicitudesStateService } from './solicitudes-state.service';
import { SolicitudesApiService, SolicitudResponse } from '../api/solicitudes-api.service';

/**
 * El facade es la única traducción entre el contrato del backend y lo que ve
 * la UI: si aplana mal un documento, la pantalla miente sin que nada falle.
 * Por eso el foco está en `mapResponse` (a través de la carga de bandeja) y en
 * el ciclo cambiar-estado → refrescar.
 */
describe('SolicitudesFacadeService', () => {
  let facade: SolicitudesFacadeService;
  let state: SolicitudesStateService;
  let api: jasmine.SpyObj<SolicitudesApiService>;

  /** Documento mínimo válido; cada test sobreescribe lo que le interesa. */
  function solicitud(over: Partial<SolicitudResponse> = {}): SolicitudResponse {
    return {
      id: 'doc-1',
      numero: 'PCC-SCC-00001-2026-MEF-DGCP',
      catDocumento: { codigo: 'SCC', nombre: 'Solicitud de Creación de Cuenta' },
      tipoAccion: 'CREACION',
      estado: 'ELABORADO',
      asuntoMotivo: 'Motivo de prueba',
      entidadCreadora: { id: 'e1', codMef: '0001', siglas: 'MEF', nombre: 'Ministerio de Economía' },
      unidadCreadora: { id: 'u1', nombre: 'DGCP' },
      creador: { id: 'c1', nombres: 'Ana', apellidoPaterno: 'Pérez', apellidoMaterno: 'Ruiz' },
      createdAt: '2026-08-20T10:00:00.000Z',
      ...over,
    } as SolicitudResponse;
  }

  /** Carga una bandeja de creador y devuelve el documento ya aplanado. */
  function cargarYObtener(r: SolicitudResponse) {
    api.bandejaCreador.and.returnValue(of([r]));
    facade.cargarBandejaCreador();
    return state.solicitudes()[0];
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<SolicitudesApiService>('SolicitudesApiService', [
      'bandejaCreador',
      'bandejaAprobador',
      'obtenerDetalle',
      'crear',
      'cambiarEstado',
    ]);

    TestBed.configureTestingModule({
      providers: [{ provide: SolicitudesApiService, useValue: api }],
    });

    facade = TestBed.inject(SolicitudesFacadeService);
    state = TestBed.inject(SolicitudesStateService);
  });

  describe('mapeo del documento', () => {
    it('aplana los campos del modelo v2', () => {
      const demo = cargarYObtener(solicitud());

      expect(demo.id).toBe('doc-1');
      expect(demo.numero).toBe('PCC-SCC-00001-2026-MEF-DGCP');
      expect(demo.tipoDocumento).toBe('Solicitud de Creación de Cuenta');
      expect(demo.estado).toBe('Elaborado');
      expect(demo.entidad).toBe('MEF Ministerio de Economía');
      expect(demo.entidadCodigo).toBe('0001');
      expect(demo.unidad).toBe('DGCP');
      expect(demo.creador).toBe('Ana Pérez Ruiz');
    });

    it('traduce todos los estados del backend', () => {
      const equivalencias = {
        ELABORADO: 'Elaborado',
        VERIFICADO: 'Verificado',
        APROBADO: 'Aprobado',
        RECHAZADO: 'Rechazado',
        OBSERVADO: 'Observado',
        ELIMINADO: 'Eliminado',
      };

      for (const [backend, ui] of Object.entries(equivalencias)) {
        const demo = cargarYObtener(solicitud({ estado: backend as never }));
        expect(demo.estado).withContext(backend).toBe(ui as never);
      }
    });

    it('avisa por consola ante un estado que no conoce, en vez de disfrazarlo', () => {
      const warn = spyOn(console, 'warn');

      const demo = cargarYObtener(solicitud({ estado: 'EN_TRAMITE' as never }));

      // Sigue cayendo a Elaborado para no romper la UI, pero deja rastro.
      expect(demo.estado).toBe('Elaborado');
      expect(warn).toHaveBeenCalled();
      expect(warn.calls.mostRecent().args[0]).toContain('EN_TRAMITE');
    });

    it('no avisa por NUEVO: es interno y esperado, no un estado olvidado', () => {
      const warn = spyOn(console, 'warn');

      api.obtenerDetalle.and.returnValue(of(solicitud({ estado: 'NUEVO' as never })));
      facade.cargarDetalle('doc-1').subscribe();

      expect(warn).not.toHaveBeenCalled();
    });
  });

  /**
   * Todo documento nace en NUEVO (`@default(NUEVO)` en schema.prisma) y solo al
   * guardar pasa a ELABORADO, que es cuando el backend genera el número formal.
   * Si la cadena de guardado falla a medias, queda un NUEVO huérfano: no es un
   * documento del usuario y no debe aparecer en ninguna bandeja. Antes se
   * listaba etiquetado "Elaborado" y sin número.
   */
  describe('documentos en construcción (NUEVO)', () => {
    it('no aparecen en la bandeja del creador', () => {
      api.bandejaCreador.and.returnValue(
        of([solicitud({ id: 'huerfano', estado: 'NUEVO' as never, numero: null })]),
      );

      facade.cargarBandejaCreador();

      expect(state.solicitudes()).toEqual([]);
    });

    it('no aparecen en la bandeja del aprobador', () => {
      api.bandejaAprobador.and.returnValue(
        of([solicitud({ id: 'huerfano', estado: 'NUEVO' as never })]),
      );

      facade.cargarBandejaAprobador();

      expect(state.solicitudes()).toEqual([]);
    });

    it('no arrastran a los documentos válidos de la misma bandeja', () => {
      api.bandejaCreador.and.returnValue(
        of([
          solicitud({ id: 'huerfano', estado: 'NUEVO' as never }),
          solicitud({ id: 'real', estado: 'VERIFICADO' }),
        ]),
      );

      facade.cargarBandejaCreador();

      expect(state.solicitudes().map(s => s.id)).toEqual(['real']);
    });

    it('el documento recién creado no entra a la lista, pero sí se devuelve', () => {
      api.crear.and.returnValue(of(solicitud({ id: 'recien-creado', estado: 'NUEVO' as never })));
      let creado: { id: string } | undefined;

      facade.crearSolicitud({} as never).subscribe(d => (creado = d));

      // Quien llama necesita el id para seguir la cadena de guardado.
      expect(creado?.id).toBe('recien-creado');
      expect(state.solicitudes()).toEqual([]);
    });

    it('separa el órgano del motivo cuando viene con prefijo [organo]', () => {
      const demo = cargarYObtener(
        solicitud({ asuntoMotivo: '[Dirección de Contabilidad] Ajuste por tipo de cambio' }),
      );

      expect(demo.organoLinea).toBe('Dirección de Contabilidad');
      expect(demo.justificacion).toBe('Ajuste por tipo de cambio');
    });

    it('el organoLinea explícito gana sobre el del prefijo', () => {
      const demo = cargarYObtener(
        solicitud({ organoLinea: 'Órgano real', asuntoMotivo: '[Otro] El motivo' }),
      );

      expect(demo.organoLinea).toBe('Órgano real');
      expect(demo.justificacion).toBe('El motivo');
    });

    it('sin prefijo, el asuntoMotivo entero es la justificación', () => {
      const demo = cargarYObtener(solicitud({ asuntoMotivo: 'Motivo sin corchetes' }));

      expect(demo.justificacion).toBe('Motivo sin corchetes');
      expect(demo.organoLinea).toBe('');
    });

    it('acepta los campos legacy cuando no vienen los nuevos', () => {
      const demo = cargarYObtener(
        solicitud({
          numero: null,
          numeroSolicitud: 'LEGACY-001',
          catDocumento: null,
          tipoDocumento: { nombre: 'Tipo legacy' },
        } as Partial<SolicitudResponse>),
      );

      expect(demo.numero).toBe('LEGACY-001');
      expect(demo.tipoDocumento).toBe('Tipo legacy');
    });

    it('tolera un documento sin creador ni entidad', () => {
      const demo = cargarYObtener(
        solicitud({ creador: null, entidadCreadora: null, unidadCreadora: null }),
      );

      expect(demo.creador).toBe('');
      expect(demo.entidad).toBe('');
      expect(demo.entidadCodigo).toBe('');
      expect(demo.unidad).toBe('');
    });

    it('mapea las cuentas con sus banderas en Sí/No', () => {
      const demo = cargarYObtener(
        solicitud({
          itemsCuenta: [
            {
              id: 'cta-1',
              elemento: '1',
              grupo: '10',
              nombre: 'Efectivo',
              esVigente: true,
              esImputable: false,
              aplicaExtraPresupuestaria: true,
              esReciproca: false,
            },
          ],
        } as Partial<SolicitudResponse>),
      );

      expect(demo.cuentas.length).toBe(1);
      expect(demo.cuentas[0].status).toBe('Activo');
      expect(demo.cuentas[0].imputable).toBe('No');
      expect(demo.cuentas[0].aep).toBe('Sí');
      expect(demo.cuentas[0].reciprocal).toBe('No');
    });

    it('atribuye la aprobación automática a SIAF - RP, no al usuario', () => {
      const demo = cargarYObtener(
        solicitud({
          historialEstados: [
            {
              id: 'h1',
              estadoAnterior: 'VERIFICADO',
              estadoNuevo: 'APROBADO',
              comentario: 'Aprobación automática',
              createdAt: '2026-08-20T11:00:00.000Z',
              creador: { nombres: 'Ana', apellidoPaterno: 'Pérez', apellidoMaterno: 'Ruiz' },
            },
          ],
        } as Partial<SolicitudResponse>),
      );

      expect(demo.historial[0].usuario).toBe('SIAF - RP');
      expect(demo.historial[0].estado).toBe('Aprobado');
    });

    it('un movimiento sin creador queda a nombre de Sistema', () => {
      const demo = cargarYObtener(
        solicitud({
          historialEstados: [
            {
              id: 'h1',
              estadoAnterior: null,
              estadoNuevo: 'ELABORADO',
              comentario: null,
              createdAt: '2026-08-20T11:00:00.000Z',
              creador: null,
            },
          ],
        } as Partial<SolicitudResponse>),
      );

      expect(demo.historial[0].usuario).toBe('Sistema');
    });
  });

  describe('carga de bandeja', () => {
    it('baja el flag de carga al terminar y no deja error', () => {
      api.bandejaCreador.and.returnValue(of([solicitud()]));

      facade.cargarBandejaCreador();

      expect(facade.isLoading()).toBeFalse();
      expect(facade.error()).toBeNull();
      expect(state.solicitudes().length).toBe(1);
    });

    it('propaga el mensaje del backend cuando falla', () => {
      api.bandejaCreador.and.returnValue(
        throwError(() => ({ error: { message: 'Token vencido' } })),
      );

      facade.cargarBandejaCreador();

      expect(facade.error()).toBe('Token vencido');
      expect(facade.isLoading()).toBeFalse();
    });

    it('usa un mensaje genérico si el backend no manda ninguno', () => {
      api.bandejaCreador.and.returnValue(throwError(() => ({})));

      facade.cargarBandejaCreador();

      expect(facade.error()).toBe('Error al cargar la bandeja.');
    });

    it('limpia el error de la carga anterior al reintentar', () => {
      api.bandejaCreador.and.returnValue(throwError(() => ({})));
      facade.cargarBandejaCreador();
      expect(facade.error()).not.toBeNull();

      api.bandejaCreador.and.returnValue(of([solicitud()]));
      facade.cargarBandejaCreador();

      expect(facade.error()).toBeNull();
    });

    it('pasa los tipos pedidos a la API', () => {
      api.bandejaAprobador.and.returnValue(of([]));

      facade.cargarBandejaAprobador(['SCC', 'SRAA']);

      expect(api.bandejaAprobador).toHaveBeenCalledWith(['SCC', 'SRAA'], undefined);
    });
  });

  describe('recargarBandeja', () => {
    it('repite la bandeja del aprobador con los mismos tipos', () => {
      api.bandejaAprobador.and.returnValue(of([]));
      facade.cargarBandejaAprobador(['SRAA']);

      facade.recargarBandeja();

      expect(api.bandejaAprobador).toHaveBeenCalledTimes(2);
      expect(api.bandejaAprobador.calls.mostRecent().args).toEqual([['SRAA'], undefined]);
      expect(api.bandejaCreador).not.toHaveBeenCalled();
    });

    it('recargar conserva también la búsqueda y la página vigentes', () => {
      api.bandejaCreador.and.returnValue(of([]));
      facade.cargarBandejaCreador(['SCC'], { search: 'ajuste', page: 2, limit: 10 });

      facade.recargarBandeja();

      // Tras una acción masiva o el polling, la vista no debe perder lo que
      // el usuario estaba mirando.
      expect(api.bandejaCreador.calls.mostRecent().args)
        .toEqual([['SCC'], { search: 'ajuste', page: 2, limit: 10 }]);
    });

    it('normaliza la respuesta paginada y guarda el total del backend', () => {
      api.bandejaCreador.and.returnValue(of({ data: [solicitud()], total: 87, page: 1, limit: 10 }));

      facade.cargarBandejaCreador(undefined, { page: 1, limit: 10 });

      expect(state.solicitudes().length).toBe(1);
      expect(state.bandejaTotal()).toBe(87);
    });

    it('repite la del creador si esa fue la última vista', () => {
      api.bandejaCreador.and.returnValue(of([]));
      facade.cargarBandejaCreador(['SCC']);

      facade.recargarBandeja();

      expect(api.bandejaCreador).toHaveBeenCalledTimes(2);
      expect(api.bandejaAprobador).not.toHaveBeenCalled();
    });

    it('sin carga previa cae en la del creador', () => {
      api.bandejaCreador.and.returnValue(of([]));

      facade.recargarBandeja();

      expect(api.bandejaCreador).toHaveBeenCalled();
    });
  });

  describe('cambios de estado', () => {
    beforeEach(() => {
      api.bandejaCreador.and.returnValue(of([solicitud()]));
      facade.cargarBandejaCreador();
      api.cambiarEstado.and.returnValue(of({ message: 'ok' }));
    });

    it('tras cambiar el estado vuelve a pedir el detalle y refresca la lista', () => {
      api.obtenerDetalle.and.returnValue(of(solicitud({ estado: 'VERIFICADO' })));

      facade.verificar('doc-1').subscribe();

      // El backend ya no devuelve el documento completo en cambiarEstado.
      expect(api.cambiarEstado).toHaveBeenCalledWith('doc-1', {
        estadoNuevo: 'VERIFICADO',
        comentario: undefined,
        motivo: undefined,
      });
      expect(api.obtenerDetalle).toHaveBeenCalledWith('doc-1');
      expect(state.solicitudes()[0].estado).toBe('Verificado');
    });

    it('cada acción manda su propio estado', () => {
      api.obtenerDetalle.and.returnValue(of(solicitud()));

      facade.aprobar('doc-1').subscribe();
      expect(api.cambiarEstado.calls.mostRecent().args[1].estadoNuevo).toBe('APROBADO');

      facade.eliminar('doc-1').subscribe();
      expect(api.cambiarEstado.calls.mostRecent().args[1].estadoNuevo).toBe('ELIMINADO');
    });

    it('observar y rechazar llevan el comentario del usuario', () => {
      api.obtenerDetalle.and.returnValue(of(solicitud()));

      facade.observar('doc-1', 'Falta el sustento').subscribe();
      expect(api.cambiarEstado.calls.mostRecent().args[1]).toEqual({
        estadoNuevo: 'OBSERVADO',
        comentario: 'Falta el sustento',
        motivo: undefined,
      });

      facade.rechazar('doc-1', 'No corresponde', 'MOTIVO-01').subscribe();
      expect(api.cambiarEstado.calls.mostRecent().args[1]).toEqual({
        estadoNuevo: 'RECHAZADO',
        comentario: 'No corresponde',
        motivo: 'MOTIVO-01',
      });
    });

    it('no toca los otros documentos de la lista', () => {
      api.bandejaCreador.and.returnValue(
        of([solicitud(), solicitud({ id: 'doc-2', estado: 'APROBADO' })]),
      );
      facade.cargarBandejaCreador();
      api.obtenerDetalle.and.returnValue(of(solicitud({ estado: 'VERIFICADO' })));

      facade.verificar('doc-1').subscribe();

      expect(state.solicitudes()[0].estado).toBe('Verificado');
      expect(state.solicitudes()[1].estado).toBe('Aprobado');
    });

    it('si el cambio falla, el error llega a quien llamó y la lista no cambia', () => {
      api.cambiarEstado.and.returnValue(throwError(() => ({ status: 409 })));
      let error: { status?: number } | undefined;

      facade.verificar('doc-1').subscribe({ error: e => (error = e) });

      expect(error?.status).toBe(409);
      expect(api.obtenerDetalle).not.toHaveBeenCalled();
      expect(state.solicitudes()[0].estado).toBe('Elaborado');
    });
  });

  describe('crearSolicitud', () => {
    it('deja el documento nuevo al inicio de la lista', () => {
      api.bandejaCreador.and.returnValue(of([solicitud({ id: 'viejo' })]));
      facade.cargarBandejaCreador();
      api.crear.and.returnValue(of(solicitud({ id: 'nuevo' })));

      facade.crearSolicitud({} as never).subscribe();

      expect(state.solicitudes().map(s => s.id)).toEqual(['nuevo', 'viejo']);
    });

    it('devuelve el documento ya aplanado', () => {
      api.crear.and.returnValue(of(solicitud({ id: 'nuevo' })));
      let creado: { id: string } | undefined;

      facade.crearSolicitud({} as never).subscribe(d => (creado = d));

      expect(creado?.id).toBe('nuevo');
    });
  });

  describe('cargarDetalle', () => {
    it('inserta el documento y apaga el flag de carga', () => {
      api.obtenerDetalle.and.returnValue(of(solicitud()));

      facade.cargarDetalle('doc-1').subscribe();

      expect(state.solicitudes()[0].id).toBe('doc-1');
      expect(facade.isLoading()).toBeFalse();
    });

    it('registra el error y lo vuelve a lanzar', () => {
      api.obtenerDetalle.and.returnValue(
        throwError(() => ({ error: { message: 'No existe' } })),
      );
      let error: unknown;

      facade.cargarDetalle('doc-1').subscribe({ error: e => (error = e) });

      expect(facade.error()).toBe('No existe');
      expect(facade.isLoading()).toBeFalse();
      expect(error).toBeTruthy();
    });
  });
});
