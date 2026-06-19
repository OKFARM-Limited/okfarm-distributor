/**
 * Client-side PDF generation using jsPDF
 */

export interface PDFColumn {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown) => string;
}

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: PDFColumn[];
  data: Record<string, unknown>[];
  summaryRows?: { label: string; value: string }[];
  orientation?: 'portrait' | 'landscape';
}

export async function generatePDFReport(options: PDFReportOptions) {
  const { default: jsPDF } = await import('jspdf');
  // @ts-expect-error -- jspdf-autotable has no type declarations
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribo', 14, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(options.title.replace(/₦/g, 'NGN'), 14, 30);
  
  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(options.subtitle.replace(/₦/g, 'NGN'), 14, 37);
    doc.setTextColor(0);
  }
  
  // Date
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 20, { align: 'right' });
  
  // Line separator
  const startY = options.subtitle ? 42 : 36;
  doc.setDrawColor(200);
  doc.line(14, startY, pageWidth - 14, startY);

  // Table
  const headers = options.columns.map(c => c.header.replace(/₦/g, 'NGN'));
  const body = options.data.map(row =>
    options.columns.map(col => {
      const val = row[col.key];
      const formatted = col.format ? col.format(val) : (val ?? '');
      return String(formatted).replace(/₦/g, 'NGN ');
    })
  );

  autoTable(doc, {
    startY: startY + 4,
    head: [headers],
    body,
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      overflow: 'linebreak',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: { top: 2.5, right: 4, bottom: 2.5, left: 4 },
      overflow: 'linebreak',
      minCellHeight: 8,
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    columnStyles: options.columns.reduce((acc, col, i) => {
      acc[i] = {
        overflow: 'linebreak',
        ...(col.align ? { halign: col.align } : {}),
        ...(col.width ? { cellWidth: col.width } : {}),
      };
      return acc;
    }, {} as Record<number, { halign?: string; cellWidth?: number; overflow?: string }>),
    // Prevent any single cell from consuming the entire page width
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap',
    },
  });

  // Summary rows at bottom
  if (options.summaryRows && options.summaryRows.length > 0) {
    // @ts-expect-error -- lastAutoTable added by jspdf-autotable plugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY || startY + 20;
    let y = finalY + 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    options.summaryRows.forEach(row => {
      const cleanLabel = row.label.replace(/₦/g, 'NGN');
      const cleanValue = row.value.replace(/₦/g, 'NGN ');
      doc.text(cleanLabel, 14, y);
      doc.text(cleanValue, pageWidth - 14, y, { align: 'right' });
      y += 7;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2, doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
