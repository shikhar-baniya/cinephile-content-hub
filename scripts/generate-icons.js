// Icon generation script for BingeBook
// This script can be used to generate all required favicon and PWA icons

const fs = require('fs');
const path = require('path');

// Define all the required icon sizes
const iconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 }
];

// Function to generate SVG for a specific size
function generateSVG(size) {
  const strokeWidth = Math.max(1, size / 20);
  const cornerRadius = Math.max(4, size / 8);
  const padding = Math.max(4, size / 8);
  const filmStripWidth = size - (padding * 2);
  const filmStripHeight = Math.max(12, size * 0.6);
  const filmStripX = padding;
  const filmStripY = (size - filmStripHeight) / 2;
  const holeRadius = Math.max(1, size / 25);
  const holeOffsetX = filmStripWidth * 0.15;
  const holeSpacing = filmStripHeight / 4;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#grad)"/>
  
  <!-- Film strip -->
  <rect x="${filmStripX}" y="${filmStripY}" width="${filmStripWidth}" height="${filmStripHeight}" rx="${Math.max(1, cornerRadius/2)}" fill="none" stroke="white" stroke-width="${strokeWidth}"/>
  
  <!-- Left holes -->
  <circle cx="${filmStripX + holeOffsetX}" cy="${filmStripY + holeSpacing}" r="${holeRadius}" fill="white"/>
  <circle cx="${filmStripX + holeOffsetX}" cy="${filmStripY + holeSpacing * 2}" r="${holeRadius}" fill="white"/>
  <circle cx="${filmStripX + holeOffsetX}" cy="${filmStripY + holeSpacing * 3}" r="${holeRadius}" fill="white"/>
  
  <!-- Right holes -->
  <circle cx="${filmStripX + filmStripWidth - holeOffsetX}" cy="${filmStripY + holeSpacing}" r="${holeRadius}" fill="white"/>
  <circle cx="${filmStripX + filmStripWidth - holeOffsetX}" cy="${filmStripY + holeSpacing * 2}" r="${holeRadius}" fill="white"/>
  <circle cx="${filmStripX + filmStripWidth - holeOffsetX}" cy="${filmStripY + holeSpacing * 3}" r="${holeRadius}" fill="white"/>
  
  <!-- Center screen -->
  <rect x="${filmStripX + filmStripWidth * 0.35}" y="${filmStripY + holeSpacing * 0.8}" width="${filmStripWidth * 0.3}" height="${holeSpacing * 2.4}" rx="${Math.max(1, cornerRadius/4)}" fill="white" opacity="0.9"/>
</svg>`;
}

// Generate SVG files for each size
iconSizes.forEach(({ name, size }) => {
  const svgContent = generateSVG(size);
  const svgPath = path.join(__dirname, '../public', name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Generated ${name.replace('.png', '.svg')}`);
});

console.log('\nSVG files generated! To convert to PNG:');
console.log('1. Use online converter like https://svgtopng.com/');
console.log('2. Or use ImageMagick: convert icon.svg icon.png');
console.log('3. Or use Inkscape: inkscape --export-png=icon.png icon.svg');
console.log('\nFor favicon.ico, combine 16x16 and 32x32 PNG files using:');
console.log('- Online tool: https://favicon.io/favicon-converter/');
console.log('- Or ImageMagick: convert favicon-16x16.png favicon-32x32.png favicon.ico');