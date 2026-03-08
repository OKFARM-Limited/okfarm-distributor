import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Trophy, Gift, Target, TrendingUp, Award } from 'lucide-react';
import { vendors, commissions } from '@/data/mockData';

interface IncentiveProgram {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  eligibilityCriteria: string;
  reward: string;
  status: 'active' | 'upcoming' | 'ended';
}

const programs: IncentiveProgram[] = [
  { id: 'rtd', name: 'Right to Dream', description: 'Top vendors transition to full agents with their own territory and sub-vendors.', icon: <Star className="h-5 w-5 text-yellow-500" />, eligibilityCriteria: '6+ months, Platinum tier, 90%+ attendance', reward: 'Agent License + Territory', status: 'active' },
  { id: 'trade', name: 'Trade Premiums', description: 'Monthly rewards for consistent performers: branded footwear, uniforms, and equipment upgrades.', icon: <Gift className="h-5 w-5 text-primary" />, eligibilityCriteria: 'Gold tier or above, 3+ consecutive months', reward: 'Branded gear + equipment', status: 'active' },
  { id: 'volume', name: 'Volume Champion', description: 'Bonus for vendors exceeding monthly volume targets by 20% or more.', icon: <Trophy className="h-5 w-5 text-orange-500" />, eligibilityCriteria: '120%+ of monthly target', reward: '₦10,000 cash bonus', status: 'active' },
  { id: 'perfect', name: 'Perfect Attendance', description: 'Reward for vendors with zero absences in a calendar month (26+ working days).', icon: <Target className="h-5 w-5 text-green-500" />, eligibilityCriteria: '26+ days active in month', reward: '₦5,000 bonus', status: 'active' },
  { id: 'rookie', name: 'Rising Star', description: 'New vendors who reach Silver tier within their first 3 months.', icon: <TrendingUp className="h-5 w-5 text-blue-500" />, eligibilityCriteria: 'Joined < 3 months, Silver+ tier', reward: '₦3,000 + certificate', status: 'upcoming' },
];

const getVendorEligibility = (vendorId: string) => {
  const commission = commissions.find(c => c.vendorId === vendorId);
  if (!commission) return [];
  const eligible: string[] = [];
  if (commission.tier === 'platinum' && commission.consistencyRate >= 90) eligible.push('rtd');
  if (['gold', 'platinum'].includes(commission.tier)) eligible.push('trade');
  if (commission.totalSales >= commission.avgDailySales * 26 * 1.2) eligible.push('volume');
  if (commission.daysActive >= 22) eligible.push('perfect');
  return eligible;
};

const tierColors = { platinum: 'bg-purple-100 text-purple-800', gold: 'bg-yellow-100 text-yellow-800', silver: 'bg-gray-100 text-gray-700', bronze: 'bg-orange-100 text-orange-800' };

export default function IncentivePrograms() {
  const [tab, setTab] = useState('programs');

  const vendorEligibility = vendors.slice(0, 20).map(v => {
    const commission = commissions.find(c => c.vendorId === v.id);
    return { vendor: v, commission, eligible: getVendorEligibility(v.id) };
  }).filter(ve => ve.commission);

  const totalEligible = vendorEligibility.filter(ve => ve.eligible.length > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incentive Programs</h1>
        <p className="text-muted-foreground">Rewards, trade premiums & vendor advancement opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          <div><p className="text-xs text-muted-foreground">Active Programs</p><p className="text-xl font-bold">{programs.filter(p => p.status === 'active').length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <div><p className="text-xs text-muted-foreground">Eligible Vendors</p><p className="text-xl font-bold">{totalEligible}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 flex items-center gap-3">
          <Star className="h-8 w-8 text-orange-500" />
          <div><p className="text-xs text-muted-foreground">Right to Dream Candidates</p><p className="text-xl font-bold">{vendorEligibility.filter(ve => ve.eligible.includes('rtd')).length}</p></div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="eligibility">Vendor Eligibility</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4 mt-4">
          {programs.map(p => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{p.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                    <div className="flex gap-6 mt-3 text-xs">
                      <div><span className="text-muted-foreground">Criteria:</span> <span className="font-medium text-foreground">{p.eligibilityCriteria}</span></div>
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
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Consistency</TableHead>
                    <TableHead>Eligible Programs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorEligibility.map(({ vendor, commission, eligible }) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell><Badge className={tierColors[commission!.tier]}>{commission!.tier}</Badge></TableCell>
                      <TableCell>₦{commission!.totalSales.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={commission!.consistencyRate} className="h-2 w-16" />
                          <span className="text-xs">{commission!.consistencyRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {eligible.length > 0 ? eligible.map(e => {
                            const prog = programs.find(p => p.id === e);
                            return <Badge key={e} variant="outline" className="text-xs">{prog?.name}</Badge>;
                          }) : <span className="text-xs text-muted-foreground">None yet</span>}
                        </div>
                      </TableCell>
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
