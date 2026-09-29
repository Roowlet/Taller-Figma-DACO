import { ESTADO, ESTADOS_DOCUMENTO } from './documento.model';

describe('ESTADO (etiquetas de UI)', () => {
  /**
   * Los valores se comparan y se muestran en toda la app. Fijarlos aquí evita
   * que un renombrado accidental pase silencioso: cambiar una etiqueta debe
   * ser una decisión, no un descuido.
   */
  it('conserva exactamente las etiquetas que la UI espera', () => {
    expect(ESTADO).toEqual({
      ELABORADO: 'Elaborado',
      VERIFICADO: 'Verificado',
      APROBADO: 'Aprobado',
      RECHAZADO: 'Rechazado',
      OBSERVADO: 'Observado',
      ELIMINADO: 'Eliminado',
    });
  });

  it('cubre todos los estados del backend salvo NUEVO, que es interno', () => {
    // NUEVO no se muestra: el documento nace ahí y solo al guardar pasa a
    // ELABORADO. Ver el filtro `esVisible` del facade.
    const delBackend = ESTADOS_DOCUMENTO.filter(e => e !== 'NUEVO');
    const deLaUi = Object.keys(ESTADO);

    expect(deLaUi.sort()).toEqual([...delBackend].sort());
  });

  it('cada etiqueta es la versión capitalizada de su clave', () => {
    for (const [clave, etiqueta] of Object.entries(ESTADO)) {
      expect(etiqueta.toUpperCase()).toBe(clave);
    }
  });
});
