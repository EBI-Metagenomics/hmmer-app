# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# Development stage
FROM node:22-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci

ADD . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Production stage
FROM nginx:alpine AS production

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
