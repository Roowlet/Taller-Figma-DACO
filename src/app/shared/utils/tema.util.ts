/**
 * Tema claro/oscuro de la app: una sola preferencia guardada en `localStorage`
 * y aplicada como `data-theme` en `<html>`, que es donde `styles/tokens/themes`
 * redefine los tokens. La usan el navbar del shell y el catálogo público /ui-kit.
 */
export type TemaApp = 'light' | 'dark';

export const CLAVE_TEMA = 'siaf-theme';

export function leerTemaGuardado(): TemaApp {
  if (typeof localStorage === 'undefined') return 'light';
  return localStorage.getItem(CLAVE_TEMA) === 'dark' ? 'dark' : 'light';
}

export function aplicarTema(documento: Document, tema: TemaApp): void {
  documento.documentElement.setAttribute('data-theme', tema);
  if (typeof localStorage !== 'undefined') localStorage.setItem(CLAVE_TEMA, tema);
}
