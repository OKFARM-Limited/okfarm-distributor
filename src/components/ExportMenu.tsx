import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportMenuProps {
  onExportCSV: () => void;
  onExportPDF?: () => void;
  label?: string;
  size?: 'sm' | 'default';
}

/**
 * Reusable Export dropdown button that provides CSV (always) and optional PDF export.
 */
export function ExportMenu({
  onExportCSV,
  onExportPDF,
  label = 'Export',
  size = 'sm',
}: ExportMenuProps) {
  // If no PDF handler, just do a plain button for CSV
  if (!onExportPDF) {
    return (
      <Button variant="outline" size={size} onClick={onExportCSV}>
        <Download className="h-4 w-4 mr-1.5" />
        {label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size}>
          <Download className="h-4 w-4 mr-1.5" />
          {label}
          <span className="ml-1 text-muted-foreground text-xs">▾</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportCSV}>
          <Download className="h-3.5 w-3.5 mr-2 text-emerald-600" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF}>
          <Download className="h-3.5 w-3.5 mr-2 text-blue-600" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
