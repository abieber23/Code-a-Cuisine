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
  ingredients: string[];
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

const RECIPE_WEBHOOK_URL = 'http://localhost:5678/webhook/964ee35f-622c-4f81-bb8c-a4e39440ecca';

function toggled<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

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

  readonly ingredients = this.ingredientsState.asReadonly();
  readonly portions = this.portionsState.asReadonly();
  readonly cooks = this.cooksState.asReadonly();
  readonly cookingTime = this.cookingTimeState.asReadonly();
  readonly cuisine = this.cuisineState.asReadonly();
  readonly diet = this.dietState.asReadonly();
  readonly recipes = this.recipesState.asReadonly();
  readonly generating = this.generatingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  private nextIngredientId = 1;

  constructor(private readonly http: HttpClient) {}

  addIngredient(name: string, amount: number, unit: string): void {
    this.ingredientsState.update((list) => [{ id: this.nextIngredientId++, name, amount, unit }, ...list]);
  }

  updateIngredient(id: number, name: string, amount: number, unit: string): void {
    this.ingredientsState.update((list) =>
      list.map((ingredient) => (ingredient.id === id ? { ...ingredient, name, amount, unit } : ingredient)),
    );
  }

  removeIngredient(id: number): void {
    this.ingredientsState.update((list) => list.filter((ingredient) => ingredient.id !== id));
  }

  incPortions(): void {
    this.portionsState.update((value) => value + 1);
  }

  decPortions(): void {
    this.portionsState.update((value) => Math.max(1, value - 1));
  }

  incCooks(): void {
    this.cooksState.update((value) => value + 1);
  }

  decCooks(): void {
    this.cooksState.update((value) => Math.max(1, value - 1));
  }

  toggleCookingTime(value: CookingTime): void {
    this.cookingTimeState.update((current) => toggled(current, value));
  }

  toggleCuisine(value: Cuisine): void {
    this.cuisineState.update((current) => toggled(current, value));
  }

  toggleDiet(value: Diet): void {
    this.dietState.update((current) => toggled(current, value));
  }

  requestRecipes(): void {
    const ingredients = this.ingredientsState();
    const portions = this.portionsState();
    const cooks = this.cooksState();
    const cookingTime = [...this.cookingTimeState()];
    const cuisine = [...this.cuisineState()];
    const diet = [...this.dietState()];

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
          this.errorState.set('Unexpected response format from recipe generator.');
          return;
        }
        this.recipesState.set(response);
      },
      error: (err) => {
        this.generatingState.set(false);
        this.errorState.set('Recipe generation failed. Please try again.');
        console.error(err);
      },
    });
  }
}
