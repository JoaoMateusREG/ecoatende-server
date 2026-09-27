# Usar a imagem oficial do Bun (versão Debian Slim para compatibilidade com o engine do Prisma)
FROM oven/bun:1.2-slim AS base

WORKDIR /app

# Instalar dependências necessárias para o Prisma Query Engine, Healthcheck e Node.js para o Nest CLI
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências e definições do Prisma
COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Garantir que o instalador baixe as devDependencies (Nest CLI, TypeScript) necessárias para o build
ENV NODE_ENV=development

# Instalar todas as dependências (necessárias para gerar o cliente Prisma)
RUN bun install

# Gerar o cliente Prisma
RUN bunx prisma generate

# Copiar o restante do código da aplicação
COPY . .

# Fazer o build da aplicação NestJS
RUN bun run build

# Ajustar permissões de execução do entrypoint
RUN chmod +x ./docker-entrypoint.sh

# Configurações padrão de ambiente
ENV NODE_ENV=production
ENV PORT=9868
ENV HOST=0.0.0.0

# Expor a porta da API
EXPOSE 9868

# Healthcheck interno do contêiner (apontando para o Swagger /api para garantir resposta 200 OK)
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:${PORT}/api || exit 1

# Ponto de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]
