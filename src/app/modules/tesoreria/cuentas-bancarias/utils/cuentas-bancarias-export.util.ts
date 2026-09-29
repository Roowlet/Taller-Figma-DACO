import type { QueryReportColumn, QueryReportExportFormat, QueryReportRow } from '../../../../shared/types/query-report.types';

/** Descarga un Blob como archivo. */
function descargar(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

/**
 * Genera el archivo de «Exportar» de la consulta con las filas que muestra la tabla (tras buscar y filtrar).
 * La plantilla solo avisa el formato; el archivo lo arma la pantalla. Las librerías se cargan al exportar, así no pesan
 * en la pantalla hasta que se usan.
 */
export async function exportarCuentasBancarias(formato: QueryReportExportFormat, columnas: QueryReportColumn[], filas: QueryReportRow[]): Promise<void> {
  const fecha = new Date().toISOString().slice(0, 10);
  const nombre = `cuentas-bancarias-${fecha}`;
  const encabezados = columnas.map((c) => c.label);
  const valores = filas.map((fila) => columnas.map((c) => fila[c.key] ?? ''));

  if (formato === 'csv') {
    const escapar = (valor: string) => (/[",\n;]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor);
    const contenido = [encabezados, ...valores].map((linea) => linea.map(escapar).join(',')).join('\n');
    // BOM para que Excel abra bien las tildes.
    descargar(new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8' }), `${nombre}.csv`);
    return;
  }

  if (formato === 'excel') {
    const { Workbook } = await import('exceljs');
    const libro = new Workbook();
    const hoja = libro.addWorksheet('Cuentas bancarias');
    hoja.columns = columnas.map((c) => ({ header: c.label, key: c.key, width: Math.max(14, Math.round((c.width ?? 140) / 7)) }));
    hoja.getRow(1).font = { bold: true };
    filas.forEach((fila) => hoja.addRow(fila));
    const buffer = await libro.xlsx.writeBuffer();
    descargar(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${nombre}.xlsx`);
    return;
  }

  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const pdf = new jsPDF({ orientation: 'landscape' });
  pdf.setFontSize(14);
  pdf.text('Consulta de cuentas bancarias', 14, 16);
  autoTable(pdf, { head: [encabezados], body: valores, startY: 22, styles: { fontSize: 8 } });
  pdf.save(`${nombre}.pdf`);
}
