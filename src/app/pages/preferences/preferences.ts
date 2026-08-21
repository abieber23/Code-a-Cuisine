import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CookingTime, Cuisine, Diet, RecipeRequest } from '../../services/recipe-request';

@Component({
  selector: 'app-preferences',
  imports: [RouterLink],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
})
export class Preferences {
  private readonly recipeRequest = inject(RecipeRequest);
  private readonly router = inject(Router);

  protected readonly portions = this.recipeRequest.portions;
  protected readonly cooks = this.recipeRequest.cooks;
  protected readonly cookingTime = this.recipeRequest.cookingTime;
  protected readonly cuisine = this.recipeRequest.cuisine;
  protected readonly diet = this.recipeRequest.diet;

  protected readonly cuisineOptions: Cuisine[] = ['german', 'italian', 'indian', 'japanese', 'gourmet', 'fusion'];
  protected readonly cuisineLabels: Record<Cuisine, string> = {
    german: 'German',
    italian: 'Italian',
    indian: 'Indian',
    japanese: 'Japanese',
    gourmet: 'Gourmet',
    fusion: 'Fusion',
  };

  protected readonly dietOptions: Diet[] = ['vegetarian', 'vegan', 'keto', 'none'];
  protected readonly dietLabels: Record<Diet, string> = {
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    keto: 'Keto',
    none: 'No preferences',
  };

  /** Increments the portion count on the shared recipe request. */
  protected incPortions(): void {
    this.recipeRequest.incPortions();
  }

  /** Decrements the portion count on the shared recipe request. */
  protected decPortions(): void {
    this.recipeRequest.decPortions();
  }

  /** Increments the cook count on the shared recipe request. */
  protected incCooks(): void {
    this.recipeRequest.incCooks();
  }

  /** Decrements the cook count on the shared recipe request. */
  protected decCooks(): void {
    this.recipeRequest.decCooks();
  }

  /** Toggles the given cooking time preference on or off. */
  protected toggleCookingTime(value: CookingTime): void {
    this.recipeRequest.toggleCookingTime(value);
  }

  /** Toggles the given cuisine preference on or off. */
  protected toggleCuisine(value: Cuisine): void {
    this.recipeRequest.toggleCuisine(value);
  }

  /** Toggles the given diet preference on or off. */
  protected toggleDiet(value: Diet): void {
    this.recipeRequest.toggleDiet(value);
  }

  /** Triggers recipe generation and navigates to the recipes page. */
  protected generateRecipe(): void {
    this.recipeRequest.requestRecipes();
    this.router.navigate(['/recipes']);
  }
}
