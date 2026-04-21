export type CategoryKey = 'love' | 'career' | 'money' | 'health' | 'general';

export interface Category {
  label: string;
  keys: string[];
}

export type CategoryMap = Record<CategoryKey, Category>;
