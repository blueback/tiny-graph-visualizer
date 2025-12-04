#!/bin/bash

# Set the project and Vite directories
#PROJECT_DIR="my-local-node-project"
VITE_PROJECT_DIR="live-documentation-frontend-bundle"

# Create project directory if it doesn't exist
#mkdir -p $PROJECT_DIR
#cd $PROJECT_DIR

# Step 1: Check if NVM is already installed locally
if [ ! -d ".nvm" ]; then
  echo "NVM not found. Installing NVM locally..."

  # Clone the NVM repository if not already installed
  git clone https://github.com/nvm-sh/nvm.git .nvm
else
  echo "NVM is already installed locally."
fi

# Source NVM
export NVM_DIR="$PWD/.nvm"
# For bash shell, you can add the following line to `.bashrc` for permanent access:
# export NVM_DIR="$PWD/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Source nvm
. .nvm/nvm.sh

# Step 2: Check if Node.js and npm are already installed locally
if [ ! -d ".nvm/versions/node/$(node -v)/" ]; then
  echo "Node.js and npm not found. Installing Node.js..."

  # Install the latest version of Node.js and npm using nvm
  nvm install node
else
  echo "Node.js and npm are already installed."
fi

nvm use node

# Verify that Node.js and npm are installed locally
node -v
npm -v

# Step 3: Check if the Vite project directory already exists
if [ ! -d "$VITE_PROJECT_DIR" ]; then
  echo "Creating subdirectory '$VITE_PROJECT_DIR' for Vite..."
  mkdir -p $VITE_PROJECT_DIR
fi

cd $VITE_PROJECT_DIR

# Step 4: Check if Vite has already been initialized
if [ ! -d "node_modules" ]; then
  echo "Vite project not found. Setting up Vite project..."

  # Use npx to create the Vite project (locally installed)
  $PWD/../.nvm/versions/node/$(node -v)/bin/npx create-vite@latest .

  # Install Vite project dependencies
  $PWD/../.nvm/versions/node/$(node -v)/bin/npm install

else
  echo "Vite project already set up."
fi

if [ ! -d "node_modules/viz.js" ]; then
  # Install viz.js project dependencies
  $PWD/../.nvm/versions/node/$(node -v)/bin/npm install viz.js
fi

# Step 5: The Vite development server is running
echo "Starting the Vite development server..."
$PWD/../.nvm/versions/node/$(node -v)/bin/npm run dev

# Step 6: The frontend is build for production
echo "Building frontend..."
$PWD/../.nvm/versions/node/$(node -v)/bin/npm run build

