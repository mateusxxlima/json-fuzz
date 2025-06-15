local jsonschema = require("jsonschema") -- JSONSchema validation lib
local lfs = require("lfs")
local json = require("dkjson")  -- JSON manager

local NAME = "aspire"
local SCHEMA_NAME = "aspire.schema.json"
local DOC_NAME = "aspire.doc.json"

function main()
    print("-=-=-=-=- STARTING VALIDATION WITH LUA -=-=-=-=-")

    print("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    local schema = readFile("", SCHEMA_NAME)
    local doc = readFile("", DOC_NAME)
    validateJSON(NAME, schema, doc)

end

function validateJSON(name, schema, doc)
    print("Validating " .. name .. "...")

    local schemaTable = json.decode(schema)
    schemaTable["$id"] = nil
    local docTable = json.decode(doc)

    --print(docTable.resources.myBicepWithInvalidParams.path)
    --print("Type: " .. type(docTable.resources.myBicepWithInvalidParams.params.param1))
    --print(getmetatable(docTable.resources.myBicepWithInvalidParams.params.param1).__jsontype)

    local validator = jsonschema.generate_validator(schemaTable)

    local valid, err = validator(docTable)
    if not valid then
        print("<<<<<<<< invalid doc >>>>>>>>")
        print("Invalid doc for schema " .. name)
        print(err)
        print(json.encode(doc))
        print("<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>")

    end

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