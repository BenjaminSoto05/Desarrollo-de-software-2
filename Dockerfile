# ============================================================================
# Dockerfile Multi-Stage — UCT-Vínculo Mayor
# Equivalente al Dockerfile Python de los compañeros, adaptado a Node.js
# Stage 1: Build del frontend React
# Stage 2: Servidor Node.js + archivos estáticos
# ============================================================================

# --- Stage 1: Build del frontend React ---
FROM node:22-alpine AS frontend-build

WORKDIR /app/client

# Copiar dependencias del frontend y instalar
COPY client/package*.json ./
RUN npm ci

# Copiar código fuente y compilar
COPY client/ ./
RUN npm run build

# --- Stage 2: Servidor Node.js ---
FROM node:22-alpine

# Evita que Node escriba archivos innecesarios
ENV NODE_ENV=production

# Instalar dependencias del sistema para Prisma
RUN apk add --no-cache openssl

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias del backend y instalar (solo producción)
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copiar Prisma schema y generar cliente
COPY server/prisma ./prisma
RUN npx prisma generate

# Copiar código fuente del backend
COPY server/src ./src

# Copiar frontend compilado para servir estáticamente
COPY --from=frontend-build /app/client/dist ./public

# Crear directorio de logs
RUN mkdir -p /app/logs

# Exponer el puerto del servidor Node.js
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Comando de inicio
CMD ["node", "src/server.js"]
