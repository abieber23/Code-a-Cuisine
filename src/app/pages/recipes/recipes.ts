import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cuisine, CookingTime, RecipeRequest } from '../../services/recipe-request';

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

  protected readonly preferenceBadges = computed(() => [
    ...[...this.recipeRequest.cuisine()].map((value) => cuisineLabels[value]),
    ...[...this.recipeRequest.cookingTime()].map((value) => cookingTimeLabels[value]),
  ]);
}
