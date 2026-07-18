import * as cfworker from '@cfworker/json-schema';
import type { IValidator, ValidatorResult } from '../interfaces/validator-interface.js';

const VALIDATOR_NAME = 'cf-worker';
const SCHEMA_DRAFT = '7';

export class CfWorkerValidator implements IValidator {

  public validate(schema: any, document: any): ValidatorResult {
    const cfworkerValidator = new cfworker.Validator(schema, SCHEMA_DRAFT);
    const { valid } = cfworkerValidator.validate(document);
    return {
      valid,
      validatorName: VALIDATOR_NAME
    };
  }
}