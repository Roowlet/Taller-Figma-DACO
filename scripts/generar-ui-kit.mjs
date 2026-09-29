#!/usr/bin/env node
/**
 * Genera el manifiesto del catálogo de componentes (/ui-kit) leyendo el código.
 *
 * Recorre shared/ui, shared/components y layout; por cada clase con @Component o
 * @Directive extrae selector, descripción (JSDoc de la clase), entradas y eventos
 * (decoradores @Input/@Output y las funciones input()/model()/output()), con su
 * tipo resuelto por el compilador de TypeScript. Así la documentación sigue al
 * código y no se escribe a mano.
 *
 * También escribe ui-kit.fundamentos.ts con los fundamentos visuales (color, tipografía,
 * espaciado, radios, sombras e íconos) leídos de los tokens: ver scripts/ui-kit-fundamentos.mjs.
 *
 *   node scripts/generar-ui-kit.mjs           → escribe el manifiesto y los fundamentos
 *   node scripts/generar-ui-kit.mjs --check   → falla si alguno de los dos está desactualizado
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { generarFundamentos, utilidadesTailwind } from './ui-kit-fundamentos.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = join(RAIZ, 'src/app/features/ui-kit/ui-kit.manifest.ts');
const SALIDA_FUNDAMENTOS = join(RAIZ, 'src/app/features/ui-kit/ui-kit.fundamentos.ts');
const CARPETAS = [
  { dir: 'src/app/shared/ui', capa: 'ui', alias: '@siaf/ui' },
  { dir: 'src/app/shared/components', capa: 'components', alias: '@siaf/shared/components' },
  { dir: 'src/app/layout', capa: 'layout', alias: '@siaf/layout' },
];
/** Importar de aquí vuelve al componente dependiente de sesión: sin ejemplo en una ruta pública. */
const DEPENDENCIA_DE_SESION = /core\/(api|state|auth)\b|@angular\/common\/http/;
const MAX_TIPO = 180;

const check = process.argv.includes('--check');

function archivos(dir) {
  const out = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) out.push(...archivos(ruta));
    else if (/\.(component|directive)\.ts$/.test(nombre)) out.push(ruta);
  }
  return out;
}

const raices = CARPETAS.flatMap((c) => archivos(join(RAIZ, c.dir)).map((f) => ({ f, ...c })));

const config = ts.getParsedCommandLineOfConfigFile(join(RAIZ, 'tsconfig.app.json'), {}, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (d) => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n')); },
});
const programa = ts.createProgram(raices.map((r) => r.f), { ...config.options, noEmit: true });
const checker = programa.getTypeChecker();

const limpiar = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
const recortar = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function textoJsDoc(nodo) {
  const docs = ts.getJSDocCommentsAndTags(nodo).filter(ts.isJSDoc);
  // Sin \r: el manifiesto debe salir idéntico con checkout CRLF (Windows) y LF (CI en Linux).
  return docs.map((d) => ts.getTextOfJSDocComment(d.comment) ?? '').join('\n\n').replace(/\r\n?/g, '\n').trim();
}

/** Etiquetas del JSDoc de la clase (`@usar`, `@figma`…) → { nombre: [textos] }. */
function etiquetasJsDoc(nodo) {
  const etiquetas = {};
  for (const d of ts.getJSDocCommentsAndTags(nodo).filter(ts.isJSDoc)) {
    for (const t of d.tags ?? []) {
      const texto = (ts.getTextOfJSDocComment(t.comment) ?? '').replace(/\r\n?/g, '\n').trim();
      (etiquetas[t.tagName.text] ??= []).push(texto);
    }
  }
  return etiquetas;
}

const unir = (textos) => (textos?.filter(Boolean).length ? textos.filter(Boolean).join('\n\n') : null);

/** Nodos del Figma: `@figma 2588:135 Nombre` y los «nodo 1264:580» que ya cita la descripción. */
function nodosFigma(etiquetas, descripcion) {
  const nodos = new Map();
  for (const texto of etiquetas.figma ?? []) {
    const m = /^(\d+[:-]\d+)\s*(.*)$/s.exec(texto);
    if (m) nodos.set(m[1].replace('-', ':'), { nodo: m[1].replace('-', ':'), nombre: limpiar(m[2]) || null });
  }
  for (const m of descripcion.matchAll(/\bnodos?\s+(\d+[:-]\d+)/gi)) {
    const nodo = m[1].replace('-', ':');
    if (!nodos.has(nodo)) nodos.set(nodo, { nodo, nombre: null });
  }
  return [...nodos.values()];
}

const quitarComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');

/** Roles y atributos ARIA que declara el componente (plantilla, host o código). */
function ariaDe(codigo) {
  const roles = new Set();
  for (const m of codigo.matchAll(/\brole\s*=\s*"([a-z]+)"/g)) roles.add(m[1]);
  for (const m of codigo.matchAll(/\[attr\.role\]\s*=\s*"([^"]*)"/g)) for (const r of m[1].matchAll(/'([a-z]+)'/g)) roles.add(r[1]);
  for (const m of codigo.matchAll(/setAttribute\(\s*'role'\s*,\s*'([a-z]+)'/g)) roles.add(m[1]);
  for (const m of codigo.matchAll(/['"]?role['"]?\s*:\s*'([a-z]+)'/g)) roles.add(m[1]);
  const atributos = new Set([...codigo.matchAll(/\baria-[a-z]+(?:-[a-z]+)*/g)].map((m) => m[0]));
  return { roles: [...roles].sort(), atributos: [...atributos].sort() };
}

const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const UTILIDADES = utilidadesTailwind(RAIZ);
const alternativas = (mapa, filtro = () => true) => [...mapa.keys()].filter(filtro).sort((a, b) => b.length - a.length).map(escaparRegex).join('|');
const PATRONES_TOKEN = [
  { mapa: UTILIDADES.color, re: new RegExp(`(?<![\\w-])(bg|text|border(?:-[trblxyse])?|ring|fill|stroke|outline|divide|accent|decoration|placeholder|caret|from|via|to)-(${alternativas(UTILIDADES.color)})(?:/[\\d.]+)?(?![\\w-])`, 'g') },
  { mapa: UTILIDADES.espaciado, re: new RegExp(`(?<![\\w-])-?(p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|w|h|size|min-w|min-h|max-w|max-h|inset(?:-[xy])?|top|right|bottom|left|translate-[xy]|scroll-[mp][xytrblse]?)-(${alternativas(UTILIDADES.espaciado, (k) => k.startsWith('siaf-'))})(?![\\w-])`, 'g') },
  { mapa: UTILIDADES.radio, re: new RegExp(`(?<![\\w-])(rounded(?:-(?:tl|tr|bl|br|ss|se|es|ee|[trblse]))?)-(${alternativas(UTILIDADES.radio)})(?![\\w-])`, 'g') },
  { mapa: UTILIDADES.sombra, re: new RegExp(`(?<![\\w-])(shadow)-(${alternativas(UTILIDADES.sombra)})(?![\\w-])`, 'g') },
];

/** Tokens `--sys-*` que usa el componente: con `var()` directo o vía una utilidad de Tailwind conectada a un token. */
function tokensDe(codigo) {
  const tokens = new Map();
  const anotar = (token, via) => (tokens.get(token) ?? tokens.set(token, new Set()).get(token)).add(via);
  for (const m of codigo.matchAll(/var\(\s*(--sys-[\w-]+)/g)) anotar(m[1], 'var()');
  for (const { mapa, re } of PATRONES_TOKEN) {
    for (const m of codigo.matchAll(re)) anotar(mapa.get(m[2]), `${m[1]}-${m[2]}`);
  }
  return [...tokens.entries()].map(([token, via]) => ({ token, via: [...via].sort() })).sort((a, b) => a.token.localeCompare(b.token));
}

/** Código propio de la clase: su decorador (plantilla y estilos en línea), la plantilla y estilos externos y el cuerpo. */
function codigoDe(nodo, meta, archivo) {
  const externos = [];
  const url = propiedad(meta, 'templateUrl');
  if (url && ts.isStringLiteral(url)) externos.push(readFileSync(join(dirname(archivo), url.text), 'utf8'));
  const estilo = propiedad(meta, 'styleUrl');
  if (estilo && ts.isStringLiteral(estilo)) externos.push(readFileSync(join(dirname(archivo), estilo.text), 'utf8'));
  return quitarComentarios([nodo.getText(), ...externos].join('\n'));
}

function decorador(nodo, nombres) {
  for (const d of ts.getDecorators(nodo) ?? []) {
    const e = d.expression;
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && nombres.includes(e.expression.text)) return e;
  }
  return null;
}

function propiedad(obj, nombre) {
  const p = obj?.properties.find((x) => ts.isPropertyAssignment(x) && x.name.getText() === nombre);
  return p ? p.initializer : undefined;
}

const FORMATO = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType;

/** Tipo legible. Un alias de unión de literales (`ButtonSize`) se expande a sus valores, que es lo que el consumidor necesita. */
function tipoTexto(tipo) {
  const base = limpiar(checker.typeToString(tipo, undefined, FORMATO));
  if (tipo.aliasSymbol && tipo.isUnion() && tipo.types.every((t) => t.isLiteral() || t.flags & ts.TypeFlags.BooleanLiteral || t.flags & ts.TypeFlags.Undefined || t.flags & ts.TypeFlags.Null)) {
    const expandido = limpiar(checker.typeToString(tipo, undefined, FORMATO | ts.TypeFormatFlags.InTypeAlias));
    if (expandido !== base && expandido.length <= MAX_TIPO) return expandido;
  }
  return recortar(base, MAX_TIPO);
}

/** Tipo `T` de `EventEmitter<T>`, `OutputEmitterRef<T>`, `InputSignal<T>`… */
function argumentoDeTipo(tipo) {
  const args = checker.getTypeArguments?.(tipo) ?? tipo.aliasTypeArguments ?? [];
  return args.length ? tipoTexto(args[0]) : tipoTexto(tipo);
}

function valorPorDefecto(init) {
  if (!init) return null;
  if (ts.isNewExpression(init) || ts.isCallExpression(init)) return null;
  return recortar(limpiar(init.getText()), 60);
}

/** `input()`, `input.required()`, `model()`, `output()` → { fn, required, init }. */
function funcionDeSenal(init) {
  if (!init || !ts.isCallExpression(init)) return null;
  const e = init.expression;
  if (ts.isIdentifier(e) && ['input', 'model', 'output', 'outputFromObservable'].includes(e.text)) return { fn: e.text, required: false, call: init };
  if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression) && ['input', 'model'].includes(e.expression.text) && e.name.text === 'required') {
    return { fn: e.expression.text, required: true, call: init };
  }
  return null;
}

function aliasDeOpciones(opciones) {
  const a = opciones && ts.isObjectLiteralExpression(opciones) ? propiedad(opciones, 'alias') : undefined;
  return a && ts.isStringLiteral(a) ? a.text : null;
}

function miembros(clase) {
  const entradas = [];
  const eventos = [];
  for (const m of clase.members) {
    if (!(ts.isPropertyDeclaration(m) || ts.isSetAccessorDeclaration(m) || ts.isGetAccessorDeclaration(m))) continue;
    if (!m.name || !ts.isIdentifier(m.name)) continue;
    const nombre = m.name.text;
    const descripcion = limpiar(textoJsDoc(m)) || null;

    const dIn = decorador(m, ['Input']);
    if (dIn) {
      if (ts.isGetAccessorDeclaration(m)) continue; // el setter lleva el decorador
      const arg = dIn.arguments[0];
      let alias = null;
      let requerida = false;
      if (arg && ts.isStringLiteral(arg)) alias = arg.text;
      if (arg && ts.isObjectLiteralExpression(arg)) {
        alias = aliasDeOpciones(arg);
        requerida = propiedad(arg, 'required')?.kind === ts.SyntaxKind.TrueKeyword;
      }
      const nodoTipo = ts.isSetAccessorDeclaration(m) ? m.parameters[0] : m;
      entradas.push({
        nombre: alias ?? nombre,
        tipo: tipoTexto(checker.getTypeAtLocation(nodoTipo)),
        porDefecto: ts.isPropertyDeclaration(m) ? valorPorDefecto(m.initializer) : null,
        requerida,
        descripcion,
      });
      continue;
    }

    const dOut = decorador(m, ['Output']);
    if (dOut) {
      const arg = dOut.arguments[0];
      eventos.push({
        nombre: arg && ts.isStringLiteral(arg) ? arg.text : nombre,
        tipo: argumentoDeTipo(checker.getTypeAtLocation(m)),
        descripcion,
      });
      continue;
    }

    if (ts.isPropertyDeclaration(m)) {
      const senal = funcionDeSenal(m.initializer);
      if (!senal) continue;
      const tipo = argumentoDeTipo(checker.getTypeAtLocation(m));
      if (senal.fn === 'output' || senal.fn === 'outputFromObservable') {
        eventos.push({ nombre: aliasDeOpciones(senal.call.arguments[0]) ?? nombre, tipo, descripcion });
      } else {
        const opciones = senal.required ? senal.call.arguments[0] : senal.call.arguments[1];
        const inicial = senal.required ? null : valorPorDefecto(senal.call.arguments[0]);
        entradas.push({ nombre: aliasDeOpciones(opciones) ?? nombre, tipo, porDefecto: inicial, requerida: senal.required, descripcion });
        if (senal.fn === 'model') eventos.push({ nombre: `${aliasDeOpciones(opciones) ?? nombre}Change`, tipo, descripcion });
      }
    }
  }
  const porNombre = (a, b) => a.nombre.localeCompare(b.nombre);
  return { entradas: entradas.sort(porNombre), eventos: eventos.sort(porNombre) };
}

/** Plantilla del componente, en línea o desde `templateUrl`. */
function plantillaDe(meta, archivo) {
  const url = propiedad(meta, 'templateUrl');
  if (url && ts.isStringLiteral(url)) return readFileSync(join(dirname(archivo), url.text), 'utf8');
  return propiedad(meta, 'template')?.getText() ?? '';
}

const fichas = [];
/** Código de cada componente (sin comentarios), para calcular después qué otros componentes pinta. */
const codigoPorSelector = new Map();
for (const { f, capa, alias, dir } of raices) {
  const fuente = programa.getSourceFile(f);
  if (!fuente) continue;
  const usaSesion = DEPENDENCIA_DE_SESION.test(fuente.text);
  ts.forEachChild(fuente, (nodo) => {
    if (!ts.isClassDeclaration(nodo) || !nodo.name) return;
    const dec = decorador(nodo, ['Component', 'Directive']);
    if (!dec) return;
    const meta = dec.arguments[0];
    const sel = meta && ts.isObjectLiteralExpression(meta) ? propiedad(meta, 'selector') : undefined;
    if (!sel || !(ts.isStringLiteral(sel) || ts.isNoSubstitutionTemplateLiteral(sel))) return;
    const rel = relative(join(RAIZ, dir), f).replace(/\\/g, '/').replace(/\.ts$/, '');
    const descripcion = textoJsDoc(nodo);
    const etiquetas = etiquetasJsDoc(nodo);
    const codigo = codigoDe(nodo, meta, f);
    codigoPorSelector.set(sel.text, codigo);
    fichas.push({
      selector: sel.text,
      clase: nodo.name.text,
      tipo: dec.expression.text === 'Directive' ? 'directiva' : 'componente',
      capa,
      importacion: `${alias}/${rel}`,
      archivo: relative(RAIZ, f).replace(/\\/g, '/'),
      descripcion,
      usaSesion,
      proyectaContenido: /<ng-content\b/.test(plantillaDe(meta, f)),
      ...miembros(nodo),
      usar: unir(etiquetas.usar),
      evitar: unir(etiquetas.evitar),
      teclado: unir(etiquetas.teclado),
      accesibilidad: unir(etiquetas.accesibilidad),
      figma: nodosFigma(etiquetas, descripcion),
      aria: ariaDe(codigo),
      tokens: tokensDe(codigo),
      usa: [],
    });
  });
}
// Sesión transitiva: un componente que renderiza a otro que usa la API también la necesita.
const importsDe = new Map();
for (const { f } of raices) {
  const fuente = programa.getSourceFile(f);
  const deps = [];
  for (const st of fuente.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    const r = ts.resolveModuleName(st.moduleSpecifier.text, f, programa.getCompilerOptions(), ts.sys).resolvedModule;
    if (r && /\.(component|directive)\.ts$/.test(r.resolvedFileName)) deps.push(resolve(r.resolvedFileName));
  }
  importsDe.set(resolve(f), deps);
}
const sesionDirecta = new Map(fichas.map((x) => [resolve(join(RAIZ, x.archivo)), x.usaSesion]));
function requiereSesion(archivo, vistos = new Set()) {
  if (vistos.has(archivo)) return false;
  vistos.add(archivo);
  if (sesionDirecta.get(archivo)) return true;
  return (importsDe.get(archivo) ?? []).some((d) => requiereSesion(d, vistos));
}
for (const x of fichas) x.usaSesion = requiereSesion(resolve(join(RAIZ, x.archivo)));

// Composición: los componentes del catálogo que importa y de verdad pinta en su plantilla.
const fichasPorArchivo = new Map();
for (const x of fichas) {
  const archivo = resolve(join(RAIZ, x.archivo));
  fichasPorArchivo.set(archivo, [...(fichasPorArchivo.get(archivo) ?? []), x]);
}
const pintaSelector = (codigo, selector) =>
  selector.startsWith('[')
    ? new RegExp(`[\\s(\\[]${escaparRegex(selector.slice(1, -1))}\\b`).test(codigo)
    : new RegExp(`<${escaparRegex(selector)}(?=[\\s>/])`).test(codigo);
for (const x of fichas) {
  const codigo = codigoPorSelector.get(x.selector) ?? '';
  const importados = (importsDe.get(resolve(join(RAIZ, x.archivo))) ?? []).flatMap((dep) => fichasPorArchivo.get(dep) ?? []);
  x.usa = [...new Set(importados.filter((y) => y.selector !== x.selector && pintaSelector(codigo, y.selector)).map((y) => y.selector))].sort();
}

// Uso real en la app: alguna plantilla fuera del propio componente lo pinta, o una ruta lo carga.
// Se ignoran el catálogo, los specs, los barriles index.ts y los comentarios (los JSDoc traen ejemplos con etiquetas).
function fuentesDeLaApp(dir) {
  const out = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      if (!ruta.replace(/\\/g, '/').endsWith('src/app/features/ui-kit')) out.push(...fuentesDeLaApp(ruta));
    } else if (/\.(ts|html)$/.test(nombre) && !nombre.endsWith('.spec.ts') && nombre !== 'index.ts') {
      out.push(resolve(ruta));
    }
  }
  return out;
}
const sinComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
const fuentes = fuentesDeLaApp(join(RAIZ, 'src/app')).map((f) => ({ f, texto: sinComentarios(readFileSync(f, 'utf8')) }));
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const x of fichas) {
  const propio = resolve(join(RAIZ, x.archivo));
  const propioHtml = propio.replace(/\.ts$/, '.html');
  const enPlantilla = x.selector.startsWith('[')
    ? new RegExp(`[\\s(\\[]${escapar(x.selector.slice(1, -1))}\\b`)
    : new RegExp(`<${escapar(x.selector)}(?=[\\s>/])`);
  const enRuta = new RegExp(`(\\bm\\.|component:\\s*)${escapar(x.clase)}\\b`);
  x.sinUso = !fuentes.some(({ f, texto }) => f !== propio && f !== propioHtml && (enPlantilla.test(texto) || enRuta.test(texto)));
}

fichas.sort((a, b) => a.selector.localeCompare(b.selector));

const contenido = `// GENERADO por scripts/generar-ui-kit.mjs — no editar a mano.
// Regenerar con \`npm run ui-kit:manifest\` después de cambiar un componente.
import type { FichaComponente } from './ui-kit.model';

export const MANIFIESTO_UI_KIT: readonly FichaComponente[] = ${JSON.stringify(fichas, null, 2)};
`;

// Fundamentos visuales: los íconos van en una sola línea para no inflar el archivo con 2000 líneas de nombres.
const { iconos, ...fundamentos } = generarFundamentos(RAIZ);
const contenidoFundamentos = `// GENERADO por scripts/generar-ui-kit.mjs (scripts/ui-kit-fundamentos.mjs) — no editar a mano.
// Sale de los tokens de src/styles: regenerar con \`npm run ui-kit:manifest\` después de cambiar un token.
import type { FundamentosUiKit } from './ui-kit.model';

export const FUNDAMENTOS_UI_KIT: FundamentosUiKit = {${JSON.stringify(fundamentos, null, 2).slice(1, -1).trimEnd()},
  iconos: {
    tamanos: ${JSON.stringify(iconos.tamanos)},
    nombres: ${JSON.stringify(iconos.nombres)},
  },
};
`;

const leer = (ruta) => (existsSync(ruta) ? readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n') : '');
const actual = leer(SALIDA);
const actualFundamentos = leer(SALIDA_FUNDAMENTOS);
if (check) {
  if (actual !== contenido || actualFundamentos !== contenidoFundamentos) {
    console.error('✖ El manifiesto del ui-kit está desactualizado. Corre: npm run ui-kit:manifest');
    process.exit(1);
  }
  console.log(`✔ Manifiesto del ui-kit al día (${fichas.length} componentes)`);
} else {
  if (actual !== contenido) writeFileSync(SALIDA, contenido, 'utf8');
  if (actualFundamentos !== contenidoFundamentos) writeFileSync(SALIDA_FUNDAMENTOS, contenidoFundamentos, 'utf8');
  const sinDoc = fichas.filter((x) => !x.descripcion).map((x) => x.selector);
  console.log(`✔ ${fichas.length} componentes · ${fichas.reduce((n, x) => n + x.entradas.length, 0)} entradas · ${fichas.reduce((n, x) => n + x.eventos.length, 0)} eventos → ${relative(RAIZ, SALIDA)}`);
  if (sinDoc.length) console.log(`  Sin descripción en el código (${sinDoc.length}): ${sinDoc.join(', ')}`);
  const colores = fundamentos.colores.reduce((n, g) => n + g.tokens.length, 0);
  console.log(`✔ Fundamentos: ${colores} colores · ${fundamentos.paleta.length} familias de paleta · ${iconos.nombres.length} íconos → ${relative(RAIZ, SALIDA_FUNDAMENTOS)}`);
  if (fundamentos.sinDefinir.length) console.log(`  Variables usadas sin definir (${fundamentos.sinDefinir.length}): ${fundamentos.sinDefinir.map((v) => v.nombre).join(', ')}`);
}
