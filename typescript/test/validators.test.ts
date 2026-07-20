import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AjvValidator } from '../src/validators/ajv-validator.js';
import { ExodusValidator } from '../src/validators/exodus-validator.js';
import { LibrarySchemaValidator } from '../src/validators/library-schema-validator.js';
import { CfWorkerValidator } from '../src/validators/cf-worker-validator.js';
import { HyperjumpValidator } from '../src/validators/hyperjump-validator.js';

const schema = {
  $id: 'http://example.com/schemas/test-schema.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name', 'age']
};

const validDoc = { name: 'João', age: 30 };
const invalidDoc = { name: 'João' };

describe('AjvValidator', () => {
  const ajvValidator = new AjvValidator();

  test('AJV - valid document', () => {
    const result = ajvValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('AJV - invalid document', () => {
    const result = ajvValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
})

describe('ExodusValidator', () => {
  const exodusValidator = new ExodusValidator();

  test('Exodus - valid document', () => {
    const result = exodusValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('Exodus - invalid document', () => {
    const result = exodusValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
});

describe('LibrarySchemaValidator', () => {
  const librarySchemaValidator = new LibrarySchemaValidator();

  test('LibrarySchema - valid document', () => {
    const result = librarySchemaValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('LibrarySchema - invalid document', () => {
    const result = librarySchemaValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
});

describe('CfWorkerValidator', () => {
  const cfWorkerValidator = new CfWorkerValidator();

  test('CfWorker - valid document', () => {
    const result = cfWorkerValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('CfWorker - invalid document', () => {
    const result = cfWorkerValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
});

describe('HyperjumpValidator', () => {
  const hyperjumpValidator = new HyperjumpValidator();

  test('Hyperjump - valid document', async () => {
    const result = await hyperjumpValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('Hyperjump - invalid document', async () => {
    const result = await hyperjumpValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
});
