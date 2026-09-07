import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, timeout } from 'rxjs';

const LANGUAGE_TOOL_URL = 'https://api.languagetool.org/v2/check';
const REQUEST_TIMEOUT_MS = 6000;

interface LanguageToolMatch {
  type?: { typeName?: string };
}

interface LanguageToolResponse {
  matches: LanguageToolMatch[];
}

/** Checks ingredient names against the LanguageTool spellchecker for German and English. */
@Injectable({ providedIn: 'root' })
export class WordValidator {
  private readonly http = inject(HttpClient);

  /**
   * Resolves true if the word is spelled correctly in the given language. Fails open (resolves
   * true) on a network error or timeout so an unreachable service never blocks ingredient entry.
   */
  private isKnownInLanguage(word: string, language: 'en-US' | 'de-DE'): Observable<boolean> {
    const body = new HttpParams().set('text', word).set('language', language);

    return this.http.post<LanguageToolResponse>(LANGUAGE_TOOL_URL, body).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map((response) => !response.matches?.some((match) => match.type?.typeName === 'UnknownWord')),
      catchError(() => of(true)),
    );
  }

  /** Resolves true if the single given word is a known German or English word. */
  private isKnownWord(word: string): Observable<boolean> {
    return forkJoin([this.isKnownInLanguage(word, 'en-US'), this.isKnownInLanguage(word, 'de-DE')]).pipe(
      map(([en, de]) => en || de),
    );
  }

  /**
   * Resolves true if every word of the given phrase is a known German or English word.
   * An empty phrase resolves to false.
   */
  isValidPhrase(phrase: string): Observable<boolean> {
    const words = phrase.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      return of(false);
    }

    return forkJoin(words.map((word) => this.isKnownWord(word))).pipe(
      map((results) => results.every(Boolean)),
    );
  }
}
