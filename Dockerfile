# Dockerfile for Node.js application

# Use official Node.js image as base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 5555

# Start the application
CMD ["npm", "start"]
