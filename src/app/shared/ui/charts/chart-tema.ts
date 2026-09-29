/**
 * Piezas comunes de los gráficos del kit (Figma UI KIT, página «Graphics»): la paleta de series, la lectura de los
 * tokens como colores calculados y el aviso de cambio de tema. Chart.js pinta en un canvas, que no entiende
 * `var(--token)`: los colores se resuelven con `getComputedStyle` y se vuelven a leer al cambiar de tema.
 */

/** Tokens de las series, en el orden del Figma: primaria, secundaria, éxito y advertencia. */
export const TOKENS_SERIES = [
  '--sys-color-bg-brand-primary',
  '--sys-color-bg-brand-secondary',
  '--sys-color-bg-feedback-dark-success',
  '--sys-color-bg-feedback-dark-warning',
] as const;

/** Token de la serie `indice`; con más de cuatro series la paleta da la vuelta. */
export function tokenDeSerie(indice: number): string {
  return TOKENS_SERIES[indice % TOKENS_SERIES.length];
}

/** Tokens de los tramos de la dona, en el orden del Figma («Progress»): primaria, éxito y advertencia, y la secundaria al final. */
export const TOKENS_DONA = [TOKENS_SERIES[0], TOKENS_SERIES[2], TOKENS_SERIES[3], TOKENS_SERIES[1]] as const;

/** Token del tramo `indice` de la dona; con más de cuatro tramos la paleta da la vuelta. */
export function tokenDeTramo(indice: number): string {
  return TOKENS_DONA[indice % TOKENS_DONA.length];
}

/**
 * Candidatos para el texto que va encima de un color de la paleta (el porcentaje dentro de un tramo): blanco, el texto
 * oscuro del tema claro y la superficie, que es oscura en el tema oscuro. Gana el de más contraste: el blanco del Figma no
 * llega a 4.5:1 sobre el dorado en claro, ni sobre el verde y el dorado en oscuro.
 */
export const TOKENS_TEXTO_SOBRE_COLOR = ['--sys-color-text-brand-white', '--sys-color-text-neutral-high', '--sys-color-bg-surfaces-surface'] as const;

function luminancia(color: string): number {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map((canal) => {
    const valor = Number(canal) / 255;
    return valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Relación de contraste WCAG entre dos colores calculados (`rgb()` o `rgba()`; la transparencia no se considera). */
export function contraste(a: string, b: string): number {
  const [clara, oscura] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (clara + 0.05) / (oscura + 0.05);
}

/** Color de texto con más contraste sobre `fondo` entre `TOKENS_TEXTO_SOBRE_COLOR`, leído en el tema vigente. */
export function colorDeTextoSobre(contexto: HTMLElement, fondo: string): string {
  return TOKENS_TEXTO_SOBRE_COLOR.map((token) => colorDeToken(contexto, token)).reduce((mejor, color) =>
    contraste(color, fondo) > contraste(mejor, fondo) ? color : mejor,
  );
}

/**
 * Color calculado de un token (`rgb()` o `rgba()` con comas), leído dentro de `contexto` para respetar el tema que
 * aplique ahí. Chart.js y el canvas lo entienden en cualquier navegador.
 */
export function colorDeToken(contexto: HTMLElement, token: string): string {
  const sonda = contexto.ownerDocument.createElement('span');
  sonda.style.color = `var(${token})`;
  sonda.style.display = 'none';
  contexto.appendChild(sonda);
  const color = getComputedStyle(sonda).color;
  sonda.remove();
  return color;
}

/** Avisa cuando cambia el tema: el atributo `data-theme` de la raíz o, en modo sistema, la preferencia de color. */
export function alCambiarTema(documento: Document, avisar: () => void): () => void {
  const observador = new MutationObserver(() => avisar());
  observador.observe(documento.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const preferencia = documento.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  preferencia?.addEventListener('change', avisar);
  return () => {
    observador.disconnect();
    preferencia?.removeEventListener('change', avisar);
  };
}

const NUMERO = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
const PORCENTAJE = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Valor para ejes, tooltip y tabla de datos: número en formato peruano y sufijo opcional (`%`). */
export function formatearValor(valor: number | null | undefined, sufijo = ''): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—';
  return `${NUMERO.format(valor)}${sufijo}`;
}

/** Parte de un total como porcentaje con un decimal, en formato peruano («38.0%»); sin total, «—». */
export function formatearPorcentaje(parte: number | null | undefined, total: number): string {
  if (parte === null || parte === undefined || !Number.isFinite(parte) || !(total > 0)) return '—';
  return `${PORCENTAJE.format((parte / total) * 100)}%`;
}
