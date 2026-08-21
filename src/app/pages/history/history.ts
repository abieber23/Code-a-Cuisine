import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cuisine } from '../../services/recipe-request';
import { SavedRecipe, SavedRecipes } from '../../services/saved-recipes';

interface CuisineTile {
  cuisine: Cuisine;
  label: string;
  emoji: string;
  image: string;
}

@Component({
  selector: 'app-history',
  imports: [RouterLink],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {
  private readonly savedRecipes = inject(SavedRecipes);

  protected readonly recipes = signal<SavedRecipe[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly mostLiked = computed(() =>
    [...this.recipes()]
      .filter((recipe) => (recipe.likes ?? 0) > 0)
      .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      .slice(0, 6),
  );

  protected readonly cuisineTiles: CuisineTile[] = [
    { cuisine: 'italian', label: 'Italian cuisine', emoji: '🤌', image: 'img/cookbookPage/italian_cuisine.png' },
    { cuisine: 'german', label: 'German cuisine', emoji: '🥨', image: 'img/cookbookPage/german_cuisine.png' },
    { cuisine: 'japanese', label: 'Japanese cuisine', emoji: '🍣', image: 'img/cookbookPage/japanese_cuisine.png' },
    { cuisine: 'gourmet', label: 'Gourmet cuisine', emoji: '✨', image: 'img/cookbookPage/gourmet_cuisine.png' },
    { cuisine: 'indian', label: 'Indian cuisine', emoji: '🫓', image: 'img/cookbookPage/indian_cuisine.png' },
    { cuisine: 'fusion', label: 'Fusion cuisine', emoji: '🍱', image: 'img/cookbookPage/fusion_cuisine.png' },
  ];

  /** Loads all saved recipes on init to populate the cookbook overview. */
  constructor() {
    this.savedRecipes.list().subscribe({
      next: (recipes) => {
        this.loading.set(false);
        this.recipes.set(recipes);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Could not load saved recipes.');
        console.error(err);
      },
    });
  }
}
