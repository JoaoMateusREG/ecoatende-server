# ===================================================
# 1. ESTÁGIO DE BUILD (Usando Node para garantir compatibilidade total com o Nest CLI)
# ===================================================
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependências necessárias para o Prisma
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar os arquivos de gerenciamento
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar todas as dependências (Node/NPM não têm problema com o Nest CLI)
RUN npm ci

# Gerar o cliente Prisma
RUN npx prisma generate

# Copiar o resto do projeto
COPY . .

# Fazer o build do NestJS de forma segura
RUN npm run build

# Remover dependências de desenvolvimento para deixar a imagem leve
RUN npm prune --omit=dev

# ===================================================
# 2. ESTÁGIO DE PRODUÇÃO (Usando Bun puro para rodar com máximo desempenho)
# ===================================================
FROM oven/bun:1.2-slim AS production

WORKDIR /app

# Instalar dependências necessárias para runtime (Prisma e requisições HTTP)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar apenas os artefatos essenciais do estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./

RUN chmod +x ./docker-entrypoint.sh

# Configurações padrão de ambiente
ENV NODE_ENV=production
ENV PORT=9868
ENV HOST=0.0.0.0

# Expor a porta da API
EXPOSE 9868

# Healthcheck apontando para o Swagger /api
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:${PORT}/api || exit 1

# Ponto de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]
