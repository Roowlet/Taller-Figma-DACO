import { TestBed } from '@angular/core/testing';

import { SolicitudesStateService, SolicitudDemo } from './solicitudes-state.service';
import { ESTADO } from '../models/documento.model';

/**
 * Los contadores de bandeja se reescribieron en CC-001: la cadena
 * `estado === A || estado === B || estado === C` pasó a
 * `ESTADOS_RESPUESTA_APROBADOR.includes(estado)`. Estos specs fijan el
 * reparto por grupo con un documento de cada estado, para que ese cambio de
 * forma no altere ningún conteo.
 */
describe('SolicitudesStateService — contadores de bandeja', () => {
  let state: SolicitudesStateService;

  function doc(estado: SolicitudDemo['estado'], id = estado): SolicitudDemo {
    return { id, estado } as SolicitudDemo;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(SolicitudesStateService);
    // Uno de cada estado: cualquier solapamiento o hueco se ve al instante.
    state.loadAll([
      doc(ESTADO.ELABORADO),
      doc(ESTADO.VERIFICADO),
      doc(ESTADO.APROBADO),
      doc(ESTADO.OBSERVADO),
      doc(ESTADO.RECHAZADO),
      doc(ESTADO.ELIMINADO),
    ]);
  });

  describe('creador', () => {
    it('Recibidos = las tres respuestas del aprobador', () => {
      expect(state.creadorRecibidosCount()).toBe(3);
    });

    it('Enviados = solo los verificados', () => {
      expect(state.creadorEnviadosCount()).toBe(1);
    });

    it('Borradores = solo los elaborados', () => {
      expect(state.creadorBorradoresCount()).toBe(1);
    });

    it('Papelera = solo los eliminados', () => {
      expect(state.creadorPapeleraCount()).toBe(1);
    });
  });

  describe('aprobador', () => {
    it('Recibidos = lo que llega para su acción (verificados)', () => {
      expect(state.aprobadorRecibidosCount()).toBe(1);
    });

    it('Enviados = lo que ya respondió', () => {
      expect(state.aprobadorEnviadosCount()).toBe(3);
    });
  });

  it('la bandeja del aprobador excluye Elaborado y Eliminado', () => {
    const estados = state.bandejaAprobador().map(s => s.estado);

    expect(estados).not.toContain(ESTADO.ELABORADO);
    expect(estados).not.toContain(ESTADO.ELIMINADO);
    expect(estados.length).toBe(4);
  });

  it('cada documento cae en exactamente un grupo del creador', () => {
    const suma = state.creadorRecibidosCount() + state.creadorEnviadosCount()
      + state.creadorBorradoresCount() + state.creadorPapeleraCount();

    // 6 documentos, 6 estados, sin solapamientos ni huecos.
    expect(suma).toBe(6);
  });
});
