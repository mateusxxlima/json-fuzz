import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AjvValidator } from '../validators/ajv-validator.js';
import { ExodusValidator } from '../validators/exodus-validator.js';
import { LibrarySchemaValidator } from '../validators/library-schema-validator.js';
import { CfWorkerValidator } from '../validators/cf-worker-validator.js';
import { HyperjumpValidator } from '../validators/hyperjump-validator.js';

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

beforeEach(() => {
  // Reset any state or setup needed before each test

});

describe('AjvValidator', () => {
  const ajvValidator = new AjvValidator();

  test('AJV - valid document', () => {
    const validDoc = { name: 'João', age: 30 };
    const result = ajvValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('AJV - invalid document', () => {
    const invalidDoc = { name: 'João' };
    const result = ajvValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
})

describe('ExodusValidator', () => {
  test('Exodus - valid document', () => {
    const exodusValidator = new ExodusValidator();
    const validDoc = { name: 'João', age: 30 };
    const result = exodusValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('Exodus - invalid document', () => {
    const exodusValidator = new ExodusValidator();
    const invalidDoc = { name: 'João' };
    const result = exodusValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
});

describe('LibrarySchemaValidator', () => {
  test('LibrarySchema - valid document', () => {
    const librarySchemaValidator = new LibrarySchemaValidator();
    const validDoc = { name: 'João', age: 30 };
    const result = librarySchemaValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('LibrarySchema - invalid document', () => {
    const librarySchemaValidator = new LibrarySchemaValidator();
    const invalidDoc = { name: 'João' };
    const result = librarySchemaValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
});

describe('CfWorkerValidator', () => {
  test('CfWorker - valid document', () => {
    const cfWorkerValidator = new CfWorkerValidator();
    const validDoc = { name: 'João', age: 30 };
    const result = cfWorkerValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('CfWorker - invalid document', () => {
    const cfWorkerValidator = new CfWorkerValidator();
    const invalidDoc = { name: 'João' };
    const result = cfWorkerValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
});

describe('HyperjumpValidator', () => {
  const hyperjumpValidator = new HyperjumpValidator();

  test('Hyperjump - valid document', async () => {
    const validDoc = { name: 'João', age: 30 };
    const result = await hyperjumpValidator.validate(schema, validDoc);
    assert.strictEqual(result.valid, true);
  });

  test('Hyperjump - invalid document', async () => {
    const invalidDoc = { name: 'João' };
    const result = await hyperjumpValidator.validate(schema, invalidDoc);
    assert.strictEqual(result.valid, false);
  });
});
