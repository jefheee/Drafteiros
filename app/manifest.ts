import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Drafteiros',
    short_name: 'Drafteiros',
    description: 'Plataforma oficial de campeonatos, draft, súmula por IA e gestão de elencos',
    start_url: '/login',
    display: 'standalone',
    background_color: '#0D0D0F',
    theme_color: '#0D0D0F',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-icon-512x512.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
  };
}
