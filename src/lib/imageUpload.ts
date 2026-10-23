// Keep each optimized photo comfortably below Firestore's 1 MiB document limit.
export const MAX_IMAGE_BYTES = 700 * 1024;
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif';
export const MEDIA_PATH = /^\/api\/media\/[a-f0-9-]{36}$/;

export type PreparedImage = { id: string; blob: Blob; width: number; height: number; name: string };

function decodeImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Fotoğraf açılamadı. Başka bir fotoğraf seçin.')); };
    image.src = url;
  });
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(
    blob => blob ? resolve(blob) : reject(new Error('Fotoğraf hazırlanamadı. Başka bir fotoğraf seçin.')),
    type, quality,
  ));
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.size) throw new Error('Seçilen dosya boş. Başka bir fotoğraf seçin.');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('Fotoğraf en fazla 20 MB olabilir. Daha küçük bir dosya seçin.');
  const heic = /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (!heic && !/^image\/(jpeg|png|webp|avif)$/.test(file.type) && !(file.type === '' && /\.(jpe?g|png|webp|avif)$/i.test(file.name))) {
    throw new Error('JPG, PNG, WebP, AVIF veya iPhone HEIC fotoğrafı seçin.');
  }
  let image: HTMLImageElement;
  try {
    image = await decodeImage(file);
  } catch (error) {
    if (!heic) throw error;
    try {
      const { default: heic2any } = await import('heic2any');
      const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
      image = await decodeImage(Array.isArray(result) ? result[0] : result);
    } catch {
      throw new Error('Bu HEIC fotoğrafı dönüştürülemedi. Fotoğrafın JPG kopyasını seçin.');
    }
  }
  if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 80_000_000) {
    throw new Error('Fotoğrafın çözünürlüğü çok yüksek. Daha küçük bir fotoğraf seçin.');
  }
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Tarayıcı fotoğrafı hazırlayamıyor. Sayfayı yenileyip tekrar deneyin.');
  let scale = Math.min(1, 2400 / Math.max(image.naturalWidth, image.naturalHeight));
  try {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.86, 0.74, 0.62]) {
        let blob = await encode(canvas, 'image/webp', quality);
        if (blob.type !== 'image/webp') {
          context.globalCompositeOperation = 'destination-over';
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.globalCompositeOperation = 'source-over';
          blob = await encode(canvas, 'image/jpeg', quality);
        }
        if (blob.size <= MAX_IMAGE_BYTES) {
          return { id: crypto.randomUUID(), blob, width: canvas.width, height: canvas.height, name: file.name };
        }
      }
      scale *= 0.8;
    }
    throw new Error('Fotoğraf küçültülemedi. Daha küçük bir fotoğraf seçin.');
  } finally {
    canvas.width = 0;
    canvas.height = 0;
    image.src = '';
  }
}
