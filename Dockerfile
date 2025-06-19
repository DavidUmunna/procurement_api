
FROM node:20-slim

# Create a non-root user and group
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Set working directory
WORKDIR /usr/src/app

# Copy only package.json first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the app
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Drop privileges to non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "src/server.js"]
