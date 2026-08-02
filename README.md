# Mini Rastreador de Pedidos

Sistema simplificado de rastreamento de pedidos de delivery (desafio técnico Foody).

Monorepo com:

- **Backend:** API REST em Java + Spring Boot (JWT + H2)
- **Frontend:** React + TypeScript + Vite + Tailwind (identidade Foody)

## Estrutura do repositório

```
├── pedidos-api/     # Backend Spring Boot
├── pedidos-web/     # Frontend React + TypeScript
└── README.md
```

## Stack

### Backend
- Java 17
- Spring Boot 4.1
- Spring Security + JWT
- Spring Data JPA
- H2 (banco embutido em arquivo — equivalente a SQLite)
- Maven

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Autenticação via JWT (localStorage)

## Como subir

### Pré-requisitos
- JDK 17+
- Node.js 18+ (recomendado 20+)

### 1. Backend

```bash
cd pedidos-api
./mvnw spring-boot:run
```

No Windows:

```bash
cd pedidos-api
./mvnw.cmd spring-boot:run
```

API: `http://localhost:8080`

Console H2 (opcional): `http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:file:./data/pedidosdb`
- User: `sa`
- Password: *(vazio)*

### 2. Frontend

Em outro terminal:

```bash
cd pedidos-web
npm install
npm run dev
```

App: `http://localhost:5173`

O front espera a API em `http://localhost:8080` (CORS já liberado).

## Funcionalidades do frontend

1. **Cadastro / Login** — nome, e-mail e senha; token JWT salvo na sessão
2. **Criar pedido** — cliente, endereço de entrega e itens
3. **Listar pedidos em andamento** — com status e atualização
4. **Histórico** — pedidos `ENTREGUE` e `CANCELADO`
5. Confirmação em modal ao marcar status definitivo (não pode alterar depois)

## API — Autenticação

Cadastro e login são públicos. Demais rotas exigem:

```
Authorization: Bearer <token>
```

### Cadastro

`POST /api/auth/cadastro`

```json
{
  "nome": "Henrique",
  "email": "henrique@email.com",
  "senha": "123456"
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "henrique@email.com",
  "senha": "123456"
}
```

Resposta (ambos):

```json
{
  "token": "eyJhbGciOi...",
  "tipo": "Bearer",
  "id": 1,
  "nome": "Henrique",
  "email": "henrique@email.com"
}
```

## API — Pedidos

Todas as rotas abaixo exigem autenticação.

### Criar pedido

`POST /api/pedidos`

```json
{
  "cliente": "Maria Silva",
  "enderecoEntrega": "Rua das Flores, 100",
  "itens": [
    { "nome": "X-Burger", "quantidade": 2 },
    { "nome": "Refrigerante", "quantidade": 1 }
  ]
}
```

### Listar pedidos

`GET /api/pedidos`

### Buscar por ID

`GET /api/pedidos/{id}`

### Atualizar status

`PUT /api/pedidos/{id}/status`

```json
{
  "status": "EM_PREPARO"
}
```

### Status disponíveis

| Status | Descrição |
|--------|-----------|
| `RECEBIDO` | Pedido criado (padrão) |
| `EM_PREPARO` | Em preparo |
| `SAIU_PARA_ENTREGA` | Saiu para entrega |
| `ENTREGUE` | Finalizado |
| `CANCELADO` | Cancelado |

Fluxo permitido:

```
RECEBIDO → EM_PREPARO → SAIU_PARA_ENTREGA → ENTREGUE
                ↘           ↘
              CANCELADO   CANCELADO
```

`ENTREGUE` e `CANCELADO` são estados finais.

## Estrutura do código

### Backend (`pedidos-api/`)

```
src/main/java/.../pedidos_api/
├── auth/          # Cadastro e login
├── domain/        # Entidades e enum de status
├── pedido/        # API de pedidos
├── repository/    # Spring Data JPA
├── security/      # JWT + SecurityConfig
└── common/        # Tratamento global de erros
```

### Frontend (`pedidos-web/`)

```
src/
├── api/           # Cliente HTTP
├── auth/          # Contexto e sessão
├── components/    # UI reutilizável (pedidos, header, modal)
├── constants/     # Status do pedido
├── pages/         # AuthPage, PedidosPage
├── types/         # Tipagens TypeScript
└── utils/         # Formatação
```

## Exemplos com cURL

```bash
# Cadastro
curl -X POST http://localhost:8080/api/auth/cadastro \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Henrique\",\"email\":\"henrique@email.com\",\"senha\":\"123456\"}"

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"henrique@email.com\",\"senha\":\"123456\"}"

# Criar pedido (troque TOKEN)
curl -X POST http://localhost:8080/api/pedidos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"cliente\":\"Maria\",\"enderecoEntrega\":\"Rua A, 10\",\"itens\":[{\"nome\":\"Pizza\",\"quantidade\":1}]}"

# Listar
curl http://localhost:8080/api/pedidos \
  -H "Authorization: Bearer TOKEN"
```

## Branch

Desenvolvimento na branch `develop`. A `main`/`master` recebe o merge quando o projeto estiver completo.
