local lfs = require("lfs")  -- Para manipulação de arquivos e diretórios
local json = require("dkjson")  -- Biblioteca para manipulação de JSON

-- Caminhos dos diretórios
local SCHEMAS_PATH = "./../schemas/"
local DOCS_PATH = "./../json-docs/"
local NUM_FILES = 10

-- Função principal
function main()
    local names = getNames()
    local schemas = getSchemas(names, SCHEMAS_PATH)

    for i, schema in ipairs(schemas) do
        local name = names[i]
        local docs = getDocsForOneSchema(name, DOCS_PATH)

        print("Validando:", name)
        for j, doc in ipairs(docs) do
            -- Validar o documento com o esquema
            local valid, errors = validateJSON(schema, doc)
            if not valid then
                print("Documento: " .. j .. " - " .. name .. " não é válido")
                print(doc)
                for _, err in ipairs(errors) do
                    print("- " .. err)
                end
            end
        end
    end
end

-- Função para validar JSON com base em um esquema
function validateJSON(schema, doc)
    -- Aqui você pode usar uma biblioteca de validação JSON em Lua, como `jsonschema`
    -- Como Lua não tem uma biblioteca nativa de validação JSON, este é um exemplo simplificado.
    -- Você precisará instalar uma biblioteca como `lua-jsonschema` ou implementar sua própria lógica de validação.
    -- Este exemplo apenas verifica se o documento é um JSON válido.
    local ok, parsedDoc = pcall(json.decode, doc)
    if not ok then
        return false, {"Documento JSON inválido"}
    end

    -- Simulação de validação (substitua por uma lógica real de validação)
    if not parsedDoc then
        return false, {"Erro ao analisar o documento JSON"}
    end

    return true, {}
end

-- Função para obter os nomes dos arquivos no diretório de esquemas
function getNames()
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

-- Executar o programa
main()