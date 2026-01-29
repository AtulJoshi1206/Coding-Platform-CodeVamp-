FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install compilers and runtimes
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3 \
    openjdk-17-jdk-headless \
    golang-go \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m runner
USER runner
WORKDIR /home/runner

# No default command, will be overridden by docker exec
