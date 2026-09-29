export { normalizarTexto } from './text.util';
export { buildProcessBreadcrumbs, buildProcessPath } from './breadcrumbs.util';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function createVariantClass(
  base: string,
  variants: Record<string, string>,
  selected: string | string[]
): string {
  const variantClasses = Array.isArray(selected)
    ? selected.map(s => variants[s] || '').join(' ')
    : variants[selected] || '';
  return cn(base, variantClasses);
}
