import { Routes } from '@angular/router';
import { Start } from './pages/start/start';
import { GenerateRecipe } from './pages/generate-recipe/generate-recipe';

export const routes: Routes = [
  { path: '', component: Start },
  { path: 'generate-recipe', component: GenerateRecipe },
];
