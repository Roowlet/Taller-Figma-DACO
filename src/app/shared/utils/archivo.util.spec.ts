import { archivoCoincideConAccept, iconoDeArchivo } from './archivo.util';

/** Archivo de prueba: el navegador no siempre informa `type`, por eso se
 *  puede construir sin MIME (segundo parámetro vacío). */
function archivo(nombre: string, mime = ''): File {
  return new File(['x'], nombre, mime ? { type: mime } : undefined);
}

describe('archivoCoincideConAccept', () => {
  describe('accept por extensión (el caso de Contabilidad: solo .pdf)', () => {
    it('acepta un .pdf', () => {
      expect(archivoCoincideConAccept(archivo('sustento.pdf', 'application/pdf'), '.pdf')).toBeTrue();
    });

    it('rechaza word, imagen y texto', () => {
      expect(archivoCoincideConAccept(archivo('acta.docx'), '.pdf')).toBeFalse();
      expect(archivoCoincideConAccept(archivo('escaneo.png', 'image/png'), '.pdf')).toBeFalse();
      expect(archivoCoincideConAccept(archivo('notas.txt', 'text/plain'), '.pdf')).toBeFalse();
    });

    it('es case-insensitive con la extensión', () => {
      expect(archivoCoincideConAccept(archivo('SUSTENTO.PDF'), '.pdf')).toBeTrue();
    });

    it('no confunde una extensión que solo contiene el patrón', () => {
      // "reporte.pdf.exe" NO termina en .pdf
      expect(archivoCoincideConAccept(archivo('reporte.pdf.exe'), '.pdf')).toBeFalse();
    });

    it('acepta el .xlsx de la carga masiva de plan de cuentas', () => {
      expect(archivoCoincideConAccept(archivo('plantilla.xlsx'), '.xlsx')).toBeTrue();
      expect(archivoCoincideConAccept(archivo('sustento.pdf'), '.xlsx')).toBeFalse();
    });
  });

  describe('accept con varias extensiones', () => {
    it('acepta cualquiera de las listadas', () => {
      expect(archivoCoincideConAccept(archivo('a.pdf'), '.pdf,.docx')).toBeTrue();
      expect(archivoCoincideConAccept(archivo('a.docx'), '.pdf,.docx')).toBeTrue();
      expect(archivoCoincideConAccept(archivo('a.png'), '.pdf,.docx')).toBeFalse();
    });

    it('tolera espacios alrededor de las comas', () => {
      expect(archivoCoincideConAccept(archivo('a.docx'), '.pdf, .docx')).toBeTrue();
    });
  });

  describe('accept por MIME', () => {
    it('compara el MIME exacto', () => {
      expect(archivoCoincideConAccept(archivo('a.pdf', 'application/pdf'), 'application/pdf')).toBeTrue();
      expect(archivoCoincideConAccept(archivo('a.png', 'image/png'), 'application/pdf')).toBeFalse();
    });

    it('soporta comodines tipo image/*', () => {
      expect(archivoCoincideConAccept(archivo('a.png', 'image/png'), 'image/*')).toBeTrue();
      expect(archivoCoincideConAccept(archivo('a.pdf', 'application/pdf'), 'image/*')).toBeFalse();
    });
  });

  it('sin accept declarado no restringe nada', () => {
    expect(archivoCoincideConAccept(archivo('cualquiera.zip'), '')).toBeTrue();
  });
});

describe('iconoDeArchivo', () => {
  // El diseño (Figma 2608-17556) muestra el ícono del formato — el ejemplo es
  // .xls, pero debe aplicar a todos los tipos de documento.
  const casos: ReadonlyArray<[string, string]> = [
    ['sustento.pdf', 'picture_as_pdf'],
    ['acta.doc', 'description'],
    ['acta.docx', 'description'],
    ['informe.odt', 'description'],
    ['plantilla.xls', 'table_chart'],
    ['plantilla.xlsx', 'table_chart'],
    ['datos.csv', 'table_chart'],
    ['presentacion.ppt', 'slideshow'],
    ['presentacion.pptx', 'slideshow'],
    ['escaneo.png', 'image'],
    ['foto.JPEG', 'image'],
    ['adjuntos.zip', 'folder_zip'],
    ['notas.txt', 'article'],
  ];

  for (const [nombre, esperado] of casos) {
    it(`${nombre} → ${esperado}`, () => {
      expect(iconoDeArchivo(nombre)).toBe(esperado);
    });
  }

  it('formato no mapeado cae al ícono genérico de archivo', () => {
    expect(iconoDeArchivo('firmware.bin')).toBe('insert_drive_file');
  });

  it('archivo sin extensión cae al genérico', () => {
    expect(iconoDeArchivo('README')).toBe('insert_drive_file');
  });

  it('usa la última extensión, no una intermedia', () => {
    expect(iconoDeArchivo('backup.pdf.zip')).toBe('folder_zip');
  });
});
