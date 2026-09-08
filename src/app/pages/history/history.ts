import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cuisine } from '../../services/recipe-request';
import { SavedRecipe, SavedRecipes } from '../../services/saved-recipes';

interface CuisineTile {
  cuisine: Cuisine;
  label: string;
  icon: string;
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
    { cuisine: 'italian', label: 'Italian cuisine', icon: 'img/Italian_cuisine_icon.png', image: 'img/cookbookPage/italian_cuisine.png' },
    { cuisine: 'german', label: 'German cuisine', icon: 'img/German_cuisine_icon.png', image: 'img/cookbookPage/german_cuisine.png' },
    { cuisine: 'japanese', label: 'Japanese cuisine', icon: 'img/Japanese_cuisine_icon.png', image: 'img/cookbookPage/japanese_cuisine.png' },
    { cuisine: 'gourmet', label: 'Gourmet cuisine', icon: 'img/Gourmet_cuisine_icon.png', image: 'img/cookbookPage/gourmet_cuisine.png' },
    { cuisine: 'indian', label: 'Indian cuisine', icon: 'img/Indian_cuisine_icon.png', image: 'img/cookbookPage/indian_cuisine.png' },
    { cuisine: 'fusion', label: 'Fusion cuisine', icon: 'img/Fusion_cuisine_icon.png', image: 'img/cookbookPage/fusion_cuisine.png' },
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
