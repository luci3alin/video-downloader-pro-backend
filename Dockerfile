# Use official Node.js runtime as base
FROM node:18-slim

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
RUN npm ci --only=production

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make Python script executable
RUN chmod +x youtube_quality.py

# Create a non-root user
RUN useradd -r -u 1001 -g root appuser
RUN chown -R appuser:root /app
USER appuser

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "server.js"]
