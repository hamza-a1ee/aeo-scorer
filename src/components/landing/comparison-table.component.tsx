import { SurfaceCard } from '@/components/aeo/surface-card.component';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ROWS = [
  { k: 'Input', a: 'Brand name and a prompt list', b: 'A URL', c: 'A URL' },
  { k: 'Asks AI engines', a: 'Yes', b: 'No', c: 'Yes' },
  { k: 'Checks your site', a: 'No', b: 'Yes, mostly homepage', c: 'Yes, every crawled page' },
  { k: 'Explains why an engine got it wrong', a: 'No', b: 'No', c: 'Traces it to the page' },
  { k: 'Writes the fix', a: 'Recommendations', b: 'Recommendations', c: 'Copy, JSON-LD, llms.txt, robots patch' },
];

export function ComparisonTable() {
  return (
    <SurfaceCard className="overflow-hidden">
      <Table className="min-w-[640px] text-[15px]">
        <TableHeader>
          <TableRow className="bg-background hover:bg-background">
            <TableHead className="px-5 py-3.5" />
            <TableHead className="px-5 py-3.5 font-medium text-muted-foreground">Brand monitors</TableHead>
            <TableHead className="px-5 py-3.5 font-medium text-muted-foreground">Technical checkers</TableHead>
            <TableHead className="px-5 py-3.5 font-semibold text-primary">AEO App</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map(r => (
            <TableRow key={r.k}>
              <TableHead scope="row" className="px-5 py-3.5 font-medium whitespace-normal text-foreground">
                {r.k}
              </TableHead>
              <TableCell className="px-5 py-3.5 whitespace-normal text-muted-foreground">{r.a}</TableCell>
              <TableCell className="px-5 py-3.5 whitespace-normal text-muted-foreground">{r.b}</TableCell>
              <TableCell className="px-5 py-3.5 font-medium whitespace-normal">{r.c}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SurfaceCard>
  );
}
