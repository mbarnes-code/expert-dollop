# Base image with Python and Node.js
FROM mcr.microsoft.com/devcontainers/python:1-3.12-bookworm

ARG NODE_VERSION="22"
ARG VARIANT="3.12-bookworm"

# Install Node.js
RUN if [ "${NODE_VERSION}" != "none" ]; then su vscode -c "umask 0002 && . /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} 2>&1"; fi

# Install pnpm globally
RUN npm install -g pnpm@latest

# Enable corepack for package manager management
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install additional system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential \
    curl \
    git \
    libpq-dev \
    postgresql-client \
    vim \
    wget \
    # Tools for desktop-lite feature
    tigervnc-standalone-server \
    tigervnc-common \
    fluxbox \
    dbus-x11 \
    x11-utils \
    x11-xserver-utils \
    xdg-utils \
    # Additional development tools
    cmake \
    ninja-build \
    pkg-config \
    libssl-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python tools
RUN pip install --upgrade pip \
    && pip install \
    black \
    ruff \
    mypy \
    pylint \
    pytest \
    coverage \
    autopep8 \
    yapf

# Install Rust (will be enhanced by the rust feature)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Set up workspace directory
WORKDIR /workspaces/expert-dollop

# Ensure proper permissions
RUN chown -R vscode:vscode /workspaces

# Switch to vscode user for safety
USER vscode
