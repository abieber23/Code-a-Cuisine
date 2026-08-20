import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipeCard } from '../../components/recipe-card/recipe-card';
import { RecipeRequest } from '../../services/recipe-request';

@Component({
  selector: 'app-recipe-detail',
  imports: [RouterLink, RecipeCard],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly recipeRequest = inject(RecipeRequest);

  private readonly index = Number(this.route.snapshot.paramMap.get('index'));

  protected readonly recipe = computed(() => this.recipeRequest.recipes()[this.index] ?? null);
}
