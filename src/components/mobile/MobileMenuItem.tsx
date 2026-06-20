import { ChevronRight, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileMenuItemProps {
  icon: LucideIcon;
  iconBg: string;   // Tailwind bg class e.g. "bg-blue-100 dark:bg-blue-900/30"
  iconColor: string; // Tailwind text class e.g. "text-blue-600 dark:text-blue-400"
  title: string;
  description: string;
  to: string;
}

export function MobileMenuItem({ icon: Icon, iconBg, iconColor, title, description, to }: MobileMenuItemProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="w-full flex items-center gap-4 px-4 py-4 bg-card dark:bg-card border border-border/60 rounded-2xl active:scale-[0.98] transition-transform duration-100 text-left"
    >
      <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
    </button>
  );
}
