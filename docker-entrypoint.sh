#!/bin/sh
set -e

echo "=================================================="
echo "🚀 Iniciando ambiente EcoAtende (Bun)"
echo "=================================================="

# Aguarda o banco de dados ficar disponível antes de migrar
MAX_RETRIES=10
RETRY_INTERVAL=5
RETRY_COUNT=0

echo "📦 Executando migrações do banco de dados (Prisma)..."

until bunx prisma migrate deploy; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "❌ Falha ao executar migrações após $MAX_RETRIES tentativas. Iniciando servidor mesmo assim..."
    break
  fi
  echo "⏳ Banco de dados não disponível. Tentativa $RETRY_COUNT/$MAX_RETRIES. Aguardando ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo "✅ Migrações processadas!"
echo "🌐 Iniciando servidor NestJS com Bun..."

# Utilizando o binário do Bun para rodar o build do NestJS
exec bun dist/src/main.js
