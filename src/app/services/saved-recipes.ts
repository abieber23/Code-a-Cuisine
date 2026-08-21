import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { from, map, Observable } from 'rxjs';
import { GeneratedRecipe } from './recipe-request';

export interface SavedRecipe extends GeneratedRecipe {
  id: string;
  created_at: string;
}

const SUPABASE_URL = 'https://jwtwrbjmlhrfakuenllb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dHdyYmptbGhyZmFrdWVubGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjY0MTQsImV4cCI6MjEwMTk0MjQxNH0.HK1mqfQggV9kqYY2keaxngL27uhZ0H4S4IfojUCsjBs';

@Injectable({ providedIn: 'root' })
export class SavedRecipes {
  private readonly client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /** Fetches all saved recipes, most recently created first. */
  list(): Observable<SavedRecipe[]> {
    return from(
      this.client.from('recipes').select('*').order('created_at', { ascending: false }),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data ?? []) as SavedRecipe[];
      }),
    );
  }

  /** Fetches a single saved recipe by id, or null if it doesn't exist. */
  getById(id: string): Observable<SavedRecipe | null> {
    return from(this.client.from('recipes').select('*').eq('id', id).maybeSingle()).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data as SavedRecipe | null) ?? null;
      }),
    );
  }

  /** Increments and persists the like count for the given recipe, returning the new total. */
  incrementLikes(id: string, currentLikes: number): Observable<number> {
    const likes = currentLikes + 1;
    return from(this.client.from('recipes').update({ likes }).eq('id', id)).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
        return likes;
      }),
    );
  }
}
