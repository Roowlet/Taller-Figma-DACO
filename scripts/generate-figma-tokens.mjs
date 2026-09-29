import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = resolve(rootDir, 'src/tokens/Value.tokens.json');
const deviceDir = resolve(rootDir, 'src/tokens/Device');
const outputPath = resolve(rootDir, 'src/styles/tokens/figma.css');

const tokens = JSON.parse(readFileSync(inputPath, 'utf8'));
const entries = [];
const lightEntries = [];
const deviceEntries = new Map();

function toKebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function colorValue(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (value?.hex && value.alpha !== undefined && value.alpha < 1) {
    const [r, g, b] = value.components.map((part) => Math.round(part * 255));
    return `rgb(${r} ${g} ${b} / ${value.alpha})`;
  }

  return value?.hex;
}

function walk(node, path = []) {
  if (node && typeof node === 'object' && '$type' in node && '$value' in node) {
    if (node.$type === 'color') {
      entries.push({
        name: path.map(toKebab).join('-'),
        value: colorValue(node.$value)
      });
    }

    if (node.$type === 'dimension' || node.$type === 'number' || node.$type === 'sizing' || node.$type === 'spacing') {
      const rawValue = typeof node.$value === 'object' ? node.$value.value : node.$value;
      const numericValue = Number(rawValue);

      if (Number.isFinite(numericValue)) {
        entries.push({
          name: path.map(toKebab).join('-'),
          value: numericValue === 0 ? '0' : `${numericValue}px`
        });
      }
    }

    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      continue;
    }

    walk(value, [...path, key]);
  }
}

walk(tokens);

const lightPath = resolve(deviceDir, 'Light.tokens.json');
if (existsSync(lightPath)) {
  const lightTokens = JSON.parse(readFileSync(lightPath, 'utf8'));
  const lightTokenMap = buildTokenMap(lightTokens);
  const walkLight = (node, path = []) => {
    if (node && typeof node === 'object' && '$type' in node && '$value' in node) {
      if (node.$type === 'color') {
        lightEntries.push({
          name: path.map(toKebab).join('-'),
          value: colorValue(resolveReference(node.$value, lightTokenMap))
        });
      }

      return;
    }

    if (!node || typeof node !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) {
        continue;
      }

      walkLight(value, [...path, key]);
    }
  };

  walkLight(lightTokens);
}

function buildTokenMap(node, path = [], out = new Map()) {
  if (node && typeof node === 'object' && '$type' in node && '$value' in node) {
    out.set(path.join('.'), node);
    return out;
  }

  if (!node || typeof node !== 'object') {
    return out;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      continue;
    }

    buildTokenMap(value, [...path, key], out);
  }

  return out;
}

function resolveReference(value, tokenMap, seen = new Set()) {
  if (typeof value !== 'string') {
    return value;
  }

  const match = value.match(/^\{(.+)\}$/);
  if (!match) {
    return value;
  }

  const referencePath = match[1];
  if (seen.has(referencePath)) {
    return value;
  }

  const referencedToken = tokenMap.get(referencePath);
  if (!referencedToken) {
    return value;
  }

  seen.add(referencePath);
  return resolveReference(referencedToken.$value, tokenMap, seen);
}

function formatDeviceValue(path, token, tokenMap) {
  const rawValue = typeof token.$value === 'object' ? token.$value.value : token.$value;
  const resolvedValue = resolveReference(rawValue, tokenMap);

  if (token.$type === 'string') {
    return `"${resolvedValue}"`;
  }

  const numericValue = Number(resolvedValue);
  if (!Number.isFinite(numericValue)) {
    return String(resolvedValue);
  }

  if (path.includes('typography/weight')) {
    return String(numericValue);
  }

  return numericValue === 0 ? '0' : `${numericValue}px`;
}

function walkDevice(node, path = [], out = [], tokenMap = new Map()) {
  if (node && typeof node === 'object' && '$type' in node && '$value' in node) {
    if (node.$type === 'number' || node.$type === 'string' || node.$type === 'dimension' || node.$type === 'sizing' || node.$type === 'spacing') {
      const tokenPath = path.join('/');
      out.push({
        name: path.map(toKebab).join('-'),
        value: formatDeviceValue(tokenPath, node, tokenMap)
      });
    }

    return out;
  }

  if (!node || typeof node !== 'object') {
    return out;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      continue;
    }

    walkDevice(value, [...path, key], out, tokenMap);
  }

  return out;
}

for (const device of ['Desktop', 'Tablet', 'Mobile']) {
  const filePath = resolve(deviceDir, `${device}.tokens.json`);
  if (!existsSync(filePath)) {
    continue;
  }

  const deviceTokens = JSON.parse(readFileSync(filePath, 'utf8'));
  const tokenMap = buildTokenMap(deviceTokens);
  deviceEntries.set(device.toLowerCase(), walkDevice(deviceTokens, [], [], tokenMap).sort((first, second) => first.name.localeCompare(second.name)));
}

const sortedEntries = entries
  .filter((entry) => entry.value)
  .sort((first, second) => first.name.localeCompare(second.name));
const sortedLightEntries = lightEntries
  .filter((entry) => entry.value)
  .sort((first, second) => first.name.localeCompare(second.name));

function themeName(name) {
  return name.replace(/^color-/, '');
}

const css = [
  '/* Generated from src/tokens/Value.tokens.json and src/tokens/Device/*.tokens.json. Do not edit manually. */',
  '@theme {',
  ...sortedEntries.map((entry) => {
    if (entry.value.startsWith('#') || entry.value.startsWith('rgb')) {
      return `  --color-${themeName(entry.name)}: var(--figma-${entry.name});`;
    }

    return `  --spacing-${themeName(entry.name)}: var(--figma-${entry.name});`;
  }),
  '}',
  '',
  ':root {',
  ...sortedEntries.map((entry) => `  --figma-${entry.name}: ${entry.value};`),
  ...sortedLightEntries.map((entry) => `  --figma-light-${entry.name}: ${entry.value};`),
  ...sortedLightEntries.map((entry) => `  --${entry.name}: var(--figma-light-${entry.name});`),
  ...(deviceEntries.get('desktop') || []).map((entry) => `  --figma-device-${entry.name}: ${entry.value};`),
  '}',
  '',
  '@media (max-width: 1023px) {',
  '  :root {',
  ...(deviceEntries.get('tablet') || []).map((entry) => `    --figma-device-${entry.name}: ${entry.value};`),
  '  }',
  '}',
  '',
  '@media (max-width: 767px) {',
  '  :root {',
  ...(deviceEntries.get('mobile') || []).map((entry) => `    --figma-device-${entry.name}: ${entry.value};`),
  '  }',
  '}',
  ''
].join('\n');

writeFileSync(outputPath, css);
const deviceTokenCount = Array.from(deviceEntries.values()).reduce((total, values) => total + values.length, 0);
console.log(`Generated ${sortedEntries.length} value tokens, ${sortedLightEntries.length} light tokens and ${deviceTokenCount} device tokens at ${outputPath}`);
