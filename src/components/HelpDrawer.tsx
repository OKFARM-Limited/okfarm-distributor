import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHelpCategories, useHelpArticles, type HelpArticle, type HelpCategory } from '@/hooks/useSupabaseData';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Search, BookOpen, ChevronRight, ArrowLeft, HelpCircle, 
  Video, FileText, AlertCircle, Info, Flame
} from 'lucide-react';

interface HelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDrawer({ open, onOpenChange }: HelpDrawerProps) {
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const userRole = user?.role || 'viewer';

  const { data: categories = [], isLoading: catLoading } = useHelpCategories();
  const { data: articles = [], isLoading: artLoading } = useHelpArticles();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  // 1. Role-based filtering of articles
  const roleFilteredArticles = useMemo(() => {
    return articles.filter(art => {
      if (!art.help_article_roles || art.help_article_roles.length === 0) return true;
      return art.help_article_roles.some(r => r.role_name === userRole);
    });
  }, [articles, userRole]);

  // 2. Context-aware articles (matching current path)
  const contextArticles = useMemo(() => {
    if (searchQuery) return [];
    return roleFilteredArticles.filter(art => art.path_trigger === currentPath);
  }, [roleFilteredArticles, currentPath, searchQuery]);

  // 3. Search filtering
  const searchedArticles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return roleFilteredArticles.filter(
      art => 
        art.title.toLowerCase().includes(query) || 
        art.body_markdown.toLowerCase().includes(query)
    );
  }, [roleFilteredArticles, searchQuery]);

  const handleCategoryClick = (cat: HelpCategory) => {
    setSelectedCategory(cat);
    setSelectedArticle(null);
    setSearchQuery('');
  };

  const handleArticleClick = (art: HelpArticle) => {
    setSelectedArticle(art);
  };

  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset view state when closed
    setTimeout(() => {
      setSelectedArticle(null);
      setSelectedCategory(null);
      setSearchQuery('');
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l shadow-2xl">
        <SheetHeader className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            {(selectedCategory || selectedArticle) && (
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <SheetTitle className="text-lg font-bold flex items-center gap-1.5 flex-1 truncate">
              {selectedArticle 
                ? selectedArticle.title 
                : selectedCategory 
                  ? selectedCategory.title 
                  : 'Help & Training Center'
              }
            </SheetTitle>
          </div>

          {!selectedArticle && (
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guides, playbooks, FAQs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          {catLoading || artLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
              Loading documentation...
            </div>
          ) : selectedArticle ? (
            <div className="space-y-4">
              {selectedArticle.video_url && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-xs">
                  <Video className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold">Video Tutorial Available:</span> 
                    <a href={selectedArticle.video_url} target="_blank" rel="noreferrer" className="underline ml-1 font-medium hover:text-blue-900">
                      Watch Video Guide
                    </a>
                  </div>
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownViewer content={selectedArticle.body_markdown} />
              </div>
            </div>
          ) : searchQuery ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search Results</h3>
              {searchedArticles.length > 0 ? (
                searchedArticles.map(art => (
                  <ArticleRow key={art.id} article={art} onClick={() => handleArticleClick(art)} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No articles found matching "{searchQuery}"</p>
              )}
            </div>
          ) : selectedCategory ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Articles in {selectedCategory.title}</h3>
              {roleFilteredArticles.filter(art => art.category_id === selectedCategory.id).length > 0 ? (
                roleFilteredArticles
                  .filter(art => art.category_id === selectedCategory.id)
                  .map(art => (
                    <ArticleRow key={art.id} article={art} onClick={() => handleArticleClick(art)} />
                  ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No articles in this category.</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Context-aware suggestions */}
              {contextArticles.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    <Flame className="h-3.5 w-3.5" />
                    <span>Helpful on this Page</span>
                  </div>
                  <div className="space-y-2">
                    {contextArticles.map(art => (
                      <ArticleRow key={art.id} article={art} onClick={() => handleArticleClick(art)} isContext />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories list */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</h3>
                <div className="grid gap-2">
                  {categories.map(cat => {
                    const count = roleFilteredArticles.filter(art => art.category_id === cat.id).length;
                    if (count === 0) return null;
                    return (
                      <Button
                        key={cat.id}
                        variant="outline"
                        className="w-full justify-between h-12 px-3 text-left hover:bg-accent/50 font-medium text-sm"
                        onClick={() => handleCategoryClick(cat)}
                      >
                        <span className="flex items-center gap-2.5">
                          <BookOpen className="h-4 w-4 text-primary/70 shrink-0" />
                          <span className="truncate">{cat.title}</span>
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{count}</Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ArticleRow({ article, onClick, isContext = false }: { article: HelpArticle; onClick: () => void; isContext?: boolean }) {
  return (
    <Button
      variant="outline"
      className={`w-full justify-between h-auto py-3 px-3 text-left font-normal text-sm border-l-3 ${
        isContext 
          ? 'border-l-amber-500 bg-amber-50/20 hover:bg-amber-50/40 border-amber-200/50' 
          : 'border-l-primary/60 hover:bg-accent/40'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <FileText className={`h-4 w-4 mt-0.5 shrink-0 ${isContext ? 'text-amber-600' : 'text-muted-foreground'}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground leading-tight truncate">{article.title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {article.body_markdown.replace(/[#*`>]/g, '').slice(0, 80)}...
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0 ml-1" />
    </Button>
  );
}

// Custom Markdown Viewer component parsing basic styling constructs
function MarkdownViewer({ content }: { content: string }) {
  const lines = content.split('\n');
  let inList = false;
  const listItems: string[] = [];

  const parsedElements = lines.map((line, idx) => {
    const trimmed = line.trim();

    // End list if we find a non-list item
    if (inList && !trimmed.startsWith('-')) {
      inList = false;
      const list = (
        <ul key={`list-${idx}`} className="list-disc pl-5 my-3 space-y-1 text-sm text-foreground/90">
          {listItems.map((item, i) => (
            <li key={i}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      listItems.length = 0; // Clear array
      return list;
    }

    // Headers
    if (trimmed.startsWith('# ')) {
      return <h1 key={idx} className="text-xl font-bold text-foreground mt-4 mb-2 first:mt-0">{parseInlineMarkdown(trimmed.substring(2))}</h1>;
    }
    if (trimmed.startsWith('## ')) {
      return <h2 key={idx} className="text-lg font-bold text-foreground mt-3 mb-2">{parseInlineMarkdown(trimmed.substring(3))}</h2>;
    }
    if (trimmed.startsWith('### ')) {
      return <h3 key={idx} className="text-base font-semibold text-foreground mt-3 mb-1">{parseInlineMarkdown(trimmed.substring(4))}</h3>;
    }

    // Callouts / Alerts (GitHub Markdown style)
    if (trimmed.startsWith('> [!NOTE]')) {
      return null; // Handle text in following blockquotes
    }
    if (trimmed.startsWith('> [!WARNING]')) {
      return null;
    }
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.substring(1).trim();
      const isNote = lines[idx - 1]?.includes('[!NOTE]');
      const isWarning = lines[idx - 1]?.includes('[!WARNING]');

      if (isNote || isWarning) {
        return (
          <div key={idx} className={`p-3 rounded-lg border my-3 flex items-start gap-2 text-xs leading-relaxed ${
            isWarning 
              ? 'bg-amber-50 border-amber-200 text-amber-800' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {isWarning ? <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" /> : <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />}
            <span>{parseInlineMarkdown(quoteText)}</span>
          </div>
        );
      }
      return (
        <blockquote key={idx} className="border-l-4 border-muted-foreground/30 pl-4 py-1 italic my-3 text-muted-foreground text-sm">
          {parseInlineMarkdown(quoteText)}
        </blockquote>
      );
    }

    // Lists
    if (trimmed.startsWith('-')) {
      inList = true;
      listItems.push(trimmed.substring(1).trim());
      // Render list items when list block finishes, returning null for intermediate items
      if (idx === lines.length - 1 || !lines[idx + 1]?.trim().startsWith('-')) {
        inList = false;
        const list = (
          <ul key={`list-${idx}`} className="list-disc pl-5 my-3 space-y-1 text-sm text-foreground/90">
            {listItems.map((item, i) => (
              <li key={i}>{parseInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
        listItems.length = 0;
        return list;
      }
      return null;
    }

    // Empty Lines
    if (!trimmed) return <div key={idx} className="h-2" />;

    // Default Paragraph
    return <p key={idx} className="text-sm text-foreground/90 leading-relaxed mb-2.5">{parseInlineMarkdown(trimmed)}</p>;
  });

  return <div className="space-y-0.5">{parsedElements.filter(Boolean)}</div>;
}

// Parses inline styles like bold (**text**), italics (*text*) and link mappings ([text](url))
function parseInlineMarkdown(text: string): React.ReactNode[] {
  // Simple tokenizer for bold, italics, and links
  let currentText = text;
  const elements: React.ReactNode[] = [];
  let keyIdx = 0;

  // Pattern match links: [Text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  let lastIndex = 0;

  while ((match = linkRegex.exec(currentText)) !== null) {
    const textBefore = currentText.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push(...parseBoldItalic(textBefore, keyIdx++));
    }
    const linkText = match[1];
    const linkUrl = match[2];
    elements.push(
      <a key={`link-${keyIdx++}`} href={linkUrl} className="text-primary underline hover:text-primary/80 font-medium" target="_blank" rel="noreferrer">
        {linkText}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  const textRemaining = currentText.substring(lastIndex);
  if (textRemaining) {
    elements.push(...parseBoldItalic(textRemaining, keyIdx++));
  }

  return elements.length > 0 ? elements : [text];
}

function parseBoldItalic(text: string, baseKey: number): React.ReactNode[] {
  let parts: React.ReactNode[] = [];
  
  // Replace bold **text** -> strong
  // Replace italics *text* -> em
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIdx = 0;
  let match;
  let key = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIdx, match.index);
    if (textBefore) {
      parts.push(...parseItalics(textBefore, `${baseKey}-b-${key++}`));
    }
    parts.push(<strong key={`${baseKey}-bold-${key++}`} className="font-bold text-foreground">{match[1]}</strong>);
    lastIdx = boldRegex.lastIndex;
  }

  const textRemaining = text.substring(lastIdx);
  if (textRemaining) {
    parts.push(...parseItalics(textRemaining, `${baseKey}-b-${key++}`));
  }

  return parts;
}

function parseItalics(text: string, baseKey: string): React.ReactNode[] {
  let parts: React.ReactNode[] = [];
  const italicRegex = /\*([^*]+)\*/g;
  let lastIdx = 0;
  let match;
  let key = 0;

  while ((match = italicRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIdx, match.index);
    if (textBefore) {
      parts.push(textBefore);
    }
    parts.push(<em key={`${baseKey}-em-${key++}`} className="italic">{match[1]}</em>);
    lastIdx = italicRegex.lastIndex;
  }

  const textRemaining = text.substring(lastIdx);
  if (textRemaining) {
    parts.push(textRemaining);
  }

  return parts;
}
