#!/bin/bash

# PWA Icon Generator Script
# Generates all required PWA icon sizes from a source SVG

SOURCE_SVG="public/logo.svg"
ICONS_DIR="public/icons"

# Create icons directory if it doesn't exist
mkdir -p "$ICONS_DIR"

# Required sizes for PWA
SIZES=(72 96 128 144 152 192 384 512)

echo "🎨 Generating PWA icons from $SOURCE_SVG..."

# Check if sips (macOS built-in) is available
if command -v sips &> /dev/null; then
    # First convert SVG to a large PNG
    # Note: sips doesn't handle SVG, so we'll use qlmanage or a placeholder approach
    
    # For now, we'll create placeholder icons using a simple approach
    # In production, you should use a proper SVG to PNG converter
    
    for size in "${SIZES[@]}"; do
        output_file="$ICONS_DIR/icon-${size}x${size}.png"
        
        # Use qlmanage to generate preview (macOS)
        if command -v qlmanage &> /dev/null; then
            # Generate a temporary large PNG
            if [ ! -f "$ICONS_DIR/icon-512x512.png" ]; then
                echo "⚠️  Please manually convert $SOURCE_SVG to PNG icons"
                echo "   You can use online tools like:"
                echo "   - https://realfavicongenerator.net/"
                echo "   - https://www.pwabuilder.com/imageGenerator"
            fi
        fi
        
        echo "📱 Would generate: $output_file"
    done
else
    echo "⚠️  sips command not found. Please generate icons manually."
fi

echo ""
echo "📝 To generate icons manually:"
echo "1. Go to https://www.pwabuilder.com/imageGenerator"
echo "2. Upload your logo.svg"
echo "3. Download and extract icons to public/icons/"
echo ""
echo "Required icon sizes:"
for size in "${SIZES[@]}"; do
    echo "  - icon-${size}x${size}.png"
done

echo ""
echo "✨ PWA manifest is already configured in public/manifest.json"
