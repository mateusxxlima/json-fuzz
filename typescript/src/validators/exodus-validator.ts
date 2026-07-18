import exodus from '@exodus/schemasafe';
import type { IValidator, ValidatorResult } from '../interfaces/validator-interface.js';

const VALIDATOR_NAME = 'Exodus';

export class ExodusValidator implements IValidator {

  public validate(schema: any, document: any): ValidatorResult {
    const exodusValidate = exodus.validator(schema);
    const valid = exodusValidate(document);
    return {
      valid,
      validatorName: VALIDATOR_NAME
    };
  }
}