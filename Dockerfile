# Dockerfile simples para Angular
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação para produção
RUN npm run build:prod

# Instalar servidor HTTP simples
RUN npm install -g http-server

# Expor porta 8080
EXPOSE 8080

# Comando para servir a aplicação
CMD ["http-server", "dist/eye-sense-front/browser", "-p", "8080", "--cors"]
