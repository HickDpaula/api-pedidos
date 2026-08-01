# Mini Rastreador de Pedidos

API REST em Java + Spring Boot para rastreamento simplificado de pedidos de delivery.  
Desafio técnico — autenticação JWT, persistência H2 e endpoints de pedidos.


## Stack

- Java 17
- Spring Boot 4.1
- Spring Security + JWT
- Spring Data JPA
- H2 (banco em arquivo)
- Maven

## Como subir

Pré-requisitos: **JDK 17+** e Maven Wrapper (já incluso).

```bash
cd pedidos-api
./mvnw spring-boot:run
```

No Windows (PowerShell/Git Bash):

```bash
cd pedidos-api
./mvnw.cmd spring-boot:run
```

API disponível em: `http://localhost:8080`

Console H2 (opcional): `http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:file:./data/pedidosdb`
- User: `sa`
- Password: *(vazio)*

## Autenticação

Fluxo JWT. Cadastro e login são públicos; demais rotas exigem:

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

## Pedidos

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

## Estrutura do projeto

```
pedidos-api/
├── auth/          # Cadastro e login
├── domain/        # Entidades e enum de status
├── pedido/        # API de pedidos
├── repository/    # Spring Data JPA
├── security/      # JWT + SecurityConfig
└── common/        # Tratamento global de erros
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
