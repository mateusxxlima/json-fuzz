import OpenAI from 'openai';
import { getTime } from '../utils/app-util.js';
import type { ILLM, LLMConfig } from '../interfaces/llm-interface.js';
import type { ISchemaState, IMetricsState } from '../interfaces/state-interface.js';

export class GptService implements ILLM {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(model: string) {
    this.client = new OpenAI();
    this.model = model;
  }

  public async generateDocs(config: LLMConfig, schema: ISchemaState, generalMetrics: IMetricsState): Promise<string | null> {
    const { schemaName, schemaContent, prompt, temperature } = config;

    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.log(`Sending ${schemaName} to gpt`);
    const date1 = getTime();

    try {
      const response = await this.client.responses.create({
        model: this.model,
        instructions: prompt,
        input: `Schema:\n${schemaContent}`,
        temperature
      });

      schema.metrics.totalRequestsMadeToLLM++;
      generalMetrics.totalRequestsMadeToLLM++;
      console.log('JSON docs received from gpt');
      const date2 = getTime();
      const delay = date2.diff(date1, 'minutes').as('minutes');
      console.log('Delay:', delay.toFixed(2), 'minutes');

      if (delay > schema.metrics.maxLLMResponseTimeMinutes)
        schema.metrics.maxLLMResponseTimeMinutes = delay;

      if (delay > generalMetrics.maxLLMResponseTimeMinutes)
        generalMetrics.maxLLMResponseTimeMinutes = delay;

      const content = response.output_text.replace('```json', '').replace('```', '');

      return content;
    } catch (error) {
      console.error('Error sending schema to GPT:', error);
      return null;
    }
  }
}
