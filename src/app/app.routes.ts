import { Routes } from '@angular/router';
import { Start } from './pages/start/start';
import { GenerateRecipe } from './pages/generate-recipe/generate-recipe';
import { Preferences } from './pages/preferences/preferences';
import { Recipes } from './pages/recipes/recipes';
import { History } from './pages/history/history';
import { HistoryCuisine } from './pages/history-cuisine/history-cuisine';
import { HistoryDetail } from './pages/history-detail/history-detail';

export const routes: Routes = [
  { path: '', component: Start },
  { path: 'generate-recipe', component: GenerateRecipe },
  { path: 'preferences', component: Preferences },
  { path: 'recipes', component: Recipes },
  { path: 'history', component: History },
  { path: 'history/cuisine/:cuisine', component: HistoryCuisine },
  { path: 'history/:id', component: HistoryDetail },
];
