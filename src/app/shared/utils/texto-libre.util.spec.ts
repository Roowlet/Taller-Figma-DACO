import { MIN_CARACTERES_TEXTO_LIBRE, cumpleMinimoTextoLibre } from './texto-libre.util';

describe('cumpleMinimoTextoLibre', () => {
  it('el mínimo acordado es 3', () => {
    expect(MIN_CARACTERES_TEXTO_LIBRE).toBe(3);
  });

  it('rechaza vacío, una letra suelta y dos', () => {
    expect(cumpleMinimoTextoLibre('')).toBeFalse();
    expect(cumpleMinimoTextoLibre('a')).toBeFalse();
    expect(cumpleMinimoTextoLibre('ab')).toBeFalse();
  });

  it('rechaza texto que solo son espacios', () => {
    expect(cumpleMinimoTextoLibre('     ')).toBeFalse();
    expect(cumpleMinimoTextoLibre(' a ')).toBeFalse();
  });

  it('acepta desde el mínimo en adelante', () => {
    expect(cumpleMinimoTextoLibre('abc')).toBeTrue();
    expect(cumpleMinimoTextoLibre('Ajuste por tipo de cambio')).toBeTrue();
  });

  it('tolera null/undefined sin romper', () => {
    expect(cumpleMinimoTextoLibre(null as unknown as string)).toBeFalse();
    expect(cumpleMinimoTextoLibre(undefined as unknown as string)).toBeFalse();
  });
});
