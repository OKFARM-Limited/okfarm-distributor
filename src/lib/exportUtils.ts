/**
 * Shared export utilities for CSV and PDF report generation.
 * CSV is generated client-side without dependencies.
 * PDF delegates to generatePDFReport from generatePDF.ts
 */
import { generatePDFReport, type PDFReportOptions } from './generatePDF';

// ── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCsvCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  // Wrap in quotes if contains comma, newline, or double-quote
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface CsvColumn {
  header: string;
  key: string;
  format?: (value: unknown) => string;
}

export function downloadCSV(
  columns: CsvColumn[],
  data: Record<string, unknown>[],
  filename: string,
) {
  const header = columns.map(c => escapeCsvCell(c.header)).join(',');
  const rows = data.map(row =>
    columns
      .map(col => {
        const val = row[col.key];
        return escapeCsvCell(col.format ? col.format(val) : val);
      })
      .join(','),
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ── PDF re-export ────────────────────────────────────────────────────────────

export { generatePDFReport, type PDFReportOptions };
