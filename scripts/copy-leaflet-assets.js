// scripts/copy-leaflet-assets.js
// Run: node scripts/copy-leaflet-assets.js
// Copies Leaflet marker images to public/leaflet/ so they are served as static assets.

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'leaflet', 'dist', 'images');
const dest = path.join(__dirname, '..', 'public', 'leaflet');

if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

['marker-icon.png', 'marker-icon-2x.png', 'marker-shadow.png'].forEach((file) => {
  const srcFile = path.join(src, file);
  const destFile = path.join(dest, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`✓ Copied ${file}`);
  } else {
    console.warn(`⚠ Not found: ${srcFile}`);
  }
});

console.log('Done. Leaflet assets are in public/leaflet/');
