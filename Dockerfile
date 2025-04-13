# Use an official Node.js runtime as a parent image.
FROM node:18-alpine

# Set the working directory in the container.
WORKDIR /app

# Copy package files and install dependencies.
COPY package*.json ./
RUN npm install --force

# Copy the rest of the application code.
COPY . .

# Expose the port where the Next.js dev server will run.
EXPOSE 3000

# Run the application in development mode.
CMD ["npm", "run", "dev"]

