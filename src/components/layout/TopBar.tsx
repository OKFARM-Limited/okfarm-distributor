import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useOutletContext } from '@/contexts/OutletContext';
import { Bell, Moon, Sun, LogOut, Calendar, ChevronDown } from 'lucide-react';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedOutletId, setSelectedOutletId, allOutlets } = useOutletContext();
  const navigate = useNavigate();

  const handleNotification = () => {
    navigate('/notifications');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">

      {/* ── MOBILE HEADER (hidden on md+) ── */}
      <div className="flex md:hidden h-14 items-center gap-2 px-4">
        {/* Hamburger */}
        <SidebarTrigger className="shrink-0" />

        {/* Logo wordmark */}
        <div className="flex items-center gap-1.5 flex-1">
          {/* D icon */}
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-black text-sm leading-none">D</span>
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">Distribo</span>
        </div>

        <div className="flex items-center gap-0.5">
          <OfflineIndicator />

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark'
              ? <Sun className="h-[18px] w-[18px]" />
              : <Moon className="h-[18px] w-[18px]" />
            }
          </Button>

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative"
            onClick={handleNotification}
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-4 min-w-4 p-0 flex items-center justify-center text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full leading-none">
              3
            </span>
          </Button>

          {/* User Avatar */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0 ml-0.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
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
      </div>

      {/* ── DESKTOP HEADER (hidden on mobile) ── */}
      <div className="hidden md:flex h-14 items-center gap-3 px-4">
        <SidebarTrigger className="shrink-0" />

        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 text-muted-foreground/70" />
          <span className="font-medium text-foreground">{today}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>

        {/* Outlet Selector */}
        <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
          <SelectTrigger className="h-9 w-[160px] md:w-[180px] text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outlets</SelectItem>
            {allOutlets.map(o => (
              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <OfflineIndicator />

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={handleNotification}>
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground rounded-full">
              3
            </Badge>
          </Button>

          {/* User Avatar */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0 ml-1">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
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
      </div>

    </header>
  );
}
