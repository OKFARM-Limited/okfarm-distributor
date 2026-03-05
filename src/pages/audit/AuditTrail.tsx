import { auditLog } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AuditTrail() {
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Audit Trail</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs">{new Date(e.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{e.user}</TableCell>
                  <TableCell><Badge variant="outline">{e.action}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
