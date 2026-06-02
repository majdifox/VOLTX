# ============================================
# VoltX Frontend Dockerfile (React + Vite)
# Multi-stage build: Build app + Serve with Nginx
# ============================================

# Stage 1: Build the React application
FROM node:26-alpine AS build

WORKDIR /app

# Copy package files first (for better Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the production-ready app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (for React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
