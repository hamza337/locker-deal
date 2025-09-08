#!/bin/bash

APP_NAME="locker-deal"
APP_BASE="$HOME"
APP_DIR="$APP_BASE/$APP_NAME"
REPO_URL="https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/${GIT_USERNAME}/$APP_NAME.git"

echo "🔧 Checking prerequisites..."
echo "🖥️ EC2 Public IP: $(curl -s http://checkip.amazonaws.com)"

# Install Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Git
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    sudo apt-get install git -y
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Install serve for static hosting
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve..."
    sudo npm install -g serve
fi

echo "🚀 Preparing $APP_NAME directory..."
mkdir -p $APP_BASE
cd $APP_BASE

# Clone or update repo
if [ -d "$APP_DIR/.git" ]; then
    echo "🔄 Updating existing repo..."
    cd $APP_DIR
    git reset --hard
    git fetch origin
    git checkout main
    git pull origin main
else
    echo "⬇️ Cloning fresh repo..."
    rm -rf $APP_DIR
    git clone $REPO_URL $APP_DIR || { echo "❌ Git clone failed"; exit 1; }
    cd $APP_DIR
fi

echo "📦 Installing dependencies..."
npm install || { echo "❌ npm install failed"; exit 1; }

echo "🛠 Building React app..."
npm run build || { echo "❌ Build failed"; exit 1; }

# Check build output
if [ ! -d build ]; then
    echo "❌ Build directory not found!"
    exit 1
fi

echo "🔁 Restarting frontend with PM2..."

# Start or restart PM2 serve process
if pm2 list | grep -q "$APP_NAME"; then
    echo "♻️ Restarting existing PM2 process..."
    pm2 restart $APP_NAME
else
    echo "🚀 Starting new PM2 serve process..."
    pm2 start "serve -s build -l 3000" --name $APP_NAME
fi

pm2 save

echo "✅ React frontend deployed and running on port 3000."