# 🔐 Sistema de Autenticação JWT

## 📋 **Endpoints Disponíveis**

### **🔓 Login (NÃO PROTEGIDO)**
```http
POST /auth/login
Content-Type: application/json

{
  "cpf": "123.456.789-00",
  "password": "123456"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "cpf": "123.456.789-00",
    "name": "JOÃO SILVA",
    "organizationCnpj": "12.345.678/0001-90",
    "isActive": true
  }
}
```

## 🛡️ **Rotas Protegidas**

Todas as outras rotas precisam do token JWT no header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **👥 Usuários**
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário
- `GET /users/:cpf` - Buscar usuário
- `PUT /users/:cpf` - Atualizar usuário
- `DELETE /users/:cpf` - Deletar usuário
- `GET /users/organization/:organizationCnpj` - Usuários por organização
- `PUT /users/change-password` - Alterar senha

### **🎫 Fichas**
- `GET /cards` - Listar fichas
- `POST /cards` - Criar ficha
- `GET /cards/:id` - Buscar ficha
- `PUT /cards/:id` - Atualizar ficha
- `DELETE /cards/:id` - Deletar ficha
- `GET /cards/pending` - Fichas pendentes
- `GET /cards/today-called` - Fichas chamadas hoje
- `GET /cards/concluded` - Fichas concluídas
- `GET /cards/in-attendance` - Ficha em atendimento

### **🏥 Serviços**
- `GET /services` - Listar serviços
- `POST /services` - Criar serviço
- `GET /services/:id` - Buscar serviço
- `PUT /services/:id` - Atualizar serviço
- `DELETE /services/:id` - Deletar serviço

### **🏢 Organizações**
- `GET /organizations` - Listar organizações
- `POST /organizations` - Criar organização
- `GET /organizations/:cnpj` - Buscar organização
- `PUT /organizations/:cnpj` - Atualizar organização
- `DELETE /organizations/:cnpj` - Deletar organização

## 🔧 **Configuração**

### **1. Variável de Ambiente**
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/painel_chamado"
JWT_SECRET="sua-chave-super-secreta-aqui-mude-em-producao"
REDIS_URL="redis://127.0.0.1:6379"
REDIS_SESSION_TTL_SECONDS=43200
REDIS_KEY_PREFIX="ecoatende:"
REDIS_CONNECT_TIMEOUT_MS=10000
```

### **2. Instalação de Dependências**
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install --save-dev @types/passport-jwt @types/bcryptjs
```

## 🚀 **Como Usar**

### **1. Criar Usuário (Primeira vez)**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "123.456.789-00",
    "name": "João Silva",
    "password": "123456",
    "organizationCnpj": "12.345.678/0001-90"
  }'
```

### **2. Fazer Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "123.456.789-00",
    "password": "123456"
  }'
```

### **3. Usar Token nas Requisições**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔒 **Segurança**

- ✅ **Senhas criptografadas** com bcrypt
- ✅ **Tokens JWT** com expiração de 24h
- ✅ **Validação de usuário ativo**
- ✅ **Proteção de todas as rotas** exceto login
- ✅ **Headers de autorização** obrigatórios

## ⚠️ **Importante**

- **MUDE A CHAVE JWT_SECRET** em produção
- **Use HTTPS** em produção
- **Configure rate limiting** para evitar ataques
- **Monitore logs** de autenticação 