import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const source = 'public/logo.svg';
const outputDirAndroid = 'public/icons/android';
const outputDirIOS = 'public/icons/ios';

// Create directories
[outputDirAndroid, outputDirIOS].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const androidSizes = [48, 72, 96, 144, 192, 512];
const iosSizes = [32, 152, 167, 180, 1024];

async function generate() {
    console.log('Generating icons...');

    // Android
    for (const size of androidSizes) {
        await sharp(source)
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(outputDirAndroid, `android-launchericon-${size}-${size}.png`));
        console.log(`Generated android ${size}x${size}`);
    }

    // iOS
    for (const size of iosSizes) {
        await sharp(source)
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(outputDirIOS, `${size}.png`));
        console.log(`Generated ios ${size}x${size}`);
    }

    console.log('Done!');
}

generate().catch(console.error);
