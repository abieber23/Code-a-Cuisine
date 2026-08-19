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

  protected readonly cookNumbers = computed(() =>
    Array.from({ length: Math.max(1, this.recipe().cooks) }, (_, index) => index + 1),
  );

  protected chefForStep(stepIndex: number): number {
    const cooks = Math.max(1, this.recipe().cooks);
    return (stepIndex % cooks) + 1;
  }

  giveHeart(): void {
    const id = this.savedId();
    if (!id || this.liked() || this.liking()) {
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
