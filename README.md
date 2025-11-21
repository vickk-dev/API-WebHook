# API WebHook

API RESTful para gerenciamento e reenvio de notificações webhook com suporte a múltiplos produtos (boleto, pagamento, PIX).

## 📋 Descrição

Esta API fornece endpoints para:
- Reenviar notificações webhook de forma controlada
- Consultar protocolos de envio
- Gerenciar autenticação de Software Houses e Cedentes
- Controlar duplicidade de requisições via cache Redis
- Validar situações de produtos antes do envio

## 🏗️ Estrutura do Projeto

```
API-WebHook/
├── src/
│   ├── app.js                      # Configuração principal do Express
│   ├── server.js                   # Inicialização do servidor
│   ├── config/                     # Configurações gerais
│   │   ├── config.js              # Configurações da aplicação
│   │   ├── index.js               # Exportações de configurações
│   │   ├── redis.js               # Cliente Redis
│   │   ├── middlewares/           # Middlewares customizados
│   │   │   ├── authMiddleware.js          # Autenticação via headers
│   │   │   ├── errorHandler.js            # Tratamento de erros
│   │   │   └── validationMiddleware.js    # Validação de requisições
│   │   └── validators/            # Schemas de validação Joi
│   │       ├── CedenteValidator.js
│   │       ├── ContaValidator.js
│   │       ├── convenioValidator.js
│   │       ├── ProtocoloValidator.js
│   │       ├── ReenviarValidator.js
│   │       ├── servicoValidator.js
│   │       ├── SoftwareHouseValidator.js
│   │       └── webhockReprocessadoValidator.js
│   ├── controller/                # Controladores das rotas
│   │   ├── ProtocoloController.js
│   │   └── ReenvioController.js
│   ├── Infrastructure/            # Camada de infraestrutura
│   │   └── Persistence/
│   │       └── Sequelize/
│   │           ├── database.js            # Configuração do Sequelize
│   │           ├── migrations/            # Migrações do banco
│   │           └── models/                # Modelos Sequelize
│   │               ├── index.js
│   │               ├── Cedente.js
│   │               ├── Conta.js
│   │               ├── convenio.js
│   │               ├── servico.js
│   │               ├── SoftwareHouse.js
│   │               └── webhockReprocessado.js
│   ├── rotas/                     # Definição de rotas
│   │   ├── ProtocoloRota.js
│   │   └── ReenvioRota.js
│   ├── services/                  # Lógica de negócio
│   │   ├── CacheService.js               # Serviço de cache Redis
│   │   ├── ConfigService.js              # Serviço de configurações
│   │   ├── ProtocoloService.js           # Serviço de protocolos
│   │   ├── ReenviarServices.js           # Serviço de reenvio
│   │   └── WebhookService.js             # Serviço de webhooks
│   ├── tests/                     # Testes automatizados
│   │   ├── authMiddleware.test.js
│   │   ├── ProtocoloService.test.js
│   │   ├── reenviar.test.js
│   │   └── WebhookService.test.js
│   └── utils/                     # Utilitários
│       └── testeSituacoes.js             # Validação de situações
├── .env                           # Variáveis de ambiente (não versionado)
├── .env.example                   # Exemplo de variáveis de ambiente
├── .gitignore                     # Arquivos ignorados pelo Git
├── docker-compose.yml             # Configuração Docker
├── Dockerfile                     # Imagem Docker da aplicação
├── jest.config.js                 # Configuração do Jest
└── package.json                   # Dependências e scripts

```

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express 5** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e controle de duplicidade
- **Sequelize** - ORM para PostgreSQL
- **Joi** - Validação de schemas
- **Jest** - Framework de testes
- **Docker** - Containerização

## 📦 Pré-requisitos

- Node.js >= 14.x
- Docker e Docker Compose
- PostgreSQL (ou use o container Docker)
- Redis (ou use o container Docker)

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/vickk-dev/API-WebHook.git
cd API-WebHook
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
NODE_ENV=development
PORT=3000
DB_URL=postgres://postgres:postgre@localhost:5432/postgres
DB_DIALECT=postgres
REDIS_URL=redis://localhost:6379
```

4. Inicie os serviços com Docker:
```bash
docker-compose up -d
```

5. Execute as migrations:
```bash
npx sequelize-cli db:migrate
```

## 🎯 Uso

### Iniciar o servidor

```bash
npm start
```

### Executar testes

```bash
npm test
```

## 📡 Endpoints

### POST /api/reenviar
Reenvia notificações webhook para produtos específicos.

**URL:** `http://localhost:3000/api/reenviar`

**Headers obrigatórios:**
- `Content-Type`: `application/json`
- `x-api-cnpj-sh`: `11111111000111` (CNPJ da Software House)
- `x-api-token-sh`: `TOKEN_VALIDO_SH` (Token da Software House)
- `x-api-cnpj-cedente`: `22222222000122` (CNPJ do Cedente)
- `x-api-token-cedente`: `TOKEN_VALIDO_CEDENTE` (Token do Cedente)

**Body (exemplo):**
```json
{
  "product": "boleto",
  "ids": ["1001", "1002"],
  "kind": "webhook",
  "type": "pago",
  "cedente_id": 1
}
```

**Resposta de sucesso (200/201):**
```json
{
  "message": "Reenvio criado com sucesso!",
  "protocolo": "uuid-gerado-aqui",
  "uuid": "uuid-gerado-aqui"
}
```

---

### GET /api/protocolo
Lista protocolos de envio com filtros de data.

**URL:** `http://localhost:3000/api/protocolo`

**Headers obrigatórios:**
- `Content-Type`: `application/json`
- `x-api-cnpj-sh`: `11111111000111`
- `x-api-token-sh`: `TOKEN_VALIDO_SH`
- `x-api-cnpj-cedente`: `22222222000122`
- `x-api-token-cedente`: `TOKEN_VALIDO_CEDENTE`

**Query params (exemplo):**
- `start_date`: `2025-11-01T00:00:00Z` (obrigatório - formato ISO 8601)
- `end_date`: `2025-11-25T23:59:59Z` (obrigatório - formato ISO 8601, máx 31 dias de intervalo)
- `product`: `boleto` (opcional: boleto, pagamento, pix)

**Exemplo completo:**
```
GET http://localhost:3000/api/protocolo?start_date=2025-11-01T00:00:00Z&end_date=2025-11-25T23:59:59Z&product=boleto
```

---

### GET /api/protocolo/:uuid
Consulta individual de um protocolo pelo UUID.

**URL:** `http://localhost:3000/api/protocolo/{uuid}`

**Headers obrigatórios:**
- `Content-Type`: `application/json`
- `x-api-cnpj-sh`: `11111111000111`
- `x-api-token-sh`: `TOKEN_VALIDO_SH`
- `x-api-cnpj-cedente`: `22222222000122`
- `x-api-token-cedente`: `TOKEN_VALIDO_CEDENTE`

**Exemplo:**
```
GET http://localhost:3000/api/protocolo/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## 🔐 Autenticação

A API utiliza autenticação baseada em headers customizados. Cada requisição deve incluir:

1. Credenciais da Software House (CNPJ + Token)
2. Credenciais do Cedente (CNPJ + Token)

O middleware `authMiddleware` valida:
- Existência dos headers
- Validade das credenciais no banco de dados
- Status ativo de ambas entidades
- Vinculação correta entre Cedente e Software House

## 🧪 Testes

A aplicação possui cobertura de testes para:
- Middleware de autenticação
- Serviços de protocolo
- Serviços de reenvio
- Serviços de webhook

Execute os testes com:
```bash
npm test
```

## 🐳 Docker

O projeto inclui configuração Docker Compose com:
- PostgreSQL 15 Alpine
- Redis Latest

Para iniciar os containers:
```bash
docker-compose up -d
```

Para parar os containers:
```bash
docker-compose down
```

## 🗄️ Acesso ao Banco de Dados (DBeaver)

Para acessar o banco de dados localmente via DBeaver ou outro cliente SQL, utilize as credenciais abaixo (configuradas no `docker-compose.yml`):

- **Host:** `localhost`
- **Porta:** `5432`
- **Database:** `postgres`
- **Username:** `postgres`
- **Password:** `postgre`
- **Driver:** PostgreSQL

## 🤝 Contribuindo

Contribuições, issues e feature requests são bem-vindas!

## 📞 Suporte

Para questões e suporte, abra uma [issue](https://github.com/vickk-dev/API-WebHook/issues).
