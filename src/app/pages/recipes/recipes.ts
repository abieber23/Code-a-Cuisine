import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecipeCard } from '../../components/recipe-card/recipe-card';
import { RecipeRequest } from '../../services/recipe-request';

@Component({
  selector: 'app-recipes',
  imports: [RouterLink, RecipeCard],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class Recipes {
  private readonly recipeRequest = inject(RecipeRequest);

  protected readonly recipes = this.recipeRequest.recipes;
  protected readonly generating = this.recipeRequest.generating;
  protected readonly error = this.recipeRequest.error;
}
