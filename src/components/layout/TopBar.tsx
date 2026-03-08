import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useOutletContext } from '@/contexts/OutletContext';
import { Bell, Moon, Sun, Search, Wifi, WifiOff, LogOut, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedOutletId, setSelectedOutletId, selectedOutlet, allOutlets, isAllOutlets } = useOutletContext();
  const [isOnline] = useState(true);
  const navigate = useNavigate();

  const handleNotification = () => {
    toast({
      title: '⚠️ Low Stock Alert',
      description: `FanYogo Strawberry is running low at ${selectedOutlet?.name || 'multiple outlets'}. 15 packs remaining.`,
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur px-4">
      <SidebarTrigger className="shrink-0" />

      {/* Outlet Selector */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary shrink-0" />
        <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
          <SelectTrigger className="h-9 w-[180px] md:w-[200px] text-sm font-medium border-primary/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outlets (Overview)</SelectItem>
            {allOutlets.map(o => (
              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search${!isAllOutlets ? ` in ${selectedOutlet?.short_code}` : ''}...`} className="pl-9 h-9 bg-muted/50" />
        </div>
      </div>

      <div className="flex-1" />

      {/* Current Outlet Badge */}
      {!isAllOutlets && selectedOutlet && (
        <Badge variant="outline" className="hidden lg:flex items-center gap-1 text-xs border-primary/30 text-primary">
          <MapPin className="h-3 w-3" />
          {selectedOutlet.short_code}
        </Badge>
      )}

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9" title={isOnline ? 'Online — Synced' : 'Offline'}>
          {isOnline ? <Wifi className="h-4 w-4 text-success" /> : <WifiOff className="h-4 w-4 text-destructive" />}
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={handleNotification}>
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
            3
          </Badge>
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm">{user.name.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground -mt-2 capitalize">{user.role}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
