import { ddmmyyyyToIso, formatFechaCorta, formatFechaHora, isoToDdmmyyyy } from './fecha.util';

describe('fecha.util (compartido)', () => {
  describe('ddmmyyyyToIso', () => {
    it('convierte dd/mm/yyyy a yyyy-MM-dd', () => {
      expect(ddmmyyyyToIso('13/02/2026')).toBe('2026-02-13');
    });

    it('devuelve cadena vacía si el formato es inválido', () => {
      expect(ddmmyyyyToIso('2026-02-13')).toBe('');
      expect(ddmmyyyyToIso('')).toBe('');
    });
  });

  describe('isoToDdmmyyyy', () => {
    it('convierte yyyy-MM-dd a dd/mm/yyyy', () => {
      expect(isoToDdmmyyyy('2026-02-13')).toBe('13/02/2026');
    });

    it('acepta datetime ISO completo (toma solo la fecha)', () => {
      expect(isoToDdmmyyyy('2026-02-13T15:30:00.000Z')).toBe('13/02/2026');
    });

    it('devuelve cadena vacía si el formato es inválido', () => {
      expect(isoToDdmmyyyy('13/02/2026')).toBe('');
      expect(isoToDdmmyyyy('')).toBe('');
    });
  });

  it('las conversiones son inversas entre sí', () => {
    expect(isoToDdmmyyyy(ddmmyyyyToIso('31/12/2026'))).toBe('31/12/2026');
  });

  describe('formatFechaCorta', () => {
    it('formatea con día y mes de dos dígitos', () => {
      expect(formatFechaCorta('2026-02-03T05:00:00.000Z')).toMatch(/^\d{2}\/\d{2}\/2026$/);
    });

    it('devuelve "—" si viene vacío y el original si no es fecha', () => {
      expect(formatFechaCorta(null)).toBe('—');
      expect(formatFechaCorta('')).toBe('—');
      expect(formatFechaCorta('no-es-fecha')).toBe('no-es-fecha');
    });
  });

  describe('formatFechaHora', () => {
    it('incluye fecha y hora', () => {
      expect(formatFechaHora('2026-02-03T15:30:00')).toMatch(/^\d{2}\/\d{2}\/2026, \d{2}:\d{2}/);
    });

    it('devuelve "—" si viene vacío', () => {
      expect(formatFechaHora(undefined)).toBe('—');
    });
  });
});
