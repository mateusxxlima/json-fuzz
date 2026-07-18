import * as librarySchema from 'json-schema-library';
import type { IValidator, ValidatorResult } from '../interfaces/validator-interface.js';

const VALIDATOR_NAME = 'json-schema-library';

export class LibrarySchemaValidator implements IValidator {

  public validate(schema: any, document: any): ValidatorResult {
    const libraryValidate = librarySchema.compileSchema(schema);
    const { valid } = libraryValidate.validate(document);
    return {
      valid,
      validatorName: VALIDATOR_NAME
    };
  }
}