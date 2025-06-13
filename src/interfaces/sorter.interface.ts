import { ImportDeclaration } from '@typescript-eslint/types/dist/generated/ast-spec';

export interface SortResult {
  imports: ImportDeclaration[];
  hasNewline: boolean;
}

export type SortFunction = (
  imports: ImportDeclaration[],
  options: { lengthTarget?: 'from' | 'full' }
) => SortResult;
