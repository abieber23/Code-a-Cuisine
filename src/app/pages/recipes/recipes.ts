import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cuisine, CookingTime, Diet, RecipeRequest } from '../../services/recipe-request';

const cuisineLabels: Record<Cuisine, string> = {
  german: 'German',
  italian: 'Italian',
  indian: 'Indian',
  japanese: 'Japanese',
  gourmet: 'Gourmet',
  fusion: 'Fusion',
};

const cookingTimeLabels: Record<CookingTime, string> = {
  quick: 'Quick',
  medium: 'Medium',
  complex: 'Complex',
};

const dietLabels: Record<Diet, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  keto: 'Keto',
  none: '',
};

@Component({
  selector: 'app-recipes',
  imports: [RouterLink],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class Recipes {
  private readonly recipeRequest = inject(RecipeRequest);

  protected readonly recipes = this.recipeRequest.recipes;
  protected readonly generating = this.recipeRequest.generating;
  protected readonly error = this.recipeRequest.error;

  /**
   * Badges reflecting the preferences that were actually submitted with this request.
   * Reads the service snapshot rather than the live selection signals, which the
   * preferences page clears on destroy.
   */
  protected readonly preferenceBadges = computed(() => {
    const submitted = this.recipeRequest.submittedPreferences();
    if (!submitted) {
      return [];
    }

    return [
      ...submitted.cuisine.map((value) => cuisineLabels[value]),
      ...submitted.cookingTime.map((value) => cookingTimeLabels[value]),
      ...submitted.diet.map((value) => dietLabels[value]),
    ].filter((label) => label.length > 0);
  });
}
