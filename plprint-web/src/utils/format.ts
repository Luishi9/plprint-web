// Construye la URL completa de una imagen de producto.
// En desarrollo el proxy de Vite reenvía /uploads → backend.
// En producción (Netlify) hay que prefijar con la URL base del API.
export const getImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_URL ?? '';
  // VITE_API_URL termina en /api/v1 — subimos al origen
  const origin = base.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url}`;
};
