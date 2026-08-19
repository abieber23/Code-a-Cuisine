import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Ingredient, RecipeRequest } from '../../services/recipe-request';

@Component({
  selector: 'app-generate-recipe',
  imports: [FormsModule, RouterLink],
  templateUrl: './generate-recipe.html',
  styleUrl: './generate-recipe.scss',
})
export class GenerateRecipe {
  private readonly recipeRequest = inject(RecipeRequest);

  protected readonly unitLabels: Record<string, string> = {
    gram: 'g',
    kg: 'kg',
    oz: 'oz',
    lb: 'lb',
    ml: 'ml',
    pc: '',
  };

  protected readonly ingredients = this.recipeRequest.ingredients;

  protected nameInput = '';
  protected amountInput = 100;
  protected unitInput = 'gram';

  protected readonly editingId = signal<number | null>(null);
  protected draftName = '';
  protected draftAmount = 0;
  protected draftUnit = 'gram';

  protected addIngredient(): void {
    const name = this.nameInput.trim();
    if (!name) {
      return;
    }

    this.recipeRequest.addIngredient(name, this.amountInput, this.unitInput);

    this.nameInput = '';
    this.amountInput = 100;
    this.unitInput = 'gram';
  }

  protected editIngredient(ingredient: Ingredient): void {
    this.editingId.set(ingredient.id);
    this.draftName = ingredient.name;
    this.draftAmount = ingredient.amount;
    this.draftUnit = ingredient.unit;
  }

  protected saveEdit(id: number): void {
    const name = this.draftName.trim();
    if (!name) {
      return;
    }

    this.recipeRequest.updateIngredient(id, name, this.draftAmount, this.draftUnit);
    this.editingId.set(null);
  }

  protected deleteIngredient(id: number): void {
    this.recipeRequest.removeIngredient(id);
    if (this.editingId() === id) {
      this.editingId.set(null);
    }
  }
}
