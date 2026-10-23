# syntax=docker/dockerfile:1

# ---- Build stage: install exact dependencies and build the static files ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage: only Nginx and the built files, no Node ----
FROM nginx:1.29-alpine
# The official image fills ${VARIABLES} in /etc/nginx/templates/*.template when it starts.
ENV API_UPSTREAM=http://api:8000
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
