import { normalizarTexto } from './text.util';

describe('normalizarTexto', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(normalizarTexto('Áéíóú Ñ')).toBe('aeiou n');
  });

  it('trata null/undefined como cadena vacía', () => {
    expect(normalizarTexto(null)).toBe('');
    expect(normalizarTexto(undefined)).toBe('');
  });

  it('deja los caracteres ya normalizados sin cambio', () => {
    expect(normalizarTexto('compra')).toBe('compra');
  });
});
