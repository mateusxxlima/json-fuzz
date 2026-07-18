import * as Hyperjump from '@hyperjump/json-schema/draft-07';
import type { IValidator, ValidatorResult } from '../interfaces/validator-interface.js';

const VALIDATOR_NAME = 'Hyperjump';

export class HyperjumpValidator implements IValidator {
  private readonly registeredSchemas = new Set<string>();

  public async validate(schema: any, document: any): Promise<ValidatorResult> {
    const id = schema.$id as string;
    if (!this.registeredSchemas.has(id)) {
      Hyperjump.registerSchema(schema as any, id);
      this.registeredSchemas.add(id);
    }
    const hyperjumpValidate = await Hyperjump.validate(id);
    const { valid } = hyperjumpValidate(document);
    return {
      valid,
      validatorName: VALIDATOR_NAME
    };
  }
}