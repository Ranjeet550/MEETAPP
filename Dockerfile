FROM railwayapp/railpack-runtime:latest

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy the application files
COPY . /app

# Make start.sh executable
RUN chmod +x /app/start.sh

# Set the working directory
WORKDIR /app

# Expose the necessary ports
EXPOSE 3000 5173

# Start the application
CMD ["/app/start.sh"]