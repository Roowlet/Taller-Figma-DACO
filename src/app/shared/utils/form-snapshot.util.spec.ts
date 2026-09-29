import {
  crearSnapshotFormulario,
  hayCambiosRespectoAlSnapshot,
  identidadArchivo,
} from './form-snapshot.util';

describe('hayCambiosRespectoAlSnapshot', () => {
  it('no hay cambios si el formulario quedó igual', () => {
    const foto = crearSnapshotFormulario({ glosa: 'Ajuste', importe: 10.5 });

    expect(hayCambiosRespectoAlSnapshot(foto, crearSnapshotFormulario({ glosa: 'Ajuste', importe: 10.5 }))).toBeFalse();
  });

  it('detecta el cambio de un campo de texto', () => {
    const foto = crearSnapshotFormulario({ glosa: 'Ajuste' });

    expect(hayCambiosRespectoAlSnapshot(foto, crearSnapshotFormulario({ glosa: 'Ajuste corregido' }))).toBeTrue();
  });

  it('detecta el cambio de un importe', () => {
    const foto = crearSnapshotFormulario({ cuentas: ['1.1|Debe|10'] });

    expect(hayCambiosRespectoAlSnapshot(foto, crearSnapshotFormulario({ cuentas: ['1.1|Debe|10.5'] }))).toBeTrue();
  });

  it('detecta que se agregó o quitó una fila', () => {
    const foto = crearSnapshotFormulario({ cuentas: ['a', 'b'] });

    expect(hayCambiosRespectoAlSnapshot(foto, crearSnapshotFormulario({ cuentas: ['a'] }))).toBeTrue();
  });

  describe('fail-open: ante la duda, deja grabar', () => {
    // Un falso positivo solo permite un guardado inocuo; un falso negativo
    // dejaría al usuario sin poder grabar algo que sí editó.
    it('sin foto previa (documento nuevo) siempre hay cambios', () => {
      expect(hayCambiosRespectoAlSnapshot(null, crearSnapshotFormulario({ glosa: '' }))).toBeTrue();
      expect(hayCambiosRespectoAlSnapshot(undefined, crearSnapshotFormulario({ glosa: '' }))).toBeTrue();
    });
  });
});

describe('identidadArchivo', () => {
  it('distingue dos archivos con nombre distinto', () => {
    expect(identidadArchivo({ name: 'a.pdf', size: 100 }))
      .not.toBe(identidadArchivo({ name: 'b.pdf', size: 100 }));
  });

  it('distingue dos archivos con el mismo nombre pero distinto peso', () => {
    expect(identidadArchivo({ name: 'sustento.pdf', size: 100 }))
      .not.toBe(identidadArchivo({ name: 'sustento.pdf', size: 250 }));
  });

  it('el mismo archivo da la misma identidad aunque sea otro objeto File', () => {
    expect(identidadArchivo({ name: 'sustento.pdf', size: 100 }))
      .toBe(identidadArchivo({ name: 'sustento.pdf', size: 100 }));
  });

  it('tolera el adjunto que viene del backend, que no trae peso', () => {
    expect(identidadArchivo({ name: 'sustento.pdf' })).toBe('sustento.pdf::');
  });

  it('sin archivo devuelve null', () => {
    expect(identidadArchivo(null)).toBeNull();
    expect(identidadArchivo(undefined)).toBeNull();
  });
});
