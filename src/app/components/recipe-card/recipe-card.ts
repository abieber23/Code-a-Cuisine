import { Component, computed, inject, input, signal } from '@angular/core';
import { GeneratedRecipe } from '../../services/recipe-request';
import { SavedRecipes } from '../../services/saved-recipes';

@Component({
  selector: 'app-recipe-card',
  imports: [],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard {
  private readonly savedRecipes = inject(SavedRecipes);

  readonly recipe = input.required<GeneratedRecipe>();

  protected readonly liked = signal(false);
  protected readonly liking = signal(false);
  private readonly likeOverride = signal<number | null>(null);

  protected readonly savedId = computed(() => (this.recipe() as { id?: string }).id ?? null);
  protected readonly likeCount = computed(() => this.likeOverride() ?? this.recipe().likes ?? 0);

  /** Extra ingredients the generator added; empty for older recipes without the field. */
  protected readonly extraIngredients = computed(() => this.recipe().extraIngredients ?? []);

  /** Collapse state for the ingredients / directions sections (only used below 650px). */
  protected readonly ingredientsOpen = signal(true);
  protected readonly directionsOpen = signal(true);

  protected toggleIngredients(): void {
    this.ingredientsOpen.update((open) => !open);
  }

  protected toggleDirections(): void {
    this.directionsOpen.update((open) => !open);
  }

  protected readonly cookNumbers = computed(() =>
    Array.from({ length: Math.max(1, this.recipe().cooks) }, (_, index) => index + 1),
  );

  /** Returns which cook (1-based) is responsible for the given step index, cycling through the cook count. */
  protected chefForStep(stepIndex: number): number {
    const cooks = Math.max(1, this.recipe().cooks);
    return (stepIndex % cooks) + 1;
  }

  /** Likes the recipe once. Persists via the SavedRecipes service for saved recipes, or just updates locally for a freshly generated one that hasn't been saved yet. */
  giveHeart(): void {
    if (this.liked() || this.liking()) {
      return;
    }

    const id = this.savedId();
    if (!id) {
      this.liked.set(true);
      this.likeOverride.set(this.likeCount() + 1);
      return;
    }

    this.liking.set(true);
    this.savedRecipes.incrementLikes(id, this.likeCount()).subscribe({
      next: (newCount) => {
        this.liking.set(false);
        this.liked.set(true);
        this.likeOverride.set(newCount);
      },
      error: (err) => {
        this.liking.set(false);
        console.error(err);
      },
    });
  }
}
