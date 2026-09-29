// Verifica que todo ícono escrito en src/app exista en Material Icons (paquete `material-icons`).
//
// `siaf-icon` pinta la ligadura con la fuente de Material Icons: un nombre inventado o de otra familia
// (Material Symbols, por ejemplo) no falla al compilar, se ve como texto. Este chequeo corre en CI.
//
// Revisa los nombres literales: `name="…"` en <siaf-icon>, `icon="…"` / `trailingIcon="…"` en plantillas, `icon: '…'`
// / `trailingIcon: '…'` en objetos, y los literales dentro de `[name]="…"` / `[icon]="…"`.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const raiz = process.cwd();
const validos = new Set(Object.keys(JSON.parse(readFileSync(join(raiz, 'node_modules/material-icons/_data/versions.json'), 'utf8'))));

// Alias que resuelve `IconComponent.resolvedName` hacia un ícono real.
const alias = new Set(['right_panel_open', 'dock_to_right', 'left_panel_open', 'picture_in_picture', 'task_alt']);

const patrones = [
  // `name` solo en <siaf-icon>: en un <input> es el nombre del campo, no un ícono.
  /<siaf-icon\b[^>]*?\sname\s*=\s*"([a-z0-9_]+)"/g,
  /\b(?:icon|trailingIcon)\s*=\s*"([a-z0-9_]+)"/g,
  /\b(?:icon|trailingIcon)\s*:\s*'([a-z0-9_]+)'/g,
];
const enlace = /\[(?:name|icon)\]="([^"]+)"/g;
// En un enlace solo cuentan los literales que son resultado de un ternario (`? 'a' : 'b'`), no los que se comparan.
const resultadoTernario = /[?:]\s*'([a-z][a-z0-9_]*)'/g;

function archivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const ruta = join(dir, n);
    if (statSync(ruta).isDirectory()) return archivos(ruta);
    return /\.(ts|html)$/.test(n) && !/\.spec\.ts$/.test(n) && !n.endsWith('manifest.ts') ? [ruta] : [];
  });
}

const errores = [];
for (const ruta of archivos(join(raiz, 'src/app'))) {
  const texto = readFileSync(ruta, 'utf8');
  const nombres = new Set();
  for (const patron of patrones) for (const m of texto.matchAll(patron)) nombres.add(m[1]);
  for (const m of texto.matchAll(enlace)) for (const t of m[1].matchAll(resultadoTernario)) nombres.add(t[1]);
  for (const nombre of nombres) {
    if (!validos.has(nombre) && !alias.has(nombre)) errores.push(`${relative(raiz, ruta)}: «${nombre}»`);
  }
}

if (errores.length) {
  console.error(`✖ Íconos que no existen en Material Icons (${errores.length}):\n  ${errores.join('\n  ')}`);
  console.error('  Busca el nombre en https://fonts.google.com/icons?icon.set=Material+Icons');
  process.exit(1);
}
console.log(`✔ Todos los íconos existen en Material Icons (${validos.size} disponibles)`);
