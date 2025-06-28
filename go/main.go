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
	fmt.Printf("\n-=-=-=-=- STARTING VALIDATION WITH GOLANG -=-=-=-=-\n\n")
	fileNames := getFileNames(SCHEMAS_PATH)
	for _, name := range fileNames {
		fmt.Println("\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
		fmt.Println("> Getting schema and docs: " + name)
		schema := readFile(SCHEMAS_PATH, name)
		docs := readFile(DOCS_PATH, name)
		docList := getDocsFromJSONString(docs)
		validate(schema, docList, name)
	}
}

func validate(schema string, docs []string, name string) {
	schemaLoader := gojsonschema.NewStringLoader(schema)
	fmt.Println("> Validating:", name)
	allValid := true
	for i, doc := range docs {
		documentLoader := gojsonschema.NewStringLoader(doc)
		result, err := gojsonschema.Validate(schemaLoader, documentLoader)
		if err != nil {
			panic(err.Error())
		}
		if !result.Valid() {
			fmt.Println("<<<<<<<< invalid doc >>>>>>>>")
			for _, desc := range result.Errors() {
				fmt.Printf("- %s\n", desc)
			}
			fmt.Printf("Doc index: %d\n", i)
			fmt.Println("Doc content:", doc)
			fmt.Println("<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>")
			allValid = false
		}
	}
	if allValid {
		fmt.Println("All documents were successfully validated against the schema")
	}
}

func getDocsFromJSONString(jsonStr string) (docs []string) {
	var data []interface{}
	err := json.Unmarshal([]byte(jsonStr), &data)
	if err != nil {
		fmt.Println("Error unmarshaling JSON:", err)
		return
	}
	for _, doc := range data {
		docStr, err := json.Marshal(doc)
		if err != nil {
			fmt.Println("json.Marshal() error:", err)
			continue
		}
		docs = append(docs, string(docStr))
	}
	return
}

func readFile(path string, name string) string {
	content, err := os.ReadFile(path + name)
	if err != nil {
		fmt.Printf("Error reading file %s", name)
		panic(err.Error())
	}
	return string(content)
}

func getFileNames(path string) (names [NUM_FILES]string) {
	fmt.Println("> Getting names...")
	files, err := os.ReadDir(path)
	if err != nil {
		fmt.Println("Error reading dir:", path)
		panic(err.Error())
	}
	for i, file := range files {
		names[i] = file.Name()
	}
	return
}
