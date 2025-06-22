package main

import (
	"fmt"
	"os"

	"encoding/json"

	"github.com/xeipuuv/gojsonschema"
)

const SCHEMAS_PATH = "./../schemas/"
const DOCS_PATH = "./../generated-docs/"
const NUM_FILES = 10

func main() {

	names := getNames()

	schemas := getSchemas(names, SCHEMAS_PATH)

	for i, schema := range schemas {
		name := names[i]
		schemaLoader := gojsonschema.NewStringLoader(schema)
		docs := getDocsForOneSchema(name, DOCS_PATH)

		fmt.Println("Validating:", name)
		for i, doc := range docs {
			documentLoader := gojsonschema.NewStringLoader(doc)
			result, err := gojsonschema.Validate(schemaLoader, documentLoader)
			if err != nil {
				panic(err.Error())
			}
			if !result.Valid() {
				fmt.Printf("Document: %d - %s is not valid\n", i, name)
				fmt.Println(doc)
				for _, desc := range result.Errors() {
					fmt.Printf("- %s\n", desc)
				}
			}
		}
	}
}

func getDocsForOneSchema(name string, path string) (docs []string) {
	var data []interface{}

	jsonData, err := os.ReadFile(path + name)
	if err != nil {
		fmt.Println("Error reading file:", name)
		panic(err.Error())
	}

	jsonStr := string(jsonData)
	json.Unmarshal([]byte(jsonStr), &data)

	for _, doc := range data {
		docStr, err := json.Marshal(doc)
		if err != nil {
			fmt.Println("json.Marshal() error", err)
			continue
		}
		docs = append(docs, string(docStr))
	}
	return
}

func getSchemas(fileNames [NUM_FILES]string, path string) (fileContents [NUM_FILES]string) {
	for i, name := range fileNames {
		content, err := os.ReadFile(path + name)
		if err != nil {
			fmt.Printf("Error reading file %s", name)
			panic(err.Error())
		}
		fileContents[i] = string(content)
	}
	return
}

func getNames() (names [NUM_FILES]string) {
	schemaNames, err := os.ReadDir(SCHEMAS_PATH)
	if err != nil {
		fmt.Println("Error reading dir:", SCHEMAS_PATH)
		panic(err.Error())
	}
	for i, name := range schemaNames {
		names[i] = name.Name()
	}
	return
}
