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

  protected incPortions(): void {
    this.recipeRequest.incPortions();
  }

  protected decPortions(): void {
    this.recipeRequest.decPortions();
  }

  protected incCooks(): void {
    this.recipeRequest.incCooks();
  }

  protected decCooks(): void {
    this.recipeRequest.decCooks();
  }

  protected toggleCookingTime(value: CookingTime): void {
    this.recipeRequest.toggleCookingTime(value);
  }

  protected toggleCuisine(value: Cuisine): void {
    this.recipeRequest.toggleCuisine(value);
  }

  protected toggleDiet(value: Diet): void {
    this.recipeRequest.toggleDiet(value);
  }

  protected generateRecipe(): void {
    this.recipeRequest.requestRecipes();
    this.router.navigate(['/recipes']);
  }
}
