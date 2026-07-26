FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Create uploads and logs directories
RUN mkdir -p uploads logs data

EXPOSE 5000

# Use --watch for development
CMD ["node", "--watch", "index.js"]