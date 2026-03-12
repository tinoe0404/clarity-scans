const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Create directory if not exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Ensure sharp is available for script
try {
    require.resolve('sharp');
} catch (_e) {
    console.log('Installing sharp to generate placeholder PWA icons...');
    execSync('npm install --no-save sharp', { stdio: 'inherit' });
}

const sharp = require('sharp');

async function generateIcons() {
    console.log('Generating placeholder icons in public/icons/...');
    for (const size of sizes) {
        const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);
        
        // Use sharp to create a valid PNG with the exact dimensions
        // Note: Actual icons should be generated from brand design.
        // These placeholders are valid PNGs so the PWA install prompt doesn't fail.
        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 255, g: 107, b: 0, alpha: 1 } // #ff6b00 brand color
            }
        })
        .png()
        .toFile(filePath);
        
        console.log(`Created: ${filePath}`);
    }
    console.log('Done!');
}

generateIcons().catch(console.error);
