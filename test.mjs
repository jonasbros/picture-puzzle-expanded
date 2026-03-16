/**
 * Using sharp for accurate color detection with real percentages
 *
 * Install: npm install sharp node-fetch
 *
 * Works with both URLs and local file paths
 */

import sharp from "sharp";
import fetch from "node-fetch";

/**
 * Detects if an image has a dominant color
 *
 * @param {string} imagePath - Path to image file or URL (e.g., './image.jpg' or 'https://...')
 * @param {number} threshold - Percentage (0-100) needed to be considered dominant (default: 30)
 * @returns {Promise<boolean>} True if image has a dominant color
 */
async function hasDominantColor(imagePath, threshold = 30) {
  if (typeof imagePath !== "string") {
    throw new Error("imagePath must be a string");
  }

  try {
    let imageBuffer;

    // Handle URL vs file path
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      const response = await fetch(imagePath);
      imageBuffer = await response.buffer();
    } else {
      imageBuffer = imagePath;
    }

    // Get raw pixel data
    const { data, info } = await sharp(imageBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const colorMap = new Map();
    let totalPixels = 0;

    // Count each color (quantize to group similar colors)
    for (let i = 0; i < data.length; i += info.channels) {
      const r = Math.floor(data[i] / 32) * 32;
      const g = Math.floor(data[i + 1] / 32) * 32;
      const b = Math.floor(data[i + 2] / 32) * 32;

      const colorKey = `${r},${g},${b}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      totalPixels++;
    }

    // Sort colors by frequency
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 colors

    // Log each color with REAL percentage
    console.log("\n=== Color Analysis ===");
    sortedColors.forEach(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(",").map(Number);
      const percentage = ((count / totalPixels) * 100).toFixed(2);
      const hex =
        "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
      console.log(`${percentage}% | RGB(${r}, ${g}, ${b}) | ${hex}`);
    });
    console.log("=====================\n");

    // Check if most dominant color exceeds threshold
    const maxCount = sortedColors[0][1];
    const dominantPercentage = (maxCount / totalPixels) * 100;

    return dominantPercentage >= threshold;
  } catch (error) {
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

// Example usage:
hasDominantColor(
  "https://images.pexels.com/photos/35759694/pexels-photo-35759694.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  40,
)
  .then((isDominant) => {
    console.log("Has dominant color:", isDominant);
  })
  .catch((err) => console.error(err));

export { hasDominantColor };
