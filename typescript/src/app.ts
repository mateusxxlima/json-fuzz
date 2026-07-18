import fs from 'node:fs';
import { parseDocs } from './utils/parser-util.js';
import { getTime } from './utils/app-util.js';
import type { ILLM } from './interfaces/llm-interface.js';
import type { IValidator, ValidatorResult } from './interfaces/validator-interface.js';
import type { IMetricsState, ISchemaState, IStateService } from './interfaces/state-interface.js';

export class App {

  constructor(
    private readonly llm: ILLM,
    private readonly validators: IValidator[],
    private readonly stateService: IStateService,
    private readonly schemasPath: string,
    private readonly totalDocsPerSchema: number,
    private readonly temperatures: number[],
  ) { }

  public async run(prompt: string): Promise<void> {
    const { generalMetrics } = this.stateService.state;

    while (true) {
      const schema = this.stateService.getNextSchema();
      if (!schema) break;
      if (!schema.metrics.startTime) schema.metrics.startTime = getTime().toISO();

      const { schemaName, metrics: { generatedDocuments } } = schema;
      const schemaContent = fs.readFileSync(`${this.schemasPath}/${schemaName}`, 'utf-8');

      let i = generatedDocuments;
      while (i < this.totalDocsPerSchema) {
        const temperature = this.getTemp(this.temperatures, i);

        const llmData = { schemaName, schemaContent, prompt, temperature };
        const llmResponse = await this.llm.generateDocs(llmData, schema, generalMetrics);

        if (!llmResponse) continue;

        const docs = parseDocs(llmResponse, schema, generalMetrics);
        if (!docs) {
          this.stateService.saveToDisk();
          continue;
        }

        await this.processDocs(schema, generalMetrics, JSON.parse(schemaContent), docs);
        i += docs.length;
      }
      schema.completed = true;
      schema.metrics.endTime = getTime().toISO();
      this.stateService.saveToDisk();
    }
    this.stateService.state.completed = true;
    this.stateService.state.generalMetrics.endTime = getTime().toISO();
    this.stateService.saveToDisk();
  }

  private async processDocs(schema: ISchemaState, generalMetrics: IMetricsState, schemaContent: string, docs: any[]): Promise<void> {
    for (let doc of docs) {
      const validationResults: ValidatorResult[] = [];

      for (const validator of this.validators) {
        const docsThatNeedBeArray = ['bigquery-table.json', 'pre-commit-hooks.json'];
        if (docsThatNeedBeArray.includes(schema.schemaName) && !(doc instanceof Array)) doc = [doc];
        const result = await validator.validate(schemaContent, doc);
        validationResults.push(result);
      }
      this.classifyAndSave(doc, validationResults, schema, generalMetrics);
    }
  }

  private async classifyAndSave(
    doc: any,
    validationResults: ValidatorResult[],
    schema: ISchemaState,
    generalMetrics: IMetricsState
  ): Promise<void> {
    const allValid = validationResults.every(result => result.valid);
    const allInvalid = validationResults.every(result => !result.valid);

    let directory: string;

    if (allValid) {
      schema.metrics.totalValidDocuments++;
      generalMetrics.totalValidDocuments++;
      directory = 'valid-docs';
    } else if (allInvalid) {
      schema.metrics.totalInvalidDocuments++;
      generalMetrics.totalInvalidDocuments++;
      directory = 'invalid-docs';
    } else {
      schema.metrics.totalConflictDocuments++;
      generalMetrics.totalConflictDocuments++;
      directory = 'conflict-docs';
    }

    const filePath = `${this.stateService.runPath}/${directory}/${schema.schemaName}.jsonl`;

    fs.appendFileSync(filePath, `${JSON.stringify(doc)}\n`, 'utf8');
    schema.metrics.generatedDocuments += 1;
    generalMetrics.generatedDocuments += 1;
    this.stateService.saveToDisk();
  }

  private getTemp(temperatures: number[], currentDocument: number): number {
    const docsPerTemperature = Math.ceil(this.totalDocsPerSchema / temperatures.length);

    const index = Math.min(
      Math.floor(currentDocument / docsPerTemperature),
      temperatures.length - 1,
    );

    return temperatures[index]!;
  }
}