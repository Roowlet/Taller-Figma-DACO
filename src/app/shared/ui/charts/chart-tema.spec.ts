import { TOKENS_SERIES, colorDeTextoSobre, colorDeToken, contraste, formatearPorcentaje, tokenDeTramo } from './chart-tema';

describe('chart-tema', () => {
  let temaPrevio: string | null;

  beforeEach(() => {
    temaPrevio = document.documentElement.getAttribute('data-theme');
  });

  afterEach(() => {
    if (temaPrevio === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', temaPrevio);
  });

  it('formatearPorcentaje: la parte de un total con un decimal y punto, como el resto del kit', () => {
    expect(formatearPorcentaje(38, 100)).toBe('38.0%');
    expect(formatearPorcentaje(1, 3)).toBe('33.3%');
    expect(formatearPorcentaje(5, 0)).withContext('sin total').toBe('—');
    expect(formatearPorcentaje(null, 10)).toBe('—');
  });

  it('la dona sigue el orden de colores del Figma: primario, éxito y advertencia, y el secundario al final', () => {
    expect([0, 1, 2, 3, 4].map(tokenDeTramo)).toEqual([
      TOKENS_SERIES[0],
      TOKENS_SERIES[2],
      TOKENS_SERIES[3],
      TOKENS_SERIES[1],
      TOKENS_SERIES[0],
    ]);
  });

  it('contraste: la relación WCAG entre dos colores calculados', () => {
    expect(contraste('rgb(255, 255, 255)', 'rgb(0, 0, 0)')).toBeCloseTo(21, 1);
    expect(contraste('rgb(1, 72, 153)', 'rgb(255, 255, 255)')).toBeCloseTo(8.79, 1);
  });

  it('el texto sobre cada color de la paleta llega a 4.5:1 en claro y en oscuro, y no siempre es blanco', () => {
    const blanco = (): string => colorDeToken(document.body, '--sys-color-text-brand-white');
    for (const tema of ['light', 'dark']) {
      document.documentElement.setAttribute('data-theme', tema);
      for (const token of TOKENS_SERIES) {
        const fondo = colorDeToken(document.body, token);
        expect(contraste(colorDeTextoSobre(document.body, fondo), fondo)).withContext(`${tema} ${token}`).toBeGreaterThanOrEqual(4.5);
      }
    }

    // El blanco del Figma sobre el dorado (3.39:1 en claro) no pasa: se elige otro color.
    document.documentElement.setAttribute('data-theme', 'light');
    const dorado = colorDeToken(document.body, '--sys-color-bg-feedback-dark-warning');
    expect(colorDeTextoSobre(document.body, dorado)).not.toBe(blanco());
  });
});
