import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';

/** Valor de un token para mostrarlo en una ficha: color claro/oscuro, medida o sombra. */
export interface ValorToken {
  tipo: 'color' | 'medida' | 'sombra';
  claro: string | null;
  oscuro: string | null;
}

const INDICE = new Map<string, ValorToken>();
for (const t of FUNDAMENTOS_UI_KIT.colores.flatMap((g) => g.tokens)) INDICE.set(t.nombre, { tipo: 'color', claro: t.claro, oscuro: t.oscuro });
for (const s of FUNDAMENTOS_UI_KIT.sombras) INDICE.set(s.token, { tipo: 'sombra', claro: s.claro, oscuro: s.oscuro ?? s.claro });
const medidas = [
  ...FUNDAMENTOS_UI_KIT.espaciado.gap,
  ...FUNDAMENTOS_UI_KIT.espaciado.padding,
  ...FUNDAMENTOS_UI_KIT.radios,
  ...FUNDAMENTOS_UI_KIT.bordes,
  ...FUNDAMENTOS_UI_KIT.tipografia.tamanos,
];
for (const m of medidas) INDICE.set(m.token, { tipo: 'medida', claro: m.escritorio, oscuro: null });

/** Sección de Fundamentos donde se ve el token. */
export function seccionDeToken(token: string): string {
  if (token.startsWith('--sys-color-')) return 'color';
  if (token.startsWith('--sys-shadow-')) return 'sombras';
  if (token.startsWith('--sys-radius-') || token.startsWith('--sys-border-')) return 'radios-y-bordes';
  if (token.startsWith('--sys-typography-')) return 'tipografia';
  return 'espaciado';
}

export function valorDeToken(token: string): ValorToken | null {
  return INDICE.get(token) ?? null;
}
