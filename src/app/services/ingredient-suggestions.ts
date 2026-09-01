import { Injectable } from '@angular/core';
import foods from '../data/foods.json';

const SUGGESTION_LIMIT = 4;

@Injectable({ providedIn: 'root' })
export class IngredientSuggestions {
  private readonly foods: string[] = foods;

  /** Returns up to four food names from the local list that start with the given term. */
  search(term: string): string[] {
    const needle = term.toLowerCase();
    return this.foods.filter((food) => food.toLowerCase().startsWith(needle)).slice(0, SUGGESTION_LIMIT);
  }
}
