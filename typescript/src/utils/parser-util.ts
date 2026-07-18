import type { IMetricsState, ISchemaState } from '../interfaces/state-interface.js';

export const parseDocs = (content: string, schema: ISchemaState, generalMetrics: IMetricsState): unknown[] | null => {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'object' && item !== null)) {
      console.log('Docs parsed with success')
      console.log('Docs parsed:', parsed.length);
      schema.metrics.totalParseableJsonResponses++;
      generalMetrics.totalParseableJsonResponses++;
      if (parsed.length < schema.metrics.minGeneratedDocumentsPerBatch)
        schema.metrics.minGeneratedDocumentsPerBatch = parsed.length;
      if (parsed.length > schema.metrics.maxGeneratedDocumentsPerBatch)
        schema.metrics.maxGeneratedDocumentsPerBatch = parsed.length;

      if (parsed.length < generalMetrics.minGeneratedDocumentsPerBatch)
        generalMetrics.minGeneratedDocumentsPerBatch = parsed.length;
      if (parsed.length > generalMetrics.maxGeneratedDocumentsPerBatch)
        generalMetrics.maxGeneratedDocumentsPerBatch = parsed.length;
      return parsed;
    }
    schema.metrics.totalUnparseableJsonResponses++;
    generalMetrics.totalUnparseableJsonResponses++;
    return null;
  } catch (error) {
    schema.metrics.totalUnparseableJsonResponses++;
    generalMetrics.totalUnparseableJsonResponses++;
    console.log('Error on parsing documents');
    return null;
  }
}