/** Modelo del catálogo de componentes (/ui-kit). El manifiesto lo genera `scripts/generar-ui-kit.mjs`. */

export interface EntradaComponente {
  nombre: string;
  /** Tipo resuelto por el compilador (uniones de literales incluidas). */
  tipo: string;
  /** Valor inicial tal como está en el código; null si no tiene o se calcula. */
  porDefecto: string | null;
  requerida: boolean;
  descripcion: string | null;
}

export interface EventoComponente {
  nombre: string;
  /** Tipo del valor emitido. */
  tipo: string;
  descripcion: string | null;
}

export interface FichaComponente {
  selector: string;
  clase: string;
  tipo: 'componente' | 'directiva';
  /** `ui` design system agnóstico · `components` transversales · `layout` armazón de la app. */
  capa: 'ui' | 'components' | 'layout';
  /** Ruta de import con alias de tsconfig. */
  importacion: string;
  archivo: string;
  /** JSDoc de la clase. */
  descripcion: string;
  /** Importa API, estado o autenticación: no se renderiza en vivo en una ruta pública. */
  usaSesion: boolean;
  /** Ninguna pantalla lo pinta ni lo carga una ruta (sin contar el catálogo ni los specs). */
  sinUso?: boolean;
  /** Tiene `<ng-content>`: se usa con etiqueta de apertura y cierre. */
  proyectaContenido: boolean;
  entradas: EntradaComponente[];
  eventos: EventoComponente[];
  /** Pestaña Uso: `@usar` y `@evitar` del JSDoc (mismo Markdown que la descripción). */
  usar: string | null;
  evitar: string | null;
  /** Pestaña Accesibilidad: `@teclado` y `@accesibilidad` del JSDoc. */
  teclado: string | null;
  accesibilidad: string | null;
  /** Nodos del Figma UI KIT: `@figma 2588:135 Nombre` y los «nodo 1234:567» citados en la descripción. */
  figma: NodoFigma[];
  /** Roles y atributos ARIA que declara la plantilla, el host o el código. */
  aria: { roles: string[]; atributos: string[] };
  /** Tokens `--sys-*` que usa, con `var()` directo o vía utilidades de Tailwind conectadas a un token. */
  tokens: TokenUsado[];
  /** Selectores de otros componentes del catálogo que pinta por dentro. */
  usa: string[];
}

export interface NodoFigma {
  /** `2588:135`. */
  nodo: string;
  nombre: string | null;
}

export interface TokenUsado {
  token: string;
  /** Cómo lo usa: `var()` o las utilidades de Tailwind (`bg-surface`, `rounded-siaf-md`…). */
  via: string[];
}

// ── Fundamentos visuales: los genera `scripts/ui-kit-fundamentos.mjs` desde los tokens de src/styles ──

export interface TokenColor {
  nombre: string;
  /** Valor resuelto con `data-theme="light"`; null si el token solo existe en oscuro. */
  claro: string | null;
  /** Valor resuelto con `data-theme="dark"`. */
  oscuro: string | null;
  /** El tema oscuro no lo cambia: usa el valor claro en ambos temas. */
  sinOscuro: boolean;
  /** Solo lo define el tema oscuro; en claro, quien lo usa depende de su respaldo en `var()`. */
  soloOscuro: boolean;
  /** Utilidades de Tailwind conectadas al token, p. ej. `bg-surface`. */
  utilidades: string[];
  /** Definido a mano en los CSS del proyecto, no exportado de Figma. */
  manual: boolean;
}

export interface GrupoColor {
  id: string;
  titulo: string;
  tokens: TokenColor[];
}

export interface FamiliaPaleta {
  familia: string;
  tonos: { tono: string; valor: string; variable: string }[];
}

/** Un token de medida con su valor por tamaño de pantalla (escritorio > 1023 px, tablet ≤ 1023, móvil ≤ 767). */
export interface TokenMedida {
  token: string;
  escala: string;
  escritorio: string | null;
  tablet: string | null;
  movil: string | null;
  utilidades: string[];
}

export interface TokenTamanoTexto {
  token: string;
  rol: string;
  escritorio: string | null;
  tablet: string | null;
  movil: string | null;
}

export interface TokenValor {
  token: string;
  nombre: string;
  valor: string | null;
}

export interface TokenSombra {
  token: string;
  nombre: string;
  claro: string | null;
  /** null: el tema oscuro no la redefine y usa la sombra clara. */
  oscuro: string | null;
  utilidades: string[];
}

export interface VariableSinDefinir {
  nombre: string;
  archivos: string[];
  /** Algún uso no trae valor de respaldo en `var()`: ahí la propiedad queda sin valor. */
  sinRespaldo: boolean;
}

export interface FundamentosUiKit {
  colores: GrupoColor[];
  paleta: FamiliaPaleta[];
  tipografia: {
    familia: string | null;
    monospace: string | null;
    tamanos: TokenTamanoTexto[];
    pesos: TokenValor[];
    interlineados: TokenValor[];
  };
  espaciado: { gap: TokenMedida[]; padding: TokenMedida[]; contenedores: TokenMedida[] };
  radios: TokenMedida[];
  bordes: TokenMedida[];
  sombras: TokenSombra[];
  /** Superficie de cada tema, para pintar las muestras de sombra sobre su fondo real. */
  superficie: { claro: string | null; oscuro: string | null };
  iconos: { tamanos: TokenMedida[]; nombres: string[] };
  sinDefinir: VariableSinDefinir[];
}
