import { Type } from '@angular/core';

import { EJEMPLOS_RESPONSIVE, EJEMPLO_POR_SELECTOR, MOTIVO_SIN_EJEMPLO, VistaResponsive } from './ejemplos';
import { ValorToken, seccionDeToken, valorDeToken } from './fundamentos/valores';
import { CATEGORIAS_UI_KIT, CATEGORIA_POR_SELECTOR, CategoriaUiKit, SELECTORES_OCULTOS } from './ui-kit.catalogo';
import { FichaComponente } from './ui-kit.model';

/** Archivo «UI KIT SIAF-RP» del Figma: los nodos de `@figma` apuntan a él. */
export const ARCHIVO_FIGMA_UI_KIT = 'mJrG11d0rWf7BjPuE2ApPZ';

/** Trozo de texto de la descripción: plano, `código` entre backticks o **negrita**. */
export interface SegmentoTexto {
  tipo: 'texto' | 'codigo' | 'negrita';
  texto: string;
  /** Id de la ficha que nombra un `código` (`siaf-records-search-toolbar`): la ficha lo pinta como enlace a ella. */
  enlace?: string;
}

/** Bloque de la descripción: párrafo, lista (con viñetas o numerada) o bloque de código. */
export type BloqueDescripcion =
  | { tipo: 'parrafo'; segmentos: SegmentoTexto[] }
  | { tipo: 'lista'; ordenada: boolean; items: SegmentoTexto[][] }
  | { tipo: 'codigo'; texto: string };

export interface FichaVista extends FichaComponente {
  /** Cómo se escribe al usarlo: el selector de etiqueta tal cual; en una directiva, el atributo sin corchetes. */
  nombre: string;
  /** Ancla de la ficha en la URL (`/ui-kit#siaf-menu`). */
  id: string;
  bloques: BloqueDescripcion[];
  snippetImport: string;
  snippetUso: string;
  ejemplo: Type<{ selector: string }> | null;
  /** Si se muestra en marcos de escritorio y móvil en vez de en línea. */
  responsive: VistaResponsive | null;
  /** Por qué no hay ejemplo en vivo; null si lo hay. */
  motivoSinEjemplo: string | null;
  /** Pestañas Uso y Accesibilidad: las etiquetas del JSDoc ya convertidas en bloques. */
  bloquesUsar: BloqueDescripcion[];
  bloquesEvitar: BloqueDescripcion[];
  bloquesTeclado: BloqueDescripcion[];
  bloquesAccesibilidad: BloqueDescripcion[];
  /** Pestaña Especificaciones. */
  enlacesFigma: { nodo: string; nombre: string | null; url: string }[];
  tokensConValor: { token: string; via: string[]; valor: ValorToken | null; seccion: string }[];
  componentesUsados: { selector: string; nombre: string; id: string }[];
  /**
   * «Lo usan»: los componentes del catálogo que lo pintan por dentro, la relación inversa de `componentesUsados`. Los
   * ocultos del catálogo (`SELECTORES_OCULTOS`) van con `enCatalogo` en false: no tienen ficha a la que enlazar.
   */
  usadoPor: { selector: string; nombre: string; id: string; enCatalogo: boolean }[];
}

export interface GrupoUiKit {
  categoria: CategoriaUiKit;
  fichas: FichaVista[];
}

export const MOTIVO_SESION =
  'Consulta la API con la sesión del usuario y todavía no tiene datos de muestra para verse en esta página pública.';

/** `[siafTooltip]` → `siafTooltip`: los corchetes declaran un selector de atributo, no se escriben al usarlo. */
export function nombreDeUso(selector: string): string {
  return /^\[[^\]]+\]$/.test(selector) ? selector.slice(1, -1) : selector;
}

export function idDeSelector(selector: string): string {
  return selector.replace(/[^a-zA-Z0-9-]/g, '');
}

export function segmentar(texto: string): SegmentoTexto[] {
  return texto
    .split('`')
    .flatMap((trozo, i): SegmentoTexto[] => {
      if (i % 2 === 1) return [{ tipo: 'codigo', texto: trozo }];
      return trozo.split('**').map((t, j): SegmentoTexto => ({ tipo: j % 2 === 1 ? 'negrita' : 'texto', texto: t }));
    })
    .filter((seg) => seg.texto.length > 0);
}

const MARCA_LISTA = /^\s*([-*]|\d+\.)\s+/;
const SANGRIA = /^\s{2,}\S/;
const FENCE = '```';

/** Quita la sangría común a todas las líneas de un bloque de código. */
function sinSangria(lineas: string[]): string {
  const conTexto = lineas.filter((l) => l.trim());
  const minima = conTexto.length ? Math.min(...conTexto.map((l) => l.length - l.trimStart().length)) : 0;
  return lineas.map((l) => l.slice(minima)).join('\n').replace(/\s+$/, '');
}

/**
 * JSDoc → bloques, con el Markdown que usan los comentarios del proyecto: párrafos separados
 * por línea en blanco, listas `-`/`*`/`1.` (una línea con sangría continúa el ítem), bloques
 * entre triple backtick y ejemplos con sangría.
 */
export function bloquesDeDescripcion(descripcion: string): BloqueDescripcion[] {
  const lineas = descripcion.split('\n');
  const bloques: BloqueDescripcion[] = [];
  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    if (!linea.trim()) {
      i++;
      continue;
    }

    if (linea.trim().startsWith(FENCE)) {
      const codigo: string[] = [];
      i++;
      while (i < lineas.length && !lineas[i].trim().startsWith(FENCE)) codigo.push(lineas[i++]);
      i++;
      bloques.push({ tipo: 'codigo', texto: sinSangria(codigo) });
      continue;
    }

    if (MARCA_LISTA.test(linea)) {
      const items: string[] = [];
      const ordenada = /^\s*\d+\./.test(linea);
      while (i < lineas.length && lineas[i].trim()) {
        if (MARCA_LISTA.test(lineas[i])) items.push(lineas[i].replace(MARCA_LISTA, '').trim());
        else if (SANGRIA.test(lineas[i]) && items.length) items[items.length - 1] += ` ${lineas[i].trim()}`;
        else break;
        i++;
      }
      bloques.push({ tipo: 'lista', ordenada, items: items.map(segmentar) });
      continue;
    }

    if (SANGRIA.test(linea)) {
      const codigo: string[] = [];
      while (i < lineas.length && (SANGRIA.test(lineas[i]) || (!lineas[i].trim() && SANGRIA.test(lineas[i + 1] ?? '')))) {
        codigo.push(lineas[i++]);
      }
      bloques.push({ tipo: 'codigo', texto: sinSangria(codigo) });
      continue;
    }

    const parrafo: string[] = [];
    while (
      i < lineas.length &&
      lineas[i].trim() &&
      !MARCA_LISTA.test(lineas[i]) &&
      !SANGRIA.test(lineas[i]) &&
      !lineas[i].trim().startsWith(FENCE)
    ) {
      parrafo.push(lineas[i++].trim());
    }
    bloques.push({ tipo: 'parrafo', segmentos: segmentar(parrafo.join(' ')) });
  }
  return bloques;
}

/** `import { X } from '…';` con el alias de tsconfig. */
export function snippetImport(f: FichaComponente): string {
  return `import { ${f.clase} } from '${f.importacion}';`;
}

/** Etiqueta mínima de uso: las entradas obligatorias y, si proyecta contenido, la etiqueta de cierre. */
export function snippetUso(f: FichaComponente): string {
  const obligatorias = f.entradas.filter((e) => e.requerida).map((e) => `[${e.nombre}]="…"`);
  if (f.selector.startsWith('[')) {
    const atributo = f.selector.slice(1, -1);
    return `<span ${atributo}="…"></span>`;
  }
  const atributos = obligatorias.length ? ` ${obligatorias.join(' ')}` : '';
  return f.proyectaContenido ? `<${f.selector}${atributos}>…</${f.selector}>` : `<${f.selector}${atributos} />`;
}

export function aVista(f: FichaComponente): FichaVista {
  // Los que usan la API también tienen ejemplo: sus servicios los reemplaza `ejemplos/datos-de-muestra.ts`.
  const ejemplo = EJEMPLO_POR_SELECTOR.get(f.selector) ?? null;
  return {
    ...f,
    id: idDeSelector(f.selector),
    nombre: nombreDeUso(f.selector),
    bloques: bloquesDeDescripcion(f.descripcion),
    snippetImport: snippetImport(f),
    snippetUso: snippetUso(f),
    ejemplo,
    responsive: ejemplo ? (EJEMPLOS_RESPONSIVE[f.selector] ?? null) : null,
    motivoSinEjemplo: ejemplo ? null : f.usaSesion ? MOTIVO_SESION : (MOTIVO_SIN_EJEMPLO[f.selector] ?? 'Todavía no tiene ejemplo en vivo.'),
    bloquesUsar: bloquesDeDescripcion(f.usar ?? ''),
    bloquesEvitar: bloquesDeDescripcion(f.evitar ?? ''),
    bloquesTeclado: bloquesDeDescripcion(f.teclado ?? ''),
    bloquesAccesibilidad: bloquesDeDescripcion(f.accesibilidad ?? ''),
    enlacesFigma: f.figma.map((n) => ({ ...n, url: urlDeNodoFigma(n.nodo) })),
    tokensConValor: f.tokens.map((t) => ({ ...t, valor: valorDeToken(t.token), seccion: seccionDeToken(t.token) })),
    componentesUsados: f.usa.map((selector) => ({ selector, nombre: nombreDeUso(selector), id: idDeSelector(selector) })),
    usadoPor: [],
  };
}

/** Los componentes del manifiesto que pintan `selector` por dentro, por nombre; los ocultos del catálogo, sin ficha. */
export function usuariosDe(selector: string, fichas: readonly FichaComponente[]): FichaVista['usadoPor'] {
  return fichas
    .filter((f) => f.selector !== selector && f.usa.includes(selector))
    .map((f) => ({ selector: f.selector, nombre: nombreDeUso(f.selector), id: idDeSelector(f.selector), enCatalogo: !SELECTORES_OCULTOS.includes(f.selector) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/** `2588:135` → enlace al nodo en el archivo del UI KIT. */
export function urlDeNodoFigma(nodo: string): string {
  return `https://www.figma.com/design/${ARCHIVO_FIGMA_UI_KIT}/?node-id=${nodo.replace(':', '-')}`;
}

/** Orden en que se declaran en `CATEGORIA_POR_SELECTOR`: lo más básico primero. */
const ORDEN_CURADO = Object.keys(CATEGORIA_POR_SELECTOR);

/**
 * Enlaza las fichas entre sí: un `código` de la documentación que nombra otra ficha visible (por su nombre de uso o su
 * selector) pasa a ser un enlace a ella. La ficha no se enlaza consigo misma.
 */
export function enlazarFichas(fichas: readonly FichaVista[]): FichaVista[] {
  const destinos = new Map<string, string>();
  for (const f of fichas) {
    destinos.set(f.nombre, f.id);
    destinos.set(f.selector, f.id);
  }
  return fichas.map((f) => {
    const segmentos = (lista: SegmentoTexto[]): SegmentoTexto[] =>
      lista.map((s) => {
        const destino = s.tipo === 'codigo' ? destinos.get(s.texto) : undefined;
        return destino && destino !== f.id ? { ...s, enlace: destino } : s;
      });
    const bloques = (lista: BloqueDescripcion[]): BloqueDescripcion[] =>
      lista.map((b) => (b.tipo === 'parrafo' ? { ...b, segmentos: segmentos(b.segmentos) } : b.tipo === 'lista' ? { ...b, items: b.items.map(segmentos) } : b));
    return {
      ...f,
      bloques: bloques(f.bloques),
      bloquesUsar: bloques(f.bloquesUsar),
      bloquesEvitar: bloques(f.bloquesEvitar),
      bloquesTeclado: bloques(f.bloquesTeclado),
      bloquesAccesibilidad: bloques(f.bloquesAccesibilidad),
    };
  });
}

/** Fichas visibles agrupadas en el orden de `CATEGORIAS_UI_KIT`; lo que no tenga categoría cae al final en "Otros". */
export function agrupar(fichas: readonly FichaComponente[]): GrupoUiKit[] {
  const visibles = enlazarFichas(
    fichas.filter((f) => !SELECTORES_OCULTOS.includes(f.selector)).map((f) => ({ ...aVista(f), usadoPor: usuariosDe(f.selector, fichas) })),
  );
  const grupos: GrupoUiKit[] = CATEGORIAS_UI_KIT.map((categoria) => ({
    categoria,
    fichas: visibles
      .filter((f) => CATEGORIA_POR_SELECTOR[f.selector] === categoria.id)
      .sort((a, b) => ORDEN_CURADO.indexOf(a.selector) - ORDEN_CURADO.indexOf(b.selector)),
  }));
  const sinCategoria = visibles.filter((f) => !CATEGORIA_POR_SELECTOR[f.selector]);
  if (sinCategoria.length) {
    grupos.push({ categoria: { id: 'fundamentos', titulo: 'Otros', descripcion: 'Componentes todavía sin categoría.' }, fichas: sinCategoria });
  }
  return grupos.filter((g) => g.fichas.length > 0);
}

/** Una sección de la página (fundamento o ficha) y el borde superior de su caja respecto de la ventana. */
export interface PosicionSeccion {
  id: string;
  arriba: number;
}

/**
 * La sección que se está leyendo: la última, en el orden del documento, cuyo borde superior ya subió hasta la línea
 * de lectura. Null si todavía no llegó ninguna (la introducción). Corta en la primera que está debajo, así que las
 * posiciones pueden medirse a medida que se recorren.
 */
export function seccionEnLectura(secciones: Iterable<PosicionSeccion>, linea: number): string | null {
  let actual: string | null = null;
  for (const seccion of secciones) {
    if (seccion.arriba > linea) break;
    actual = seccion.id;
  }
  return actual;
}

const normalizar = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Búsqueda por selector, clase o descripción, sin distinguir acentos ni mayúsculas. */
export function filtrar(grupos: readonly GrupoUiKit[], consulta: string): GrupoUiKit[] {
  const q = normalizar(consulta.trim());
  if (!q) return [...grupos];
  return grupos
    .map((g) => ({ ...g, fichas: g.fichas.filter((f) => normalizar(`${f.selector} ${f.clase} ${f.descripcion}`).includes(q)) }))
    .filter((g) => g.fichas.length > 0);
}
