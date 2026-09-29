/**
 * Helpers puros sobre archivos adjuntos, compartidos por los componentes que
 * los muestran o validan (`siaf-uploader`, `siaf-uploaded-file-card`).
 */

/**
 * Ícono (Material Icons) que representa el formato de un archivo por su
 * extensión. El diseño muestra el ícono del tipo — Figma usa `xls_file` en su
 * ejemplo, pero aplica a todos los formatos, no solo a Excel.
 *
 * Todos los nombres están verificados contra `material-icons/css/_codepoints`;
 * un ligature inexistente se renderizaría como texto crudo.
 */
const ICONO_POR_EXTENSION: ReadonlyArray<{ exts: readonly string[]; icono: string }> = [
  { exts: ['pdf'], icono: 'picture_as_pdf' },
  { exts: ['doc', 'docx', 'odt', 'rtf'], icono: 'description' },
  { exts: ['xls', 'xlsx', 'xlsm', 'csv', 'ods'], icono: 'table_chart' },
  { exts: ['ppt', 'pptx', 'odp'], icono: 'slideshow' },
  { exts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'tif', 'tiff'], icono: 'image' },
  { exts: ['zip', 'rar', '7z', 'tar', 'gz'], icono: 'folder_zip' },
  { exts: ['txt', 'md', 'log'], icono: 'article' },
];

/** Ícono del archivo por su nombre; genérico si la extensión no está mapeada. */
export function iconoDeArchivo(nombre: string): string {
  const ext = nombre.toLowerCase().split('.').pop() ?? '';
  return ICONO_POR_EXTENSION.find((m) => m.exts.includes(ext))?.icono ?? 'insert_drive_file';
}

/**
 * ¿El archivo coincide con el `accept` declarado?
 *
 * Se compara por **extensión**, que es lo que el uploader promete en su
 * `accept`/`acceptedLabel` ("Solo admite archivos .pdf"). El MIME real lo
 * valida el backend al subir (`documents.service.ts`), de modo que las dos
 * capas comprueban cosas distintas y un archivo renombrado igual se rechaza
 * allá. `accept` vacío = sin restricción.
 */
export function archivoCoincideConAccept(file: File, accept: string): boolean {
  const patrones = accept
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  if (patrones.length === 0) return true;

  const nombre = file.name.toLowerCase();
  const mime = (file.type || '').toLowerCase();

  return patrones.some((patron) => {
    if (patron.startsWith('.')) return nombre.endsWith(patron);
    // Formas MIME: "application/pdf" o comodines tipo "image/*".
    if (patron.endsWith('/*')) return mime.startsWith(patron.slice(0, -1));
    return mime === patron;
  });
}
