import { DateTime } from 'luxon';

export const getTime = () => {
    const date = DateTime.now().setZone('America/Sao_Paulo');
    return date;
}

// const print = (): void {
//     if (!this.startTime || !this.endTime) {
//         throw new Error('Execution metrics have not been initialized.');
//     }

//     const runtime = this.endTime.diff(this.startTime);

//     console.log('\n*********************************************************');
//     console.log('Program execution completed successfully\n');

//     console.log('Execution started:     ', this.startTime.toFormat("'day' dd HH:mm"));
//     console.log('Execution finished:    ', this.endTime.toFormat("'day' dd HH:mm"));
//     console.log(
//         'Total execution time: ',
//         runtime.as('hours').toFixed(2),
//         'hours',
//     );

//     console.log('\nExecution summary');
//     console.log('-----------------');
//     console.log('Total requests made to LLM:              ', this.totalRequestsMadeToLLM);
//     console.log('Total parseable JSON responses:          ', this.totalParseableJsonResponses);
//     console.log('Total unparseable JSON responses:        ', this.totalUnparseableJsonResponses);
//     console.log('Total valid documents:                   ', this.totalValidDocuments);
//     console.log('Total invalid documents:                 ', this.totalInvalidDocuments);
//     console.log('Total documents with validator conflicts:', this.totalConflictDocuments);

//     console.log('\nBatch statistics');
//     console.log('----------------');
//     console.log('Maximum documents generated per batch:   ', this.maxGeneratedDocumentsPerBatch);
//     console.log('Minimum documents generated per batch:   ', this.minGeneratedDocumentsPerBatch);
//     console.log('Maximum LLM response time:               ', this.maxLLMResponseTimeMinutes.toFixed(2), 'minutes');
// }