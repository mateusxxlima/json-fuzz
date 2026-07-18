import type { IMetricsState, ISchemaState } from './state-interface.js';

export type LLMConfig = {
  schemaName: string;
  schemaContent: string;
  prompt: string;
  temperature: number;
};

export interface ILLM {
  generateDocs(
    config: LLMConfig,
    schema: ISchemaState,
    generalMetrics: IMetricsState
  ): Promise<string | null>;
}
