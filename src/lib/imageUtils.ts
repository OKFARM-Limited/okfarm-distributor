import { supabase } from '@/integrations/supabase/client';

/**
 * Convert an image File to WebP format using HTML Canvas.
 * Preserves image quality while achieving ~30-50% size reduction vs JPEG.
 *
 * @param file - Source image file (JPEG, PNG, etc.)
 * @param quality - WebP quality (0.0 to 1.0). Default 0.85 for near-lossless.
 * @param maxDimension - Maximum width or height in pixels. Default 1200.
 * @returns WebP Blob
 */
export async function convertToWebP(
  file: File,
  quality = 0.85,
  maxDimension = 1200,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if larger than maxDimension while preserving aspect ratio
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('WebP conversion failed'));
          }
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Read as data URL to load into <img>
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image blob to Supabase Storage.
 *
 * @param blob - The image blob to upload
 * @param bucket - Supabase Storage bucket name
 * @param path - File path within the bucket (e.g. "vendor-photos/VND-00001.webp")
 * @returns Public URL of the uploaded file
 */
export async function uploadImageToStorage(
  blob: Blob,
  bucket: string,
  path: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Convert an image file to WebP and upload to Supabase Storage.
 * Convenience wrapper combining convertToWebP + uploadImageToStorage.
 *
 * @param file - Source image file
 * @param bucket - Storage bucket name (default: "vendor-photos")
 * @param fileName - File name without extension (a unique name like vendor code)
 * @returns Public URL of the uploaded WebP image
 */
export async function processAndUploadImage(
  file: File,
  bucket = 'vendor-photos',
  fileName?: string,
): Promise<string> {
  const webpBlob = await convertToWebP(file);
  const name = fileName || `img-${Date.now()}`;
  const path = `${name}.webp`;
  return uploadImageToStorage(webpBlob, bucket, path);
}
