import { useState } from 'react';
import { useIncentivePrograms, useCommissions, useVendors } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Trophy, Gift, Target, TrendingUp, Award, Loader2 } from 'lucide-react';
import { ViewerBanner } from '@/components/ViewerGuard';

const defaultPrograms = [
  { name: 'Right to Dream', description: 'Top vendors transition to full agents with their own territory and sub-vendors.', icon: '⭐', eligibility: '6+ months, Platinum tier, 90%+ attendance', reward: 'Agent License + Territory', status: 'active' },
  { name: 'Trade Premiums', description: 'Monthly rewards for consistent performers: branded footwear, uniforms, and equipment upgrades.', icon: '🎁', eligibility: 'Gold tier or above, 3+ consecutive months', reward: 'Branded gear + equipment', status: 'active' },
  { name: 'Volume Champion', description: 'Bonus for vendors exceeding monthly volume targets by 20% or more.', icon: '🏆', eligibility: '120%+ of monthly target', reward: '₦10,000 cash bonus', status: 'active' },
  { name: 'Perfect Attendance', description: 'Reward for vendors with zero absences in a calendar month.', icon: '🎯', eligibility: '26+ days active in month', reward: '₦5,000 bonus', status: 'active' },
  { name: 'Rising Star', description: 'New vendors who reach Silver tier within their first 3 months.', icon: '📈', eligibility: 'Joined < 3 months, Silver+ tier', reward: '₦3,000 + certificate', status: 'upcoming' },
];

const tierColors: Record<string, string> = {
  platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  silver: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default function IncentivePrograms() {
  const [tab, setTab] = useState('programs');
  const { data: programs = [], isLoading: pLoading } = useIncentivePrograms();
  const { data: commissions = [], isLoading: cLoading } = useCommissions('all');
  const { data: vendors = [], isLoading: vLoading } = useVendors('all');

  const isLoading = pLoading || cLoading || vLoading;

  // Use DB programs if available, else show defaults
  const displayPrograms = (programs as any[]).length > 0 ? (programs as any[]).map(p => ({
    name: p.name, description: p.description, icon: p.icon || '⭐',
    eligibility: p.eligibility_criteria, reward: p.reward, status: p.status,
  })) : defaultPrograms;

  const activePrograms = displayPrograms.filter(p => p.status === 'active').length;

  // Build vendor eligibility from commissions
  const vendorEligibility = (commissions as any[]).slice(0, 20).map(c => {
    const vendor = (vendors as any[]).find(v => v.id === c.vendor_id);
    const eligible: string[] = [];
    if (c.tier === 'platinum' && Number(c.consistency_rate) >= 90) eligible.push('Right to Dream');
    if (['gold', 'platinum'].includes(c.tier)) eligible.push('Trade Premiums');
    if (c.days_active >= 22) eligible.push('Perfect Attendance');
    return { vendor, commission: c, eligible };
  }).filter(ve => ve.vendor);

  const totalEligible = vendorEligibility.filter(ve => ve.eligible.length > 0).length;

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incentive Programs</h1>
        <p className="text-muted-foreground">Rewards, trade premiums & vendor advancement opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3"><Award className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Active Programs</p><p className="text-xl font-bold">{activePrograms}</p></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Trophy className="h-8 w-8 text-yellow-500" /><div><p className="text-xs text-muted-foreground">Eligible Vendors</p><p className="text-xl font-bold">{totalEligible}</p></div></CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3"><Star className="h-8 w-8 text-orange-500" /><div><p className="text-xs text-muted-foreground">Right to Dream Candidates</p><p className="text-xl font-bold">{vendorEligibility.filter(ve => ve.eligible.includes('Right to Dream')).length}</p></div></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="programs">Programs</TabsTrigger><TabsTrigger value="eligibility">Vendor Eligibility</TabsTrigger></TabsList>

        <TabsContent value="programs" className="space-y-4 mt-4">
          {displayPrograms.map(p => (
            <Card key={p.name}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-1">{p.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                    <div className="flex gap-6 mt-3 text-xs">
                      <div><span className="text-muted-foreground">Criteria:</span> <span className="font-medium text-foreground">{p.eligibility}</span></div>
                      <div><span className="text-muted-foreground">Reward:</span> <span className="font-medium text-foreground">{p.reward}</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="eligibility" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Vendor</TableHead><TableHead>Tier</TableHead><TableHead>Sales</TableHead><TableHead>Consistency</TableHead><TableHead>Eligible Programs</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {vendorEligibility.map(({ vendor, commission, eligible }) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell><Badge className={tierColors[commission.tier] || ''}>{commission.tier}</Badge></TableCell>
                      <TableCell>₦{Number(commission.total_sales).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Number(commission.consistency_rate)} className="h-2 w-16" />
                          <span className="text-xs">{Number(commission.consistency_rate)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {eligible.length > 0 ? eligible.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>) : <span className="text-xs text-muted-foreground">None yet</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {vendorEligibility.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No commission data to evaluate eligibility.</TableCell></TableRow>
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
