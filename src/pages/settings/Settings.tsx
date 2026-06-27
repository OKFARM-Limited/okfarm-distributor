import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ViewerBanner } from '@/components/ViewerGuard';
import { useViewerGuard } from '@/hooks/useViewerGuard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useWebPush } from '@/hooks/useWebPush';
import { getSessionTimeoutMinutes, setSessionTimeoutMinutes } from '@/hooks/useSessionTimeout';
import {
  Settings, User, Users, Store, Bell, ShoppingCart, Award,
  FileText, Plug, Shield, Clock, Database, Info, Globe, Calendar, Hash,
  Ruler, HelpCircle, LogOut, Upload, Save
} from 'lucide-react';

const settingsNav = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'appearance', label: 'Appearance', icon: Globe },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'storage', label: 'Storage & Data', icon: Database },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { viewerProps } = useViewerGuard();
  const { isSupported: pushSupported, isSubscribed: pushEnabled, permission: pushPermission, requestPermission, unsubscribe: unsubscribePush } = useWebPush();
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className="space-y-5 animate-fade-in">
      <ViewerBanner />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
        <p className="text-muted-foreground text-sm">Manage your application settings, preferences and account.</p>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1 self-start">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {settingsNav.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === item.key ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-4 space-y-4">
          {/* General Settings */}
          {activeSection === 'general' && (
            <>
              <Card>
                <CardHeader><CardTitle className="text-base">Company Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input defaultValue="Distribo" />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Email</Label>
                      <Input defaultValue={user?.email || ''} type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input defaultValue="+234 800 000 0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select defaultValue="NGN">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">₦ Nigerian Naira (NGN)</SelectItem>
                          <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                          <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select defaultValue="dd/mm/yyyy">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time Zone</Label>
                      <Select defaultValue="WAT">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WAT">West Africa Time (WAT)</SelectItem>
                          <SelectItem value="GMT">GMT</SelectItem>
                          <SelectItem value="EST">EST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button size="sm" {...viewerProps}><Save className="h-4 w-4 mr-1.5" />Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Regional & Localization</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('language')}</Label>
                      <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">🇬🇧 {t('english')}</SelectItem>
                          <SelectItem value="yo">🇳🇬 {t('yoruba')}</SelectItem>
                          <SelectItem value="pcm">🗣️ {t('pidgin')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Number Format</Label>
                      <Select defaultValue="1,000.00">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1,000.00">1,000.00</SelectItem>
                          <SelectItem value="1.000,00">1.000,00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">System Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive email alerts for important events', defaultOn: true },
                    { label: 'Activity Log', desc: 'Track all user actions and changes', defaultOn: true },
                    { label: 'Low Stock Alerts', desc: 'Get notified when products are running low', defaultOn: true },
                    { label: 'Daily Backup', desc: 'Automatically backup data daily', defaultOn: true },
                    { label: 'Auto Approve Vendors', desc: 'Automatically approve new vendor registrations', defaultOn: false },
                  ].map(pref => (
                    <div key={pref.label} className="flex items-center justify-between">
                      <div>
                        <Label>{pref.label}</Label>
                        <p className="text-xs text-muted-foreground">{pref.desc}</p>
                      </div>
                      <Switch defaultChecked={pref.defaultOn} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* Profile */}
          {activeSection === 'profile' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <div className="flex items-center gap-5">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-bold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <Badge className="mt-1.5 capitalize">{user.role}</Badge>
                    </div>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2"><Label>Full Name</Label><Input defaultValue={user?.name || ''} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email || ''} type="email" disabled /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input placeholder="+234..." /></div>
                  <div className="space-y-2"><Label>Role</Label><Input defaultValue={user?.role || ''} disabled /></div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1.5" />Change Photo</Button>
                  <Button size="sm" {...viewerProps}><Save className="h-4 w-4 mr-1.5" />Save Profile</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pushSupported && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        {pushPermission === 'denied' ? 'Notifications blocked in browser settings' : 'Receive real-time push alerts'}
                      </p>
                    </div>
                    <Switch
                      checked={pushEnabled}
                      disabled={pushPermission === 'denied'}
                      onCheckedChange={(checked) => { if (checked) requestPermission(); else unsubscribePush(); }}
                    />
                  </div>
                )}
                {[
                  { label: 'Email Alerts', desc: 'Receive notifications via email' },
                  { label: 'Low Stock Alerts', desc: 'Get notified when products run low' },
                  { label: 'Payment Reminders', desc: 'Receive payment due reminders' },
                  { label: 'Weekly Reports', desc: 'Receive weekly summary reports' },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between">
                    <div><Label>{n.label}</Label><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Security & Account</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                  </div>
                  <Button size="sm" variant="outline" {...viewerProps}>Update Password</Button>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label>Session Timeout</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically log out after a period of inactivity to keep your account secure.
                  </p>
                  <Select
                    defaultValue={String(getSessionTimeoutMinutes())}
                    onValueChange={(v) => setSessionTimeoutMinutes(Number(v))}
                  >
                    <SelectTrigger className="w-full sm:w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="0">Never (not recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 border-t">
                  <Label className="text-destructive">Danger Zone</Label>
                  <p className="text-xs text-muted-foreground mb-3">These actions are irreversible.</p>
                  <Button variant="destructive" size="sm" onClick={async () => { await logout(); navigate('/login'); }}>
                    <LogOut className="h-4 w-4 mr-1.5" />Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Storage */}
          {activeSection === 'storage' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Offline Storage & Data</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Draft allocations and sales entries are stored locally for offline use.</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem('distribo_alloc_drafts'); localStorage.removeItem('distribo_sales_drafts'); }} {...viewerProps}>
                    Clear Local Drafts
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-4 flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Need help?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Contact our support team for assistance with settings and configuration.</p>
                <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">Visit Help Center →</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
