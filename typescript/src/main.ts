import { App } from './app.js';
import { GptService } from './services/gpt-service.js';
import { getPrompt } from './utils/prompt-util.js';

import { ExodusValidator } from './validators/exodus-validator.js';
import { AjvValidator } from './validators/ajv-validator.js';
import { LibrarySchemaValidator } from './validators/library-schema-validator.js';
import { CfWorkerValidator } from './validators/cf-worker-validator.js';
import { HyperjumpValidator } from './validators/hyperjump-validator.js';
import { StateService } from './services/state-service.js';

const DATA_PATH = process.cwd() + '/../generated-data';
const SCHEMAS_PATH = process.cwd() + '/../schemas';
const LLM_MODEL = 'gpt-4o-mini';
const DOCS_GENERATED_PER_BATCH = 100;
const TOTAL_DOCS_PER_SCHEMA = 10_000;
const TEMPERATURES = [0.4, 0.6, 0.8, 1.0, 1.2];

const gptService = new GptService(LLM_MODEL);
const state = new StateService(SCHEMAS_PATH, DATA_PATH);

const validators = [
  new ExodusValidator(),
  new AjvValidator(),
  new LibrarySchemaValidator(),
  new CfWorkerValidator(),
  new HyperjumpValidator(),
];

const app = new App(
  gptService,
  validators,
  state,
  SCHEMAS_PATH,
  TOTAL_DOCS_PER_SCHEMA,
  TEMPERATURES
);

const prompt = getPrompt(DOCS_GENERATED_PER_BATCH);

await app.run(prompt);

