import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

export type CookingTime = 'quick' | 'medium' | 'complex';
export type Cuisine = 'german' | 'italian' | 'indian' | 'japanese' | 'gourmet' | 'fusion';
export type Diet = 'vegetarian' | 'vegan' | 'keto' | 'none';

export interface GeneratedRecipe {
  title?: string;
  description: string;
  /** Ingredients the user supplied themselves. */
  ingredients: string[];
  /** Ingredients the recipe generator added on top of the user's list. */
  extraIngredients?: string[];
  steps: string[];
  calories: number;
  fats: number;
  carbs: number;
  protein: number;
  portions: number;
  cooks: number;
  cookingTime: CookingTime;
  cuisine: Cuisine;
  diet: Diet;
  likes?: number;
}

interface RecipeRequestPayload {
  ingredients: Ingredient[];
  portions: number;
  cooks: number;
  cookingTime: CookingTime[];
  cuisine: Cuisine[];
  diet: Diet[];
  prompt: string;
}

/** The preference selections that were actually sent with the last recipe request. */
export interface SubmittedPreferences {
  cookingTime: CookingTime[];
  cuisine: Cuisine[];
  diet: Diet[];
}

const RECIPE_WEBHOOK_URL = 'https://adrian123.app.n8n.cloud/webhook/964ee35f-622c-4f81-bb8c-a4e39440ecca';

/** Upper bound for the portion count on the preferences page. */
export const MAX_PORTIONS = 10;
/** Upper bound for the cook count on the preferences page. */
export const MAX_COOKS = 4;

/**
 * Returns a set containing only the given value, enforcing single-select within a preference
 * group. Clicking the already-selected value clears the selection instead.
 */
function selectSingle<T>(set: Set<T>, value: T): Set<T> {
  return set.has(value) ? new Set<T>() : new Set<T>([value]);
}

/** Builds the free-text prompt sent to the recipe generator from the current request state. */
function buildPromptText(
  portions: number,
  cooks: number,
  ingredients: Ingredient[],
  cookingTime: CookingTime[],
  cuisine: Cuisine[],
  diet: Diet[],
): string {
  const ingredientList = ingredients.length
    ? ingredients.map((ingredient) => `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`).join(', ')
    : 'no specific ingredients';

  return [
    `Portions: ${portions}`,
    `Number of cooks: ${cooks}`,
    `Available ingredients: ${ingredientList}`,
    `Preferred cooking time: ${cookingTime.length ? cookingTime.join(', ') : 'no preference'}`,
    `Preferred cuisine: ${cuisine.length ? cuisine.join(', ') : 'no preference'}`,
    `Dietary preference: ${diet.length ? diet.join(', ') : 'no preference'}`,
  ].join('\n');
}

@Injectable({ providedIn: 'root' })
export class RecipeRequest {
  private readonly ingredientsState = signal<Ingredient[]>([]);
  private readonly portionsState = signal(2);
  private readonly cooksState = signal(1);
  private readonly cookingTimeState = signal<Set<CookingTime>>(new Set());
  private readonly cuisineState = signal<Set<Cuisine>>(new Set());
  private readonly dietState = signal<Set<Diet>>(new Set());
  private readonly recipesState = signal<GeneratedRecipe[]>([]);
  private readonly generatingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly submittedPreferencesState = signal<SubmittedPreferences | null>(null);

  readonly ingredients = this.ingredientsState.asReadonly();
  readonly portions = this.portionsState.asReadonly();
  readonly cooks = this.cooksState.asReadonly();
  readonly cookingTime = this.cookingTimeState.asReadonly();
  readonly cuisine = this.cuisineState.asReadonly();
  readonly diet = this.dietState.asReadonly();
  readonly recipes = this.recipesState.asReadonly();
  readonly generating = this.generatingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  /**
   * Snapshot of the preferences sent with the last request. Kept separate from the live
   * selection signals so the recipes page can still show them after the preferences page
   * (and its selection) has been destroyed.
   */
  readonly submittedPreferences = this.submittedPreferencesState.asReadonly();

  private nextIngredientId = 1;

  /** Creates the service with the HTTP client used to call the recipe generation webhook. */
  constructor(private readonly http: HttpClient) {}

  /** Adds a new ingredient with a fresh id to the front of the ingredient list. */
  addIngredient(name: string, amount: number, unit: string): void {
    this.ingredientsState.update((list) => [{ id: this.nextIngredientId++, name, amount, unit }, ...list]);
  }

  /** Replaces the name, amount and unit of the ingredient with the given id. */
  updateIngredient(id: number, name: string, amount: number, unit: string): void {
    this.ingredientsState.update((list) =>
      list.map((ingredient) => (ingredient.id === id ? { ...ingredient, name, amount, unit } : ingredient)),
    );
  }

  /** Removes the ingredient with the given id from the list. */
  removeIngredient(id: number): void {
    this.ingredientsState.update((list) => list.filter((ingredient) => ingredient.id !== id));
  }

  /** Clears the ingredient list. */
  clearIngredients(): void {
    this.ingredientsState.set([]);
  }

  /** Increments the portion count by one, never going above MAX_PORTIONS. */
  incPortions(): void {
    this.portionsState.update((value) => Math.min(MAX_PORTIONS, value + 1));
  }

  /** Decrements the portion count by one, never going below 1. */
  decPortions(): void {
    this.portionsState.update((value) => Math.max(1, value - 1));
  }

  /** Increments the cook count by one, never going above MAX_COOKS. */
  incCooks(): void {
    this.cooksState.update((value) => Math.min(MAX_COOKS, value + 1));
  }

  /** Decrements the cook count by one, never going below 1. */
  decCooks(): void {
    this.cooksState.update((value) => Math.max(1, value - 1));
  }

  /** Selects the given cooking time value, replacing any previous selection in the group. */
  toggleCookingTime(value: CookingTime): void {
    this.cookingTimeState.update((current) => selectSingle(current, value));
  }

  /** Selects the given cuisine value, replacing any previous selection in the group. */
  toggleCuisine(value: Cuisine): void {
    this.cuisineState.update((current) => selectSingle(current, value));
  }

  /** Selects the given diet value, replacing any previous selection in the group. */
  toggleDiet(value: Diet): void {
    this.dietState.update((current) => selectSingle(current, value));
  }

  /** Resets portions, cooks and all multi-select preferences back to their defaults. */
  resetPreferences(): void {
    this.portionsState.set(2);
    this.cooksState.set(1);
    this.cookingTimeState.set(new Set());
    this.cuisineState.set(new Set());
    this.dietState.set(new Set());
  }

  /** Posts the current ingredients and preferences to the recipe webhook and stores the result. */
  requestRecipes(): void {
    const ingredients = this.ingredientsState();
    const portions = this.portionsState();
    const cooks = this.cooksState();
    const cookingTime = [...this.cookingTimeState()];
    const cuisine = [...this.cuisineState()];
    const diet = [...this.dietState()];

    this.submittedPreferencesState.set({ cookingTime, cuisine, diet });

    const payload: RecipeRequestPayload = {
      ingredients,
      portions,
      cooks,
      cookingTime,
      cuisine,
      diet,
      prompt: buildPromptText(portions, cooks, ingredients, cookingTime, cuisine, diet),
    };

    this.generatingState.set(true);
    this.errorState.set(null);

    this.http.post<GeneratedRecipe[] | null>(RECIPE_WEBHOOK_URL, payload).subscribe({
      next: (response) => {
        this.generatingState.set(false);
        if (!Array.isArray(response)) {
          this.errorState.set('Ups! Something went wrong, please try again.');
          return;
        }
        this.recipesState.set(response);
        this.ingredientsState.set([]);
      },
      error: (err) => {
        this.generatingState.set(false);
        this.errorState.set('Recipe generation failed. Please try again.');
        console.error(err);
      },
    });
  }
}
