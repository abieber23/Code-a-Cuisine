import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecipeRequest } from '../../services/recipe-request';

@Component({
  selector: 'app-start',
  imports: [RouterLink],
  templateUrl: './start.html',
  styleUrl: './start.scss',
})
export class Start {
  private readonly recipeRequest = inject(RecipeRequest);

  constructor() {
    this.recipeRequest.clearIngredients();
  }
}
