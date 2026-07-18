export interface IMetricsState {
  startTime: string | null;
  endTime: string | null;
  totalRequestsMadeToLLM: number;
  totalParseableJsonResponses: number;
  totalUnparseableJsonResponses: number;
  generatedDocuments: number;
  totalValidDocuments: number;
  totalInvalidDocuments: number;
  totalConflictDocuments: number;
  maxGeneratedDocumentsPerBatch: number;
  minGeneratedDocumentsPerBatch: number;
  maxLLMResponseTimeMinutes: number;
}

export interface ISchemaState {
  schemaName: string;
  completed: boolean;
  metrics: IMetricsState;
}

export interface IState {
  completed: boolean;
  schemas: ISchemaState[];
  generalMetrics: IMetricsState;
}

export interface IStateService {
  state: IState;
  dataPath: string;
  runPath: string;
  fileStatePath: string;
  fileStateName: string;
  runId: number;
  runPrefix: string;

  load(schemasPath: string): IState;
  saveToDisk(): void;
  getLastRun(): IState | null;
  createNewRun(schemaNames: string[]): IState;
  getNextSchema(): ISchemaState | undefined;
  findIndexSchema(schemaName: string): number;
}