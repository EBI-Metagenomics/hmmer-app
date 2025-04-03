# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# # Copy production env file
# COPY prod.env .env

# Build the app
RUN npm run build

# Development stage
FROM node:22-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm install

ADD . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Production stage
FROM nginx:alpine AS production

# # Copy nginx configuration
COPY app-nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]