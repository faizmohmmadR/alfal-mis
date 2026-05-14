#!/bin/bash

set -e

echo "Installing Vazirmatn font for Persian and Pashto support..."

# Create fonts directory
mkdir -p ~/.fonts

# Download font files directly
echo "Downloading Vazirmatn font files..."
cd ~/.fonts

# Download main font variants
wget -q https://github.com/rastikerdar/vazirmatn/raw/master/fonts/ttf/Vazirmatn-Regular.ttf -O Vazirmatn-Regular.ttf 2>/dev/null || \
wget -q https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Regular.ttf -O Vazirmatn-Regular.ttf

wget -q https://github.com/rastikerdar/vazirmatn/raw/master/fonts/ttf/Vazirmatn-Bold.ttf -O Vazirmatn-Bold.ttf 2>/dev/null || \
wget -q https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Bold.ttf -O Vazirmatn-Bold.ttf

wget -q https://github.com/rastikerdar/vazirmatn/raw/master/fonts/ttf/Vazirmatn-Medium.ttf -O Vazirmatn-Medium.ttf 2>/dev/null || \
wget -q https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Medium.ttf -O Vazirmatn-Medium.ttf

echo "Updating font cache..."
fc-cache -f ~/.fonts

echo ""
echo "✓ Vazirmatn font installed successfully!"
echo "✓ Persian and Pashto text will now display correctly in all pages"
echo ""
echo "Installed fonts:"
ls -1 ~/.fonts/Vazirmatn*.ttf 2>/dev/null || echo "  (fonts installed but listing failed)"
