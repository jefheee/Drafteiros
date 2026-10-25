/**
 * Utilitários de Compressão de Imagem Client-Side e Hashing Criptográfico
 * Reduz fotos de celulares/câmeras (4MB-10MB) para WebP otimizado (~80KB-140KB)
 * e gera hash SHA-256 para prevenir upload de súmulas duplicadas.
 */

/**
 * Converte e redimensiona qualquer imagem (PNG, JPEG, HEIC via canvas)
 * para WebP de alta fidelidade e baixo peso antes do upload.
 */
export async function compressImageToWebp(
  file: File,
  maxWidth = 1280,
  quality = 0.82
): Promise<File> {
  // Verificação de ambiente de navegador (SSR safe)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  // Se o arquivo já for um SVG ou áudio/vídeo, não redimensiona
  if (file.type.includes('svg') || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensiona proporcionalmente mantendo a proporção de aspecto
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Se não conseguir contexto 2D, retorna o arquivo original
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const cleanName = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '_');
            const compressedFile = new File([blob], `${cleanName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Calcula um fingerprint/hash rápido (SHA-256) a partir do conteúdo binário do arquivo
 * para impedir o reenvio do mesmo print em partidas diferentes.
 */
export async function computeImageHash(file: File | Blob): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    if (
      typeof window !== 'undefined' &&
      window.crypto &&
      window.crypto.subtle
    ) {
      const hashBuffer = await window.crypto.subtle.digest(
        'SHA-256',
        arrayBuffer
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback simples caso subtle crypto não esteja disponível
    const bytes = new Uint8Array(arrayBuffer);
    let hash = 0;
    for (let i = 0; i < Math.min(bytes.length, 10000); i++) {
      hash = (hash << 5) - hash + bytes[i];
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}_${file.size}`;
  } catch {
    return `hash_fallback_${Date.now()}_${file.size}`;
  }
}
