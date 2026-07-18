import { Ajv } from 'ajv';
import type { IValidator, ValidatorResult } from '../interfaces/validator-interface.js';

const VALIDATOR_NAME = 'Ajv';

export class AjvValidator implements IValidator {

  public validate(schema: any, document: any): ValidatorResult {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(document);
    return {
      valid,
      validatorName: VALIDATOR_NAME
    };
  }
}