# Cuisine

Cuisine is an Angular web app that generates recipe suggestions from ingredients you already have. You list your ingredients, set a few preferences (portions, cook count, cooking time, cuisine, diet), and the app sends the request off to a recipe-generation backend.

## Tech stack

- [Angular 20](https://angular.dev/) — standalone components (no NgModules)
- Server-side rendering via `@angular/ssr`
- Plain hand-written SCSS per page (no CSS framework)

## User flow

1. **Start** (`/`) — landing page.
2. **Generate Recipe** (`/generate-recipe`) — enter ingredients (name, amount, unit).
3. **Preferences** (`/preferences`) — choose portions, cook count, and cooking time / cuisine / diet preferences, then trigger recipe generation.

Shared state (ingredients and preferences) lives in a single `RecipeRequest` service so it survives navigation between pages.

## Getting started

```bash
npm install
npm start          # ng serve — dev server at http://localhost:4200, auto-reloads
```

### Other commands

```bash
ng build                                        # production build, output to dist/
ng build --watch --configuration development    # incremental dev build
ng test                                         # Karma/Jasmine unit tests
ng test --include=**/preferences.spec.ts        # run a single spec file
npm run serve:ssr:Cuisine                       # run the built SSR server
```

There is no e2e test setup and no lint script configured.

## Backend integration

`RecipeRequest.generateRecipes()` posts the bundled ingredients and preferences as JSON to an n8n webhook URL (`RECIPE_WEBHOOK_URL` in `src/app/services/recipe-request.ts`) and expects a `GeneratedRecipe[]` response. This endpoint is a placeholder until the n8n workflow is live.
