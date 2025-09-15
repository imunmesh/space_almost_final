#!/bin/bash
# GitHub Upload Helper Script for AstroHELP

echo "🚀 AstroHELP GitHub Upload Helper"
echo "=================================="

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"

# Initialize repository if not already done
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
echo "📦 Adding all files to Git..."
git add .
echo "✅ All files added"

# Check status
echo "🔍 Git status:"
git status

# Create initial commit
echo "📝 Creating initial commit..."
git commit -m "Initial commit: AstroHELP - Advanced Space Tourism & Management System"
echo "✅ Initial commit created"

echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub (https://github.com/new)"
echo "2. Don't initialize it with README, .gitignore, or license"
echo "3. Run the following commands in your terminal:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git push -u origin main"
echo ""
echo "🎉 Your AstroHELP project will be uploaded to GitHub!"