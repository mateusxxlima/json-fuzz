import type { ValidatorResult } from './validator-interface.js';

export interface DocumentValidationResult {
  document: unknown;
  validationResults: ValidatorResult[];
}

export interface ClassifiedDocuments {
  valid: unknown[];
  invalid: unknown[];
  conflict: unknown[];
}