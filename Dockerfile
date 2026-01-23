FROM node:20-alpine

# Copy the application files
COPY . /app

# Make scripts executable
RUN chmod +x /app/start.sh /app/render-build.sh

# Set the working directory
WORKDIR /app

# Install dependencies and build
RUN /app/render-build.sh

# Expose the necessary ports
EXPOSE 3000 5173

# Start the application
CMD ["/app/start.sh"]