local jsonschema = require("jsonschema") -- Biblioteca que vai fazer a validação
local lfs = require("lfs")  -- Para manipulação de arquivos e diretórios
local json = require("dkjson")  -- Biblioteca para manipulação de JSON

-- Caminhos dos diretórios
local SCHEMAS_PATH = "./../schemas/"
local DOCS_PATH = "./../generated-docs/"
local NUM_FILES = 10

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

-- Função para carregar os esquemas JSON
function getSchemas(names, path)
	print("Getting schemas...")
    local schemas = {}

    for i, name in ipairs(names) do
        local filePath = path .. name
        local file = io.open(filePath, "r")
        if file then
            schemas[i] = file:read("*a")
            file:close()
        else
            error("Erro ao ler o arquivo: " .. name)
        end
    end

    return schemas
end

-- Função para carregar os documentos JSON associados a um esquema
function getDocsForOneSchema(name, path)
	print("Getting docs of schema " .. name)
    local docs = {}
    local filePath = path .. name
    local file = io.open(filePath, "r")

    if file then
        local content = file:read("*a")
        file:close()

        local data = json.decode(content)
        if type(data) == "table" then
            for _, doc in ipairs(data) do
                table.insert(docs, json.encode(doc))
            end
        else
            error("Erro ao analisar o arquivo JSON: " .. name)
        end
    else
        error("Erro ao ler o arquivo: " .. name)
    end

    return docs
end

function validateJSON(name, schema, docs)
	print("Validating " .. name .. "...")
	local validator = jsonschema.generate_validator(schema)

	for i, doc in ipairs(docs) do
		local valid = validator(doc)
		if not valid then
			print("Doc " .. i .. " invalido para o schema " .. name)
		end
	end
end

function Main()
	print("-=-=-=-=- STARTING VALIDATION WITH LUA -=-=-=-=-")
	local names = getNames()
	local schemas = getSchemas(names, SCHEMAS_PATH)


	for i, name in ipairs(names) do
		print("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    	local docs = getDocsForOneSchema(name, DOCS_PATH)
    	validateJSON(name, schemas[i], docs)

	end
end

Main()