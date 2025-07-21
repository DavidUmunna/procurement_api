# Use Node.js base image
FROM node:18
RUN useradd -ms /bin/sh -u 1001 app
USER app
# Set working directory
WORKDIR /app

# Copy files
COPY . .
COPY --chown=app:app . /app
# Install dependencies
RUN npm install

# Expose the backend port (e.g., 5000)
EXPOSE 5000

# Run the app
CMD ["npm", "start"]
