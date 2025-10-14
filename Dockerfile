# syntax=docker/dockerfile:1

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.25-alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/eye-sense-front/browser/ /usr/share/nginx/html
COPY docker/entrypoint.d/ /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/*

EXPOSE 80
