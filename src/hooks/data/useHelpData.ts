import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HelpCategory {
  id: string;
  title: string;
  slug: string;
  display_order: number;
}

export interface HelpArticle {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  body_markdown: string;
  path_trigger: string | null;
  video_url: string | null;
  help_article_roles?: { role_name: string }[];
}

export function useHelpCategories() {
  return useQuery({
    queryKey: ['help_categories'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('help_categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as HelpCategory[];
    },
  });
}

export function useHelpArticles() {
  return useQuery({
    queryKey: ['help_articles'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('help_articles')
        .select('*, help_article_roles(role_name)');
      if (error) throw error;
      return data as HelpArticle[];
    },
  });
}
