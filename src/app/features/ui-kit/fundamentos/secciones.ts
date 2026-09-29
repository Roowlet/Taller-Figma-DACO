/** Secciones de «Fundamentos visuales» del catálogo, en el orden del índice. */
export interface SeccionFundamento {
  id: string;
  titulo: string;
  descripcion: string;
  /** Palabras que también la encuentran en el buscador del catálogo. */
  claves: string[];
}

export const SECCIONES_FUNDAMENTOS: readonly SeccionFundamento[] = [
  {
    id: 'color',
    titulo: 'Color',
    descripcion:
      'Tokens semánticos con su valor en tema claro y oscuro. Usa siempre el token por su función (fondo, texto, ícono, borde); la paleta tonal es la fuente de la que salen y no se usa directo.',
    claves: ['colores', 'tokens', 'paleta', 'tema', 'oscuro', 'claro', 'sys-color'],
  },
  {
    id: 'tipografia',
    titulo: 'Tipografía',
    descripcion: 'Familia, escala de tamaños por pantalla, pesos e interlineados. Los tamaños bajan en tablet y móvil.',
    claves: ['texto', 'fuente', 'inter', 'tamaños', 'pesos', 'heading', 'body', 'caption'],
  },
  {
    id: 'espaciado',
    titulo: 'Espaciado',
    descripcion: 'Escala base de separaciones (gap) y rellenos (padding), y los espaciados de contenedores del Figma.',
    claves: ['spacing', 'gap', 'padding', 'margen', 'siaf-md'],
  },
  {
    id: 'radios-y-bordes',
    titulo: 'Radios y bordes',
    descripcion: 'Redondeo de esquinas y grosores de línea.',
    claves: ['radius', 'rounded', 'esquinas', 'borde', 'grosor'],
  },
  {
    id: 'sombras',
    titulo: 'Sombras',
    descripcion: 'Elevaciones de tarjetas, popovers y menús, con su versión en tema oscuro.',
    claves: ['shadow', 'elevación', 'elevation'],
  },
  {
    id: 'iconos',
    titulo: 'Íconos',
    descripcion:
      'Todos los nombres de Material Icons que acepta siaf-icon. Solo se usan íconos de este paquete: npm run icons:check valida los nombres en CI.',
    claves: ['icon', 'material', 'siaf-icon', 'iconografía'],
  },
  {
    id: 'revision-de-tokens',
    titulo: 'Revisión de tokens',
    descripcion: 'Lo que conviene corregir: variables que la app usa y no existen, y colores que no cambian en tema oscuro.',
    claves: ['sin definir', 'errores', 'hallazgos', 'variables'],
  },
];

const normalizar = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Secciones que coinciden con la búsqueda del catálogo (todas si está vacía). */
export function filtrarSecciones(busqueda: string): SeccionFundamento[] {
  const q = normalizar(busqueda);
  if (!q) return [...SECCIONES_FUNDAMENTOS];
  return SECCIONES_FUNDAMENTOS.filter((s) => [s.titulo, ...s.claves].some((texto) => normalizar(texto).includes(q)));
}
