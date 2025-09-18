# Multi-stage build for AddisVerify KYC SDK
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the SDK
RUN npm run build

# Production stage for development server
FROM node:18-alpine AS development

# Install serve for static file serving
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built SDK
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/test-project ./test-project
COPY --from=builder /app/examples ./examples
COPY --from=builder /app/README.md ./
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3004/ || exit 1

# Start development server
CMD ["serve", "-s", ".", "-l", "3004"]
