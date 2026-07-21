import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

@Component({
  selector: 'app-generate-recipe',
  imports: [FormsModule],
  templateUrl: './generate-recipe.html',
  styleUrl: './generate-recipe.scss',
})
export class GenerateRecipe {
  protected readonly unitLabels: Record<string, string> = {
    gram: 'g',
    kg: 'kg',
    oz: 'oz',
    lb: 'lb',
    ml: 'ml',
    pc: '',
  };

  protected readonly ingredients = signal<Ingredient[]>([]);

  protected nameInput = '';
  protected amountInput = 100;
  protected unitInput = 'gram';

  protected readonly editingId = signal<number | null>(null);
  protected draftName = '';
  protected draftAmount = 0;
  protected draftUnit = 'gram';

  private nextId = 1;

  protected addIngredient(): void {
    const name = this.nameInput.trim();
    if (!name) {
      return;
    }

    this.ingredients.update((list) => [
      { id: this.nextId++, name, amount: this.amountInput, unit: this.unitInput },
      ...list,
    ]);

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

    this.ingredients.update((list) =>
      list.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, name, amount: this.draftAmount, unit: this.draftUnit }
          : ingredient,
      ),
    );
    this.editingId.set(null);
  }

  protected deleteIngredient(id: number): void {
    this.ingredients.update((list) => list.filter((ingredient) => ingredient.id !== id));
    if (this.editingId() === id) {
      this.editingId.set(null);
    }
  }
}
