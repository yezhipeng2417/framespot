#!/bin/bash

# Script to manually trigger the web deployment workflow

echo "=== FrameSpot Web Deployment ==="
echo "This script will trigger the EAS Hosting deployment workflow."
echo ""

# Make sure EAS CLI is installed
if ! command -v eas &> /dev/null; then
  echo "EAS CLI not found. Installing..."
  npm install -g eas-cli
fi

# Check if user is logged in
eas whoami || (echo "Please log in to EAS" && eas login)

# Run the workflow
echo "Triggering deployment workflow..."
npx eas-cli workflow:run .eas/workflows/deploy-web.yml

echo ""
echo "Workflow triggered. Check progress in the EAS Dashboard: https://expo.dev/accounts/{YOUR_ACCOUNT}/projects/{YOUR_PROJECT}/workflows" 