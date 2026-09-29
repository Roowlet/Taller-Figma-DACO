/**
 * Normaliza un string para comparaciones case/diacritic-insensitive:
 * - minúsculas
 * - sin marcas combinatorias (acentos, tildes, diéresis)
 *
 * Útil para filtrar tablas con búsqueda libre ("buscar 'Compra'"
 * encuentra "COMPRA" y "Comprá").
 */
export function normalizarTexto(s: string | null | undefined): string {
  return (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
