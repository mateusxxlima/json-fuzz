import Ajv from 'ajv';
import exodus from '@exodus/schemasafe';
import librarySchema from 'json-schema-library';
import * as cfworker from '@cfworker/json-schema';
import * as Hyperjump from '@hyperjump/json-schema/draft-07';

import AJS from 'another-json-schema';
import SV from 'schema-validator';

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import { DateTime } from 'luxon';
import { systemContent } from './prompts.js';

//######################################################
//             CONSTANTS/GLOBAL_VARS/CONFIGS
//######################################################
dotenv.config();
const ajv = new Ajv({ allErrors: true });

let totalReqsMadeToGPT = 0;
let totalValidJson = 0;
let totalInvalidJson = 0;
let totalValidDocs = 0;
let totalInvalidDocs = 0;
let totalDifferentDocs = 0;
let maxNumberOfGeneratedDocsPerBatch = 0;
let minNumberOfGeneratedDocsPerBatch = 1000;
let maxDelayToGptAnswer = 0;

const SCHEMA_DRAFT = '7';
const SCHEMAS_FOLDER = 'schemas';
const MODELS = {
    gpt40: 'gpt-4o',
    gpt40mini: 'gpt-4o-mini'
}
//######################################################
//######################################################

const printFinalInfo = (INIT_TIME, END_TIME) => {
    console.log('\n*********************************************************');
    console.log('Program execution completed successfully');
    console.log('The execution started at:', INIT_TIME.toFormat("'day' dd HH:mm"));
    console.log('The execution ended at:', END_TIME.toFormat("'day' dd HH:mm"));
    console.log('Runtime:', END_TIME.diff(INIT_TIME, 'hours').as('hours').toFixed(2), 'hours');
    console.log('\nTotal of requests made to GPT:', totalReqsMadeToGPT);
    console.log('Total of valid JSON:', totalValidJson);
    console.log('Total of invalid JSON:', totalInvalidJson);
    console.log('Total of valid docs:', totalValidDocs);
    console.log('Total of invalid docs:', totalInvalidDocs);
    console.log('Total of different docs:', totalDifferentDocs);
    console.log('\nMax number of docs generated per batch:', maxNumberOfGeneratedDocsPerBatch);
    console.log('Min number of docs generated per batch:', minNumberOfGeneratedDocsPerBatch);
    console.log('Max delay to GPT answer:', maxDelayToGptAnswer.as('minutes').toFixed(2), 'minutes');
}

const getTime = () => {
    const date = DateTime.now().setZone('America/Sao_Paulo');
    const dateFormatted = date.toFormat('HH:mm:ss');
    console.log(`Time: ${dateFormatted}`);
    return date;
}

const getSchemas = () => {
    const dirs = fs.readdirSync(SCHEMAS_FOLDER);
    return dirs.map((fileName) => {
        const schema = fs.readFileSync(SCHEMAS_FOLDER + '/' + fileName);
        return {
            schema: JSON.parse(schema.toString()),
            schemaName: fileName
        }
    })
}

const parseStringToObject = (gptAnswer, schemaName) => {
    try {
        const generatedDocs = JSON.parse(gptAnswer);
        console.log('Docs parsed with success')
        console.log('Docs generated:', generatedDocs.length);
        return generatedDocs;
    } catch (error) {
        console.log('Error in parsing documents received from GPT');
        const fileName = `invalid-json/docs-${schemaName}`;
        writeInFile(gptAnswer, fileName);
    }
}

const writeInFile = (data, fileName) => {
    const flag = 'a+';
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
        data = data + ',';
    }
    fs.writeFileSync(fileName, data, { flag }, err => {
        if (err) {
            console.log('Error on writing in file', fileName)
            console.log(err);
        }
    })
}

const gptCreateJsonDocs = async (config) => {
    const { schemaName, schemaInString, GPT_MODEL, DOCS_GENERATED_PER_BATCH } = config;
    const openai = new OpenAI();
    try {
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-')
        console.log(`Sending ${schemaName} to gpt`)
        const date1 = getTime();
        const completion = await openai.chat.completions.create({
            model: GPT_MODEL,
            messages: [
                { role: 'system', content: systemContent(DOCS_GENERATED_PER_BATCH) },
                { role: 'user', content: schemaInString }
            ],
        });
        console.log('Random docs received from gpt');
        const date2 = getTime();
        const delay = date2.diff(date1, 'minutes');
        console.log('Delay:', delay.as('minutes').toFixed(2), 'minutes');
        if (delay > maxDelayToGptAnswer) maxDelayToGptAnswer = delay;
        const gptAnswer = completion.choices[0].message.content;
        return gptAnswer.replace('```json', '').replace('```', '');
    } catch (err) {
        console.log('Error from GPT');
        console.log(err);
    }
}

// Validates all schemas before submitting them to LLM
const schemaValidation = (schemas) => {
    console.log('Checking if schemas are valid');
    return schemas.map((item) => {
        try {
            const exodusValid = exodus.validator(item.schema);
            const ajvValid = ajv.compile(item.schema);
            if (exodusValid && ajvValid) return item;
        } catch (err) {
            console.log('Error at schema', item.schemaName);
            console.log(err);
        }
    })
}

const dataValidation = async (generatedDocs, schema, schemaName) => {
    const exodusValidate = exodus.validator(schema);
    const ajvValidate = ajv.compile(schema);
    const libraryValidate = new librarySchema.Draft07(schema);
    Hyperjump.registerSchema(schema, schema.$id);
    const hyperjumpValidate = await Hyperjump.validate(schema.$id);
    const cfworkerValidate = new cfworker.Validator(schema, SCHEMA_DRAFT);

    const ajsValidate = AJS(schemaName, schema)

    // Validating documents generated by gpt
    console.log('\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    console.log('Validating documents generated by gpt');
    console.log('Schema:', schemaName);
    console.log('Total of docs:', generatedDocs.length);
    console.log('Validating...');

    let totalValid = 0, totalInvalid = 0, totalDifferent = 0;
    const docsThatNeedBeArray = ['bigquery-table.json', 'pre-commit-hooks.json'];
    for (let doc of generatedDocs) {
        if (docsThatNeedBeArray.includes(schemaName) && !(doc instanceof Array) ) doc = [doc];
        let libraryValid = false;
        const exodusValid = exodusValidate(doc);
        const ajvValid = ajvValidate(doc);
        const { valid: hyperjumpValid } = hyperjumpValidate(doc);
        const libraryErrors = libraryValidate.validate(doc);
        if (!libraryErrors.length) libraryValid = true;
        const { valid: cfworkerValid } = cfworkerValidate.validate(doc);

        const { valid: ajsValid } = ajsValidate.validate(doc);

        if (exodusValid && ajvValid && libraryValid && hyperjumpValid && cfworkerValid && ajsValid) {
            //Save the valid generated docs to folder valid-docs
            const fileName = `valid-docs/docs-${schemaName}`;
            writeInFile(doc, fileName);
            totalValid++;
            totalValidDocs++;
            continue;
        }

        if (!exodusValid && !ajvValid && !libraryValid && !hyperjumpValid && !cfworkerValid && !ajsValid) {
            //Save the invalid doc to folder invalid-docs
            const fileName = `invalid-docs/docs-${schemaName}`;
            writeInFile(doc, fileName);
            totalInvalid++;
            totalInvalidDocs++;
            continue;
        }

        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        console.log(doc);

        const fileName = `different-docs/docs-${schemaName}`;
        writeInFile(doc, fileName);

        if (!exodusValid) console.log('Invalid by Exodus');
        if (!ajvValid) console.log('Invalid by Ajv');
        if (!libraryValid) console.log('Invalid by Library Schema');
        if (!hyperjumpValid) console.log('Invalid by Hyperjump');
        if (!cfworkerValid) console.log('Invalid by CfWorker');

        if (!ajsValid) console.log('Invalid by AJS');

        totalDifferent++;
        totalDifferentDocs++;
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    }
    console.log('Total of docs valid:', totalValid);
    console.log('Total of docs invalid:', totalInvalid);
    console.log('Total of docs differents:', totalDifferent);
}

async function Main() {
    const GPT_MODEL = MODELS.gpt40mini;
    const DOCS_GENERATED_PER_BATCH = 100;
    const TOTAL_DOCS = 10000;
    const INIT_TIME = getTime();

    // Reads the schemas from files
    const schemas = getSchemas();
    console.log(`Script started\nSchemas number: ${schemas.length}\nGPT model: ${GPT_MODEL}`)

    // Validates all schemas before submitting them to LLM
    const validSchemas = schemaValidation(schemas);

    // Submit the schemas to GPT one by one
    while (validSchemas.length) {
        console.log('\n########################################');
        const { schema, schemaName } = validSchemas.shift();
        let validJson = 0, invalidJson = 0;
        const generatedDocs = [];

        const schemaInString = JSON.stringify(schema);

        while (generatedDocs.length < TOTAL_DOCS) {
            const gptConfig = { schemaName, schemaInString, GPT_MODEL, DOCS_GENERATED_PER_BATCH };
            const gptAnswer = await gptCreateJsonDocs(gptConfig);
            totalReqsMadeToGPT++;
            if (!gptAnswer) continue;

            // Try parse the documents from gpt to javaScript object
            const docsParsed = parseStringToObject(gptAnswer, schemaName);
            if (docsParsed) {
                docsParsed.forEach(doc => generatedDocs.push(doc));
                if (docsParsed.length > maxNumberOfGeneratedDocsPerBatch)
                    maxNumberOfGeneratedDocsPerBatch = docsParsed.length;
                if (docsParsed.length < minNumberOfGeneratedDocsPerBatch)
                    minNumberOfGeneratedDocsPerBatch = docsParsed.length;
                validJson++;
                totalValidJson++;
            } else {
                invalidJson++;
                totalInvalidJson++;
            }
            console.log('Valid json:', validJson);
            console.log('Invalid json:', invalidJson);
            console.log('Docs generated so far:', generatedDocs.length);
        }

        //Apply to all libraries to validate
        await dataValidation(generatedDocs, schema, schemaName);
        console.log('Total of valid json for this schema', validJson);
        console.log('Total of invalid json for this schema', invalidJson);
    }
    const END_TIME = getTime();
    printFinalInfo(INIT_TIME, END_TIME);
}

await Main();
