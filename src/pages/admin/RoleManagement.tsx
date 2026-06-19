import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Search, ShieldCheck, UserCog, UserPlus, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { UserRole } from '@/contexts/AuthContext';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';

interface UserWithRole {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
}

export default function RoleManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { viewerProps } = useViewerGuard();

  // Create user dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('assistant');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url');
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rErr) throw rErr;

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role as UserRole]) ?? []);

      return (profiles ?? []).map(p => ({
        user_id: p.user_id,
        display_name: p.display_name,
        email: p.email,
        avatar_url: p.avatar_url,
        role: roleMap.get(p.user_id) || 'assistant' as UserRole,
      })) as UserWithRole[];
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error: delErr } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      if (delErr) throw delErr;

      const { error: insErr } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      if (insErr) throw insErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
      toast({ title: 'Role Updated', description: 'User role has been updated successfully.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message || 'Failed to update role.', variant: 'destructive' });
    },
  });

  const createUser = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { email: newEmail, password: newPassword, display_name: newName, role: newRole },
      });
      if (error) throw new Error(error.message || 'Failed to create user');
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
      toast({ title: 'User Created', description: `${newEmail} has been created with role "${newRole}".` });
      setCreateOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewRole('assistant');
    },
    onError: (err: Error) => {
      toast({ title: 'Error Creating User', description: err.message, variant: 'destructive' });
    },
  });

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.display_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const roleCount = (role: UserRole) => users.filter(u => u.role === role).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-muted-foreground text-sm">View and assign user roles across the platform.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" {...viewerProps} className="gap-2">
              <UserPlus className="h-4 w-4" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Create a new user account and assign them a role.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="new-name">Display Name</Label>
                <Input id="new-name" placeholder="John Doe" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email *</Label>
                <Input id="new-email" type="email" placeholder="user@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password *</Label>
                <Input id="new-password" type="password" placeholder="Minimum 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={() => createUser.mutate()}
                disabled={!newEmail || !newPassword || newPassword.length < 6 || createUser.isPending}
              >
                {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-2"><Users className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 mb-2"><ShieldCheck className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold text-destructive">{roleCount('admin')}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mb-2"><ShieldCheck className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Managers</p>
          <p className="text-2xl font-bold text-primary">{roleCount('manager')}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-2"><UserCog className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Assistants</p>
          <p className="text-2xl font-bold text-emerald-600">{roleCount('assistant')}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 px-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted text-muted-foreground mb-2"><UserCog className="h-5 w-5" /></div>
          <p className="text-xs text-muted-foreground">Viewers</p>
          <p className="text-2xl font-bold text-muted-foreground">{roleCount('viewer')}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage role assignments for each user</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="w-[160px]">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{(user.display_name || 'U')[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.display_name || 'Unnamed'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'secondary'} className="gap-1">
                        {(user.role === 'admin' || user.role === 'manager') && <ShieldCheck className="h-3 w-3" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(v) => updateRole.mutate({ userId: user.user_id, role: v as UserRole })}
                        disabled={viewerProps.disabled}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="assistant">Assistant</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
