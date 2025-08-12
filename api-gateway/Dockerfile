# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Use environment variables
ENV PORT=3000

# Expose gateway port
EXPOSE 3000

# Start the gateway
CMD ["node", "index.js"]
