
# Use the official Node.js 20 image as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Install dependencies needed for running the application
RUN apt-get update && apt-get install -y --no-install-recommends openssl

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Command to run the application
CMD ["npm", "start"]
