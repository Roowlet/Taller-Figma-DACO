/**
 * Fundamentos visuales del catálogo /ui-kit: lee los tokens reales de los CSS y arma los datos de las
 * páginas de color, tipografía, espaciado, radios y bordes, sombras e íconos.
 *
 * Lo usa scripts/generar-ui-kit.mjs, que escribe el resultado en ui-kit.fundamentos.ts (y lo revisa con --check).
 *
 * Los valores se resuelven como lo hace el navegador: `var(--x)` sigue la cadena de variables del mismo contexto
 * (`:root`, el tema `[data-theme]` o el breakpoint `@media`). Así el claro y el oscuro se muestran lado a lado sin
 * depender del tema activo de la página.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Orden de la cascada de src/styles.css: el que viene después gana.
const ARCHIVOS_CSS = [
  'src/styles/tokens/base.css',
  'src/styles/tokens/figma.css',
  'src/styles/tokens/generated/tailwind.tokens.css',
  'src/styles/tokens/themes/light.css',
  'src/styles/tokens/themes/dark.css',
  'src/styles.css',
];

const MEDIA_TABLET = '@media (max-width: 1023px)';
const MEDIA_MOVIL = '@media (max-width: 767px)';

/** Declaraciones `--nombre: valor` de un CSS con su contexto (cadena de selectores y at-rules que las envuelven). */
function declaraciones(css) {
  const limpio = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const pila = [];
  const out = [];
  let buffer = '';
  for (const c of limpio) {
    if (c === '{') {
      pila.push(buffer.trim().replace(/\s+/g, ' '));
      buffer = '';
    } else if (c === '}') {
      capturar(buffer, pila, out);
      pila.pop();
      buffer = '';
    } else if (c === ';') {
      capturar(buffer, pila, out);
      buffer = '';
    } else {
      buffer += c;
    }
  }
  return out;
}

function capturar(texto, pila, out) {
  const m = /^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(texto);
  if (m) out.push({ nombre: m[1], valor: m[2].replace(/\s+/g, ' '), contexto: pila.join(' > ') });
}

const CONTEXTOS = {
  ':root': 'raiz',
  '@theme': 'theme',
  '[data-theme="light"]': 'claro',
  '[data-theme="dark"]': 'oscuro',
  [`${MEDIA_TABLET} > :root`]: 'tablet',
  [`${MEDIA_MOVIL} > :root`]: 'movil',
};

/** Parte `var(--x, respaldo)`: devuelve [nombre, respaldo | null]. */
function partirVar(interior) {
  let profundidad = 0;
  for (let i = 0; i < interior.length; i++) {
    const c = interior[i];
    if (c === '(') profundidad++;
    else if (c === ')') profundidad--;
    else if (c === ',' && profundidad === 0) return [interior.slice(0, i).trim(), interior.slice(i + 1).trim()];
  }
  return [interior.trim(), null];
}

/** Sustituye cada `var()` por su valor; `null` si alguna variable no está definida y no trae respaldo. */
function resolver(valor, buscar, visitados = new Set()) {
  let resultado = valor;
  for (let vueltas = 0; vueltas < 50; vueltas++) {
    const inicio = resultado.indexOf('var(');
    if (inicio === -1) return resultado;
    let profundidad = 0;
    let fin = -1;
    for (let i = inicio + 3; i < resultado.length; i++) {
      if (resultado[i] === '(') profundidad++;
      else if (resultado[i] === ')' && --profundidad === 0) {
        fin = i;
        break;
      }
    }
    if (fin === -1) return resultado;
    const [nombre, respaldo] = partirVar(resultado.slice(inicio + 4, fin));
    let reemplazo = null;
    const definido = visitados.has(nombre) ? undefined : buscar(nombre);
    if (definido !== undefined) reemplazo = resolver(definido, buscar, new Set([...visitados, nombre]));
    if (reemplazo === null && respaldo !== null) reemplazo = resolver(respaldo, buscar, visitados);
    if (reemplazo === null) return null;
    resultado = resultado.slice(0, inicio) + reemplazo + resultado.slice(fin + 1);
  }
  return resultado;
}

/** Valor legible: hex en mayúsculas, alfa con dos decimales y `0px` en vez de `0`. */
function legible(valor) {
  if (valor === null) return null;
  return valor
    .replace(/#[0-9a-f]{3,8}\b/gi, (hex) => hex.toUpperCase())
    .replace(/(\d*\.\d{3,})/g, (n) => `${Number(Number(n).toFixed(2))}`)
    .replace(/^0$/, '0px');
}

const titulo = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Grupos de color en el orden en que se leen: fondo, texto, ícono, borde. El prefijo más largo gana.
const GRUPOS_COLOR = [
  ['bg-brand', 'Fondo · Marca'],
  ['bg-surfaces', 'Fondo · Superficies'],
  ['bg-on-surfaces', 'Fondo · Sobre superficies'],
  ['bg-states', 'Fondo · Capas de estado'],
  ['bg-feedback', 'Fondo · Feedback'],
  ['bg-status', 'Fondo · Estado de documentos y registros'],
  ['text-neutral', 'Texto · Neutro'],
  ['text-brand', 'Texto · Marca'],
  ['text-feedback', 'Texto · Feedback'],
  ['text-on-brand', 'Texto · Sobre marca'],
  ['icon-states', 'Ícono · Estados'],
  ['icon-brand', 'Ícono · Marca'],
  ['icon-feedback', 'Ícono · Feedback'],
  ['icon-snackbar', 'Ícono · Snackbar'],
  ['border-states', 'Borde · Estados'],
  ['border-feedback', 'Borde · Feedback'],
  ['border-on-brand', 'Borde · Sobre marca'],
  ['divider', 'Separadores'],
];

/** Prefijo de utilidad de Tailwind según la capa del token. */
function prefijoUtilidad(token) {
  if (token.startsWith('--sys-color-bg-')) return 'bg';
  if (token.startsWith('--sys-color-border-') || token.startsWith('--sys-color-divider-')) return 'border';
  return 'text';
}

function ordenarTono(a, b) {
  const clave = (t) => [t.startsWith('a') ? 1 : 0, Number(t.replace(/^a/, ''))];
  const [x1, x2] = clave(a);
  const [y1, y2] = clave(b);
  return x1 - y1 || x2 - y2;
}

/** Nombre de familia sin el segmento repetido del export de Figma: `sky-blue-sky-blue` → `sky-blue`. */
function familiaLimpia(familia) {
  const partes = familia.split('-');
  const mitad = partes.length / 2;
  if (Number.isInteger(mitad) && partes.slice(0, mitad).join('-') === partes.slice(mitad).join('-')) return partes.slice(0, mitad).join('-');
  return familia;
}

function fuentesDeLaApp(dir) {
  const out = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) out.push(...fuentesDeLaApp(ruta));
    else if (/\.(ts|html|css|scss)$/.test(nombre) && !nombre.endsWith('.spec.ts') && !/^ui-kit\.(manifest|fundamentos)\.ts$/.test(nombre)) out.push(ruta);
  }
  return out;
}

/** Declaraciones de los CSS de tokens agrupadas por contexto, con el archivo de origen de cada una en `:root`. */
function leerTokens(raiz) {
  const mapas = { raiz: new Map(), theme: new Map(), claro: new Map(), oscuro: new Map(), tablet: new Map(), movil: new Map() };
  const definidas = new Set();
  const origen = new Map();
  for (const archivo of ARCHIVOS_CSS) {
    for (const d of declaraciones(readFileSync(join(raiz, archivo), 'utf8'))) {
      definidas.add(d.nombre);
      const contexto = CONTEXTOS[d.contexto];
      if (!contexto) continue;
      mapas[contexto].set(d.nombre, d.valor);
      if (contexto === 'raiz') origen.set(d.nombre, archivo);
    }
  }
  return { mapas, definidas, origen };
}

/**
 * Utilidades de Tailwind conectadas a un token `--sys-*`, por tipo: `{ color: Map('surface' → '--sys-color-bg-surfaces-surface'), … }`.
 * Las usa el generador de fichas para listar los tokens de cada componente.
 */
export function utilidadesTailwind(raiz) {
  const { mapas } = leerTokens(raiz);
  const de = (prefijo) => {
    const mapa = new Map();
    for (const [nombre, valor] of mapas.theme) {
      const m = nombre.startsWith(prefijo) ? /^var\((--sys-[\w-]+)\)$/.exec(valor) : null;
      if (m) mapa.set(nombre.slice(prefijo.length), m[1]);
    }
    return mapa;
  };
  return { color: de('--color-'), espaciado: de('--spacing-'), radio: de('--radius-'), sombra: de('--shadow-') };
}

export function generarFundamentos(raiz) {
  const { mapas, definidas, origen } = leerTokens(raiz);

  const enClaro = (n) => mapas.claro.get(n) ?? mapas.raiz.get(n);
  /** El tema oscuro cambia el token si lo sobrescribe o si sobrescribe alguna variable de su cadena. */
  const cambiaEnOscuro = (token, vistos = new Set()) => {
    if (mapas.oscuro.has(token)) return true;
    const valor = mapas.raiz.get(token);
    if (valor === undefined || vistos.has(token)) return false;
    return [...valor.matchAll(/var\(\s*(--[\w-]+)/g)].some((m) => cambiaEnOscuro(m[1], new Set([...vistos, token])));
  };
  const enOscuro = (n) => mapas.oscuro.get(n) ?? mapas.raiz.get(n);
  const enTablet = (n) => mapas.tablet.get(n) ?? mapas.raiz.get(n);
  const enMovil = (n) => mapas.movil.get(n) ?? mapas.tablet.get(n) ?? mapas.raiz.get(n);
  const valorEn = (buscar, token) => {
    const v = buscar(token);
    return v === undefined ? null : legible(resolver(v, buscar));
  };
  const porDispositivo = (token) => ({
    escritorio: valorEn((n) => mapas.raiz.get(n), token),
    tablet: valorEn(enTablet, token),
    movil: valorEn(enMovil, token),
  });

  // Utilidades de Tailwind: `--color-surface: var(--sys-…)` → `surface`. El @theme de styles.css va último y gana.
  const utilidadesDe = (prefijoTheme) => {
    const mapa = new Map();
    for (const [nombre, valor] of mapas.theme) {
      if (!nombre.startsWith(prefijoTheme)) continue;
      const m = /^var\((--sys-[\w-]+)\)$/.exec(valor);
      if (!m) continue;
      const lista = mapa.get(m[1]) ?? [];
      lista.push(nombre.slice(prefijoTheme.length));
      mapa.set(m[1], lista);
    }
    return mapa;
  };
  const utilidadesColor = utilidadesDe('--color-');
  const utilidadesEspacio = utilidadesDe('--spacing-');
  const utilidadesRadio = utilidadesDe('--radius-');
  const utilidadesSombra = utilidadesDe('--shadow-');

  // ── Color semántico ──
  const nombresColor = [...new Set([...mapas.raiz.keys(), ...mapas.oscuro.keys()])].filter((n) => n.startsWith('--sys-color-')).sort();
  const grupos = new Map([...GRUPOS_COLOR.map(([id, t]) => [id, { id, titulo: t, tokens: [] }]), ['otros', { id: 'otros', titulo: 'Otros', tokens: [] }]]);
  for (const token of nombresColor) {
    const resto = token.slice('--sys-color-'.length);
    const grupo = GRUPOS_COLOR.map(([id]) => id).filter((id) => resto === id || resto.startsWith(`${id}-`)).sort((a, b) => b.length - a.length)[0] ?? 'otros';
    const enRaiz = mapas.raiz.has(token) || mapas.claro.has(token);
    grupos.get(grupo).tokens.push({
      nombre: token,
      claro: enRaiz ? valorEn(enClaro, token) : null,
      oscuro: valorEn(enOscuro, token),
      sinOscuro: enRaiz && !cambiaEnOscuro(token),
      soloOscuro: !enRaiz,
      utilidades: (utilidadesColor.get(token) ?? []).map((u) => `${prefijoUtilidad(token)}-${u}`),
      manual: !(origen.get(token) ?? '').endsWith('figma.css'),
    });
  }
  const colores = [...grupos.values()].filter((g) => g.tokens.length);

  // ── Paleta tonal ──
  const familias = new Map();
  for (const [nombre, valor] of mapas.raiz) {
    const m = /^--figma-color-palette-(.+)-(a?\d+)$/.exec(nombre);
    if (!m) continue;
    const familia = familiaLimpia(m[1]);
    const lista = familias.get(familia) ?? [];
    lista.push({ tono: m[2], valor: legible(valor), variable: nombre });
    familias.set(familia, lista);
  }
  const paleta = [...familias.entries()]
    .map(([familia, tonos]) => ({ familia, tonos: tonos.sort((a, b) => ordenarTono(a.tono, b.tono)) }))
    .sort((a, b) => a.familia.localeCompare(b.familia));

  // ── Tipografía ──
  const tamanos = [...mapas.raiz.keys()]
    .filter((n) => /^--sys-typography-size-[a-z]+-\d$/.test(n))
    .map((token) => {
      const [rol, nivel] = token.slice('--sys-typography-size-'.length).split('-');
      return { token, rol: `${titulo(rol)} ${nivel}`, ...porDispositivo(token) };
    });
  const tipografia = {
    familia: valorEn((n) => mapas.raiz.get(n), '--sys-typography-font-family-base'),
    monospace: valorEn((n) => mapas.raiz.get(n), '--sys-typography-font-family-monospace'),
    tamanos,
    pesos: [...mapas.raiz.keys()]
      .filter((n) => n.startsWith('--sys-typography-weight-'))
      .map((token) => ({ token, nombre: titulo(token.slice('--sys-typography-weight-'.length)), valor: valorEn((n) => mapas.raiz.get(n), token) }))
      .sort((a, b) => Number(a.valor) - Number(b.valor)),
    interlineados: [...mapas.raiz.keys()]
      .filter((n) => n.startsWith('--sys-typography-line-height-'))
      .map((token) => ({ token, nombre: titulo(token.slice('--sys-typography-line-height-'.length)), valor: valorEn((n) => mapas.raiz.get(n), token) })),
  };

  // ── Espaciado, radios, bordes y tamaños de ícono ──
  const ESCALA = ['none', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const ORDEN_RADIO = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
  const medida = (token, escala, utilidades) => ({ token, escala, ...porDispositivo(token), utilidades });
  const escalaDe = (prefijo) =>
    ESCALA.filter((e) => mapas.raiz.has(`${prefijo}${e}`)).map((e) => {
      const token = `${prefijo}${e}`;
      return medida(token, e, (utilidadesEspacio.get(token) ?? []).map((u) => `*-${u}`));
    });
  const contenedores = [...mapas.raiz.keys()]
    .filter((n) => /^--figma-device-sys-(gap|padding)-(container|content|row|section)/.test(n))
    .sort()
    .map((token) => medida(token, token.replace('--figma-device-sys-', ''), []));

  const radios = [...mapas.raiz.keys()]
    .filter((n) => n.startsWith('--sys-radius-'))
    .map((token) => medida(token, token.slice('--sys-radius-'.length), (utilidadesRadio.get(token) ?? []).map((u) => `rounded-${u}`)))
    .sort((a, b) => parseFloat(a.escritorio) - parseFloat(b.escritorio) || ORDEN_RADIO.indexOf(a.escala) - ORDEN_RADIO.indexOf(b.escala));
  const aliasBorde = new Map([...mapas.raiz].filter(([n]) => n.startsWith('--sys-border-linear-')).map(([n, v]) => [/var\((--[\w-]+)\)/.exec(v)?.[1], n]));
  const bordes = [...mapas.raiz.keys()]
    .filter((n) => n.startsWith('--figma-device-sys-border-linear-'))
    .map((figma) => medida(aliasBorde.get(figma) ?? figma, figma.slice('--figma-device-sys-border-linear-'.length), []))
    .sort((a, b) => parseFloat(a.escritorio) - parseFloat(b.escritorio));
  const tamanosIcono = [...mapas.raiz.keys()]
    .filter((n) => n.startsWith('--figma-device-sys-sizes-icon-'))
    .map((token) => medida(token, token.slice('--figma-device-sys-sizes-icon-'.length), []))
    .sort((a, b) => parseFloat(a.escritorio) - parseFloat(b.escritorio));

  // ── Sombras ──
  const sombras = [...mapas.raiz.keys()]
    .filter((n) => n.startsWith('--sys-shadow-'))
    .map((token) => ({
      token,
      nombre: token.slice('--sys-shadow-'.length),
      claro: valorEn(enClaro, token),
      oscuro: mapas.oscuro.has(token) ? valorEn(enOscuro, token) : null,
      utilidades: (utilidadesSombra.get(token) ?? []).map((u) => `shadow-${u}`),
    }));
  const superficie = {
    claro: valorEn(enClaro, '--sys-color-bg-surfaces-surface'),
    oscuro: valorEn(enOscuro, '--sys-color-bg-surfaces-surface'),
  };

  // ── Íconos: los nombres del paquete material-icons, los mismos que valida npm run icons:check ──
  // Orden alfabético con los que empiezan por número (10k, 3d_rotation…) al final.
  const empiezaPorNumero = (n) => (/^\d/.test(n) ? 1 : 0);
  const nombresIconos = Object.keys(JSON.parse(readFileSync(join(raiz, 'node_modules/material-icons/_data/versions.json'), 'utf8'))).sort(
    (a, b) => empiezaPorNumero(a) - empiezaPorNumero(b) || a.localeCompare(b),
  );

  // ── Variables --sys-* que usa la app y no están definidas en ningún CSS ──
  const usos = new Map();
  const declaradasEnApp = new Set();
  for (const archivo of fuentesDeLaApp(join(raiz, 'src/app'))) {
    const texto = readFileSync(archivo, 'utf8');
    for (const m of texto.matchAll(/(--sys-[\w-]+)\s*:/g)) declaradasEnApp.add(m[1]);
    for (const m of texto.matchAll(/var\(\s*(--sys-[\w-]+)\s*(,)?/g)) {
      const uso = usos.get(m[1]) ?? { archivos: new Set(), sinRespaldo: false };
      uso.archivos.add(relative(raiz, archivo).replace(/\\/g, '/'));
      if (!m[2]) uso.sinRespaldo = true;
      usos.set(m[1], uso);
    }
  }
  const sinDefinir = [...usos.entries()]
    .filter(([nombre]) => !definidas.has(nombre) && !declaradasEnApp.has(nombre))
    .map(([nombre, uso]) => ({ nombre, archivos: [...uso.archivos].sort(), sinRespaldo: uso.sinRespaldo }))
    .sort((a, b) => b.archivos.length - a.archivos.length || a.nombre.localeCompare(b.nombre));

  return {
    colores,
    paleta,
    tipografia,
    espaciado: { gap: escalaDe('--sys-gap-base-'), padding: escalaDe('--sys-padding-base-'), contenedores },
    radios,
    bordes,
    sombras,
    superficie,
    iconos: { tamanos: tamanosIcono, nombres: nombresIconos },
    sinDefinir,
  };
}
