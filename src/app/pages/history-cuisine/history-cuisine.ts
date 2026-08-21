import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Cuisine } from '../../services/recipe-request';
import { SavedRecipe, SavedRecipes } from '../../services/saved-recipes';

@Component({
  selector: 'app-history-cuisine',
  imports: [RouterLink],
  templateUrl: './history-cuisine.html',
  styleUrl: './history-cuisine.scss',
})
export class HistoryCuisine {
  private readonly route = inject(ActivatedRoute);
  private readonly savedRecipes = inject(SavedRecipes);

  protected readonly pageSize = 15;

  protected readonly cuisine = signal<Cuisine | null>(
    this.route.snapshot.paramMap.get('cuisine') as Cuisine | null,
  );
  protected readonly recipes = signal<SavedRecipe[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly currentPage = signal(1);

  protected readonly filtered = computed(() =>
    this.recipes().filter((recipe) => recipe.cuisine === this.cuisine()),
  );

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly pagedRecipes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected readonly pageNumbers = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }
    return [1, 2, 3, null, total];
  });

  /** Loads all saved recipes on init so they can be filtered down to this page's cuisine. */
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

  /** Jumps directly to the given page number. */
  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }

  /** Moves to the previous page, clamped to page 1. */
  protected prevPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  /** Moves to the next page, clamped to the last page. */
  protected nextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }
}
