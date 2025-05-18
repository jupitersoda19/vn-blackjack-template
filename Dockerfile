FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose port for Vite dev server (default is 5173)
EXPOSE 5173

# Start development server with host set to 0.0.0.0 to allow external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]