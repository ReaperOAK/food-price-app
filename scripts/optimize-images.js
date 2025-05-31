const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [300, 600, 900, 1200];
const quality = 80;
const supportedFormats = /\.(jpg|jpeg|png|webp)$/i;

// Configure sharp for better performance
sharp.cache(false); // Disable caching to prevent memory issues
sharp.concurrency(1); // Limit concurrency to prevent memory issues

async function optimizeImage(inputPath) {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const extLower = ext.toLowerCase() || ext;
  const basename = path.basename(inputPath, ext);
  
  try {
    // Skip if already processed
    if (basename.match(/-\d+$/)) {
      return;
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Don't create larger versions than original
    const targetSizes = sizes.filter(size => size <= metadata.width);
    
    // Create optimized versions directory
    const optimizedDir = path.join(dir, 'optimized');
    await ensureDirectoryExists(optimizedDir);
    
    // Process each target size
    for (const width of targetSizes) {
      const outputPath = path.join(optimizedDir, `${basename}-${width}.webp`);
      
      // Skip if already exists and newer than source
      try {
        const outputStat = await fs.stat(outputPath);
        const inputStat = await fs.stat(inputPath);
        if (outputStat.mtime > inputStat.mtime) {
          console.log(`Skipping ${outputPath} - already up to date`);
          continue;
        }
      } catch (e) {
        // File doesn't exist, continue with processing
      }
      
      await image
        .clone()
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ 
          quality,
          effort: 6, // Higher compression effort
          reductionEffort: 6 // More aggressive size reduction
        })
        .toFile(outputPath);
        
      console.log(`Created: ${outputPath}`);
    }
    
    // Optimize original size if not already webp
    if (extLower !== '.webp') {
      const originalOptimized = path.join(optimizedDir, `${basename}.webp`);
      await image
        .webp({ 
          quality,
          effort: 6,
          reductionEffort: 6
        })
        .toFile(originalOptimized);
      console.log(`Created original optimized: ${originalOptimized}`);
    }
      
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

async function ensureDirectoryExists(directory) {
  try {
    await fs.access(directory);
  } catch (error) {
    await fs.mkdir(directory, { recursive: true });
  }
}

async function processDirectory(directory) {
  try {
    const files = await fs.readdir(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        await processDirectory(filePath);
      } else if (supportedFormats.test(file)) {
        console.log(`Processing: ${filePath}`);
        await optimizeImage(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

console.log('Starting image optimization...');
const directories = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../build'),
  path.resolve(__dirname, '../src/assets')
];
Promise.all(directories.map(processDirectory))
  .then(() => console.log('Image optimization complete'))
  .catch(console.error);
