# Use a lightweight base image
FROM node:16-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build your Vue 3 app
RUN npm run build

# Use a lightweight web server
FROM nginx:alpine

# Copy the built files from the previous stage to the nginx default public directory
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Command to run the application
CMD ["nginx", "-g", "daemon off;"]
