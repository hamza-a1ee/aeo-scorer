'use client';

import { Download } from 'lucide-react';

import { CopyButton } from '@/components/aeo/copy-button.component';
import { AppHeader } from '@/components/layout/app-header.component';
import { Button } from '@/components/ui/button';
import { useExportCsv } from '@/query/report.query';

/** App header with "Copy share link" and "Export CSV". */
export function ReportHeader({ token }: { token: string }) {
  const exportCsv = useExportCsv(token);
  return (
    <AppHeader
      rightSlot={
        <div className="flex flex-wrap gap-2">
          <CopyButton
            value={() => window.location.href.split('#')[0]}
            label="Copy share link"
            copiedLabel="Link copied"
            variant="outline"
            className="min-h-11 border-strong-border px-4 text-sm font-medium shadow-none [&_svg]:hidden"
          />
          <Button variant="outline" className="min-h-11 border-strong-border px-4 text-sm font-medium shadow-none" onClick={() => exportCsv('all')}>
            <Download aria-hidden className="hidden" />
            Export CSV
          </Button>
        </div>
      }
    />
  );
}
