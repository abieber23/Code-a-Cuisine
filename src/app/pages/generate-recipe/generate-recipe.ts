import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IngredientSuggestions } from '../../services/ingredient-suggestions';
import { Ingredient, RecipeRequest } from '../../services/recipe-request';
import { WordValidator } from '../../services/word-validator';

const MIN_SUGGESTION_LENGTH = 1;

@Component({
  selector: 'app-generate-recipe',
  imports: [FormsModule, RouterLink],
  templateUrl: './generate-recipe.html',
  styleUrl: './generate-recipe.scss',
})
export class GenerateRecipe {
  private readonly recipeRequest = inject(RecipeRequest);
  private readonly ingredientSuggestions = inject(IngredientSuggestions);
  private readonly wordValidator = inject(WordValidator);

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

  protected readonly nameSuggestions = signal<string[]>([]);
  protected readonly suggestionsOpen = signal(false);
  protected readonly activeSuggestionIndex = signal(-1);

  protected readonly editingId = signal<number | null>(null);
  protected draftName = '';
  protected draftAmount = 0;
  protected draftUnit = 'gram';

  protected readonly validating = signal(false);
  protected readonly nameError = signal<string | null>(null);

  /**
   * Validates the ingredient name against an online German/English dictionary, then adds it
   * to the shared request state and resets the form.
   */
  protected addIngredient(): void {
    const name = this.nameInput.trim();
    if (!name) {
      return;
    }

    this.validating.set(true);
    this.nameError.set(null);

    this.wordValidator.isValidPhrase(name).subscribe((valid) => {
      this.validating.set(false);

      if (!valid) {
        this.nameError.set('Please enter a valid Ingredient');
        return;
      }

      this.recipeRequest.addIngredient(name, this.amountInput, this.unitInput);

      this.nameInput = '';
      this.amountInput = 100;
      this.unitInput = 'gram';
      this.nameSuggestions.set([]);
      this.suggestionsOpen.set(false);
    });
  }

  /** Updates the ingredient name and looks up matching autocomplete suggestions for it. */
  protected onNameInput(value: string): void {
    this.nameInput = value;
    this.suggestionsOpen.set(true);
    this.activeSuggestionIndex.set(-1);
    this.nameError.set(null);

    const trimmed = value.trim();
    this.nameSuggestions.set(
      trimmed.length >= MIN_SUGGESTION_LENGTH ? this.ingredientSuggestions.search(trimmed) : [],
    );
  }

  /** Reopens the suggestion list on focus if there are suggestions from a previous query. */
  protected onNameFocus(): void {
    if (this.nameSuggestions().length) {
      this.suggestionsOpen.set(true);
    }
  }

  /** Closes the suggestion list, delayed so a click on a suggestion can register first. */
  protected onNameBlur(): void {
    setTimeout(() => this.suggestionsOpen.set(false), 150);
  }

  /** Moves the highlighted suggestion up/down and selects it on Enter, closes the list on Escape. */
  protected onNameKeydown(event: KeyboardEvent): void {
    const suggestions = this.nameSuggestions();
    if (!this.suggestionsOpen() || !suggestions.length) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeSuggestionIndex.update((index) => (index + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeSuggestionIndex.update((index) => (index - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        if (this.activeSuggestionIndex() >= 0) {
          event.preventDefault();
          this.selectSuggestion(suggestions[this.activeSuggestionIndex()]);
        }
        break;
      case 'Escape':
        this.suggestionsOpen.set(false);
        this.activeSuggestionIndex.set(-1);
        break;
    }
  }

  /** Fills the ingredient name from a chosen suggestion and closes the list. */
  protected selectSuggestion(name: string): void {
    this.nameInput = name;
    this.nameSuggestions.set([]);
    this.suggestionsOpen.set(false);
    this.activeSuggestionIndex.set(-1);
  }

  /** Loads the given ingredient's values into the draft fields to start editing it. */
  protected editIngredient(ingredient: Ingredient): void {
    this.editingId.set(ingredient.id);
    this.draftName = ingredient.name;
    this.draftAmount = ingredient.amount;
    this.draftUnit = ingredient.unit;
  }

  /** Persists the draft values for the given ingredient id and exits edit mode. */
  protected saveEdit(id: number): void {
    const name = this.draftName.trim();
    if (!name) {
      return;
    }

    this.recipeRequest.updateIngredient(id, name, this.draftAmount, this.draftUnit);
    this.editingId.set(null);
  }

  /** Removes the given ingredient and exits edit mode if it was the one being edited. */
  protected deleteIngredient(id: number): void {
    this.recipeRequest.removeIngredient(id);
    if (this.editingId() === id) {
      this.editingId.set(null);
    }
  }
}
