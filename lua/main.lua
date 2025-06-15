local jsonschema = require("jsonschema") -- JSONSchema validation lib
local lfs = require("lfs")
local json = require("dkjson")  -- JSON manager

-- Dir paths
local SCHEMAS_PATH = "./../schemas/"
local DOCS_PATH = "./../generated-docs/"
local NUM_FILES = 10

function main()
    print("-=-=-=-=- STARTING VALIDATION WITH LUA -=-=-=-=-")
    local fileNames = getNames()

    for _, name in ipairs(fileNames) do
        print("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
        print("Getting schema and docs: " .. name)
        local schema = readFile(SCHEMAS_PATH, name)
        local docs = readFile(DOCS_PATH, name)
        validateJSON(name, schema, docs)
    end
end

function validateJSON(name, schema, docs)
    print("Validating " .. name .. "...")

    local schemaTable = json.decode(schema)
    schemaTable["$id"] = nil

    local docsTable = nil
    if name == "aiconfig-1.0.json" then
        docsTable = json.decode(docs, 1, json.null)
    else 
        docsTable = json.decode(docs)
    end

    local validator = jsonschema.generate_validator(schemaTable)

    for i, doc in ipairs(docsTable) do
        local valid, err = validator(doc)
        if not valid then
            print("<<<<<<<< invalid doc >>>>>>>>")
            print("Invalid doc for schema " .. name)
            print(err)
            print("Doc index: " .. i)
            print(json.encode(doc))
            print("<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>")

        end
    end
end

function getNames()
	print("Getting names...")
    local names = {}
    local i = 1

    for name in lfs.dir(SCHEMAS_PATH) do
        if name ~= "." and name ~= ".." then
            names[i] = name
            i = i + 1
            if i > NUM_FILES then
                break
            end
        end
    end

    return names
end

function readFile(path, name)
    local filePath = path .. name
    local file = io.open(filePath, "r")
    if file then
        local content = file:read("*a")
        file:close()
        return content;
    else
        error("Error reading file: " .. filePath)
        os.exit(1)
    end
end

main()