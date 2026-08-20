import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'recipes/:index',
    renderMode: RenderMode.Client
  },
  {
    path: 'history',
    renderMode: RenderMode.Client
  },
  {
    path: 'history/cuisine/:cuisine',
    renderMode: RenderMode.Client
  },
  {
    path: 'history/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
