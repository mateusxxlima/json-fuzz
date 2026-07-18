export type ValidatorResult = {
  valid: boolean,
  validatorName: string
};

export interface IValidator {
  validate(schema: any, document: any): Promise<ValidatorResult> | ValidatorResult;
}