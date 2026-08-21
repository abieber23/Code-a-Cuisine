import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipeCard } from '../../components/recipe-card/recipe-card';
import { SavedRecipe, SavedRecipes } from '../../services/saved-recipes';

@Component({
  selector: 'app-history-detail',
  imports: [RouterLink, RecipeCard],
  templateUrl: './history-detail.html',
  styleUrl: './history-detail.scss',
})
export class HistoryDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly savedRecipes = inject(SavedRecipes);

  protected readonly recipe = signal<SavedRecipe | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  /** Loads the saved recipe matching the route's id param, if one is present. */
  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.error.set('No recipe id given.');
      return;
    }

    this.savedRecipes.getById(id).subscribe({
      next: (recipe) => {
        this.loading.set(false);
        this.recipe.set(recipe);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Could not load this recipe.');
        console.error(err);
      },
    });
  }
}
