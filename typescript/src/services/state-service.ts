import fs from 'fs';
import type { IMetricsState, ISchemaState, IState, IStateService } from '../interfaces/state-interface.js';
import { getTime } from '../utils/app-util.js';

export class StateService implements IStateService {

  public state: IState;
  public dataPath: string;
  public runPath: string = '';
  public fileStatePath: string = '';
  public fileStateName: string = 'run-state-metrics.json'
  public runId: number = 1;
  public runPrefix: string = 'run-';

  constructor(schemasPath: string, dataPath: string) {
    this.dataPath = dataPath;
    this.state = this.load(schemasPath);
    this.saveToDisk()
  }

  load(schemasPath: string): IState {
    const schemas = fs.readdirSync(schemasPath);
    const lastRun = this.getLastRun();

    if (!lastRun || lastRun.completed) {
      const runNumber = lastRun?.completed ? this.runId + 1 : this.runId;
      this.runPath = `${this.dataPath}/${this.runPrefix}${runNumber}`;
      this.fileStatePath = `${this.runPath}/${this.fileStateName}`;
      const newRun = this.createNewRun(schemas);
      return newRun;
    }

    return lastRun;
  }

  createNewRun(schemaNames: string[]): IState {
    [
      this.runPath,
      `${this.runPath}/valid-docs`,
      `${this.runPath}/invalid-docs`,
      `${this.runPath}/conflict-docs`,
    ].forEach(directory =>
      fs.mkdirSync(directory, { recursive: true }),
    );

    const stateContent = {
      completed: false,
      schemas: schemaNames.map(schemaName => ({
        schemaName,
        completed: false,
        metrics: this.getMetrics()
      })),
      generalMetrics: this.getMetrics()
    }

    stateContent.generalMetrics.startTime = getTime().toISO();

    return stateContent;
  }

  getMetrics(): IMetricsState {
    return {
      startTime: null,
      endTime: null,
      totalRequestsMadeToLLM: 0,
      totalParseableJsonResponses: 0,
      totalUnparseableJsonResponses: 0,
      generatedDocuments: 0,
      totalValidDocuments: 0,
      totalInvalidDocuments: 0,
      totalConflictDocuments: 0,
      maxGeneratedDocumentsPerBatch: 0,
      minGeneratedDocumentsPerBatch: Number.MAX_SAFE_INTEGER,
      maxLLMResponseTimeMinutes: 0,
    }
  }

  getLastRun(): IState | null {
    const runs = fs
      .readdirSync(this.dataPath)
      .filter(dir => dir.startsWith(this.runPrefix));

    if (runs.length === 0) return null;

    const lastRunId = runs.sort().pop()!;
    this.runId = parseInt(lastRunId.replace(this.runPrefix, ''));
    this.runPath = `${this.dataPath}/${this.runPrefix}${this.runId}`;
    this.fileStatePath = `${this.runPath}/${this.fileStateName}`;

    return JSON.parse(fs.readFileSync(this.fileStatePath, 'utf8'));
  }

  saveToDisk(): void {
    const state = JSON.stringify(this.state, null, 2);
    fs.writeFileSync(this.fileStatePath, state, 'utf8');
  }

  getNextSchema(): ISchemaState | undefined {
    return this.state.schemas.find(schema => !schema.completed);
  }

  findIndexSchema(schemaName: string): number {
    const index = this.state.schemas.findIndex(
      schema => schema.schemaName === schemaName,
    );

    if (index == -1) {
      throw new Error(`Schema "${schemaName}" not found.`);
    }

    return index;
  }
}