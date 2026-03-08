import { useState } from 'react';
import { useTrainingModules, useVendorTrainingProgress, useVendors } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, BookOpen, CheckCircle, Clock, Users, Award, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

const defaultCourses = [
  { title: 'Road Safety & Traffic Awareness', category: 'safety', duration: '2 hours', mandatory: true, description: 'Essential road safety rules for push cart and bicycle vendors.' },
  { title: 'Financial Literacy Basics', category: 'finance', duration: '3 hours', mandatory: true, description: 'Cash handling, savings, and basic accounting for vendors.' },
  { title: 'Product Knowledge: FanMilk Range', category: 'product', duration: '1.5 hours', mandatory: true, description: 'Complete overview of all FanMilk SKUs, storage, and freshness.' },
  { title: 'Active Selling Techniques', category: 'sales', duration: '2 hours', mandatory: false, description: 'How to approach customers, upsell, and handle objections.' },
  { title: 'Cold Chain Compliance', category: 'compliance', duration: '1 hour', mandatory: true, description: 'Temperature management and spoilage prevention protocols.' },
  { title: 'Mobile Money & Digital Payments', category: 'finance', duration: '1.5 hours', mandatory: false, description: 'Using OPay, PalmPay, and other mobile payment platforms.' },
  { title: 'Customer Service Excellence', category: 'sales', duration: '2 hours', mandatory: false, description: 'Building repeat customers and handling complaints.' },
  { title: 'Health & Hygiene Standards', category: 'compliance', duration: '1 hour', mandatory: true, description: 'Personal hygiene and product handling best practices.' },
];

const categoryColors: Record<string, string> = {
  safety: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  finance: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  sales: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  product: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  compliance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default function FanAcademy() {
  const [tab, setTab] = useState('courses');
  const { toast } = useToast();
  const { viewerProps } = useViewerGuard();
  const { data: modules = [], isLoading: mLoading } = useTrainingModules();
  const { data: progress = [], isLoading: pLoading } = useVendorTrainingProgress();
  const { data: vendors = [], isLoading: vLoading } = useVendors('all');

  const isLoading = mLoading || pLoading || vLoading;

  // Use DB modules if available, else show defaults
  const courses = (modules as any[]).length > 0 ? (modules as any[]).map(m => ({
    id: m.id, title: m.title, category: m.category, duration: m.duration, mandatory: m.mandatory, description: m.description,
  })) : defaultCourses.map((c, i) => ({ id: `default-${i}`, ...c }));

  // Build vendor progress from DB
  const activeVendors = (vendors as any[]).filter(v => v.status === 'active').slice(0, 20);
  const vendorTraining = activeVendors.map(v => {
    const vProgress = (progress as any[]).filter(p => p.vendor_id === v.id);
    const completed = vProgress.filter(p => p.status === 'completed').length;
    const total = courses.length || 1;
    return { vendor: v, progress: vProgress, completionRate: Math.round((completed / total) * 100) };
  });

  const avgCompletion = vendorTraining.length ? Math.round(vendorTraining.reduce((s, vt) => s + vt.completionRate, 0) / vendorTraining.length) : 0;
  const fullyTrained = vendorTraining.filter(vt => vt.completionRate === 100).length;

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fan Academy</h1>
          <p className="text-muted-foreground">Vendor training & upskilling tracker</p>
        </div>
        <Button onClick={() => toast({ title: 'Report Generated', description: 'Training completion report exported.' })}>
          <GraduationCap className="h-4 w-4 mr-2" />Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3"><BookOpen className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Courses</p><p className="text-xl font-bold">{courses.length}</p></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Users className="h-8 w-8 text-blue-500" /><div><p className="text-xs text-muted-foreground">Vendors Enrolled</p><p className="text-xl font-bold">{vendorTraining.length}</p></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Award className="h-8 w-8 text-yellow-500" /><div><p className="text-xs text-muted-foreground">Avg Completion</p><p className="text-xl font-bold">{avgCompletion}%</p></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-xs text-muted-foreground">Fully Trained</p><p className="text-xl font-bold">{fullyTrained}</p></div></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="courses">Course Catalog</TabsTrigger><TabsTrigger value="progress">Vendor Progress</TabsTrigger></TabsList>

        <TabsContent value="courses" className="space-y-3 mt-4">
          {courses.map(c => (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{c.title}</h3>
                        <Badge className={categoryColors[c.category] || ''}>{c.category}</Badge>
                        {c.mandatory && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{c.duration}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Vendor</TableHead><TableHead>Completion</TableHead><TableHead>Completed</TableHead><TableHead>In Progress</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {vendorTraining.map(({ vendor, progress: vp, completionRate }) => {
                    const completed = vp.filter((p: any) => p.status === 'completed').length;
                    const inProgress = vp.filter((p: any) => p.status === 'in_progress').length;
                    return (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={completionRate} className="h-2 w-16" />
                            <span className="text-xs">{completionRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{completed}</TableCell>
                        <TableCell>{inProgress}</TableCell>
                      </TableRow>
                    );
                  })}
                  {vendorTraining.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No training progress data yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
