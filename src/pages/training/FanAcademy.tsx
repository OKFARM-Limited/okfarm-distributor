import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, BookOpen, CheckCircle, Clock, Users, Award } from 'lucide-react';
import { vendors } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  category: 'safety' | 'finance' | 'sales' | 'product' | 'compliance';
  duration: string;
  mandatory: boolean;
  description: string;
}

const courses: Course[] = [
  { id: 'CRS-001', title: 'Road Safety & Traffic Awareness', category: 'safety', duration: '2 hours', mandatory: true, description: 'Essential road safety rules for push cart and bicycle vendors.' },
  { id: 'CRS-002', title: 'Financial Literacy Basics', category: 'finance', duration: '3 hours', mandatory: true, description: 'Cash handling, savings, and basic accounting for vendors.' },
  { id: 'CRS-003', title: 'Product Knowledge: FanMilk Range', category: 'product', duration: '1.5 hours', mandatory: true, description: 'Complete overview of all FanMilk SKUs, storage, and freshness.' },
  { id: 'CRS-004', title: 'Active Selling Techniques', category: 'sales', duration: '2 hours', mandatory: false, description: 'How to approach customers, upsell, and handle objections.' },
  { id: 'CRS-005', title: 'Cold Chain Compliance', category: 'compliance', duration: '1 hour', mandatory: true, description: 'Temperature management and spoilage prevention protocols.' },
  { id: 'CRS-006', title: 'Mobile Money & Digital Payments', category: 'finance', duration: '1.5 hours', mandatory: false, description: 'Using OPay, PalmPay, and other mobile payment platforms.' },
  { id: 'CRS-007', title: 'Customer Service Excellence', category: 'sales', duration: '2 hours', mandatory: false, description: 'Building repeat customers and handling complaints.' },
  { id: 'CRS-008', title: 'Health & Hygiene Standards', category: 'compliance', duration: '1 hour', mandatory: true, description: 'Personal hygiene and product handling best practices.' },
];

type CompletionStatus = 'completed' | 'in_progress' | 'not_started';

const generateVendorTraining = () => {
  return vendors.slice(0, 20).map(v => {
    const courseStatus = courses.map(c => {
      const rand = Math.random();
      const status: CompletionStatus = rand > 0.6 ? 'completed' : rand > 0.3 ? 'in_progress' : 'not_started';
      return { courseId: c.id, status, completedDate: status === 'completed' ? '2026-02-15' : undefined, score: status === 'completed' ? Math.floor(Math.random() * 30) + 70 : undefined };
    });
    const completed = courseStatus.filter(cs => cs.status === 'completed').length;
    return { vendor: v, courses: courseStatus, completionRate: Math.round((completed / courses.length) * 100) };
  });
};

const categoryColors = { safety: 'bg-red-100 text-red-800', finance: 'bg-green-100 text-green-800', sales: 'bg-blue-100 text-blue-800', product: 'bg-purple-100 text-purple-800', compliance: 'bg-orange-100 text-orange-800' };

export default function FanAcademy() {
  const [tab, setTab] = useState('courses');
  const { toast } = useToast();
  const vendorTraining = generateVendorTraining();

  const avgCompletion = Math.round(vendorTraining.reduce((s, vt) => s + vt.completionRate, 0) / vendorTraining.length);
  const fullyTrained = vendorTraining.filter(vt => vt.completionRate === 100).length;

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
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div><p className="text-xs text-muted-foreground">Total Courses</p><p className="text-xl font-bold">{courses.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500" />
          <div><p className="text-xs text-muted-foreground">Vendors Enrolled</p><p className="text-xl font-bold">{vendorTraining.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Award className="h-8 w-8 text-yellow-500" />
          <div><p className="text-xs text-muted-foreground">Avg Completion</p><p className="text-xl font-bold">{avgCompletion}%</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div><p className="text-xs text-muted-foreground">Fully Trained</p><p className="text-xl font-bold">{fullyTrained}</p></div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="courses">Course Catalog</TabsTrigger>
          <TabsTrigger value="progress">Vendor Progress</TabsTrigger>
        </TabsList>

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
                        <Badge className={categoryColors[c.category]}>{c.category}</Badge>
                        {c.mandatory && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-muted-foreground">{c.duration}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vendorTraining.filter(vt => vt.courses.find(cs => cs.courseId === c.id)?.status === 'completed').length}/{vendorTraining.length} completed
                    </p>
                  </div>
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
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Completion</TableHead>
                    {courses.map(c => <TableHead key={c.id} className="text-center text-xs w-10" title={c.title}>{c.title.split(' ')[0]}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorTraining.map(({ vendor, courses: cs, completionRate }) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={completionRate} className="h-2 w-16" />
                          <span className="text-xs">{completionRate}%</span>
                        </div>
                      </TableCell>
                      {cs.map(c => (
                        <TableCell key={c.courseId} className="text-center">
                          {c.status === 'completed' ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> :
                           c.status === 'in_progress' ? <Clock className="h-4 w-4 text-yellow-500 mx-auto" /> :
                           <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
