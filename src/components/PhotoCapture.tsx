import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PhotoCaptureProps {
  bucket?: string;
  folder: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function PhotoCapture({ bucket = 'vendor-photos', folder, value, onChange, label = 'Capture Photo' }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      // Convert image to WebP via Canvas for smaller file size
      const convertToWebP = (inputFile: File): Promise<Blob> =>
        new Promise((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(inputFile);
          img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d')!.drawImage(img, 0, 0);
            canvas.toBlob(
              blob => (blob ? resolve(blob) : reject(new Error('Conversion failed'))),
              'image/webp',
              0.85,
            );
          };
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
          img.src = url;
        });

      const webpBlob = await convertToWebP(file);
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
      const { error } = await supabase.storage.from(bucket).upload(path, webpBlob, { contentType: 'image/webp', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast({ title: 'Photo uploaded' });
    } catch (e: unknown) {
      toast({ title: 'Upload failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Proof" className="h-32 w-32 object-cover rounded-md border" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => onChange(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Camera className="h-4 w-4 mr-1" />}
          {label}
        </Button>
      )}
    </div>
  );
}
