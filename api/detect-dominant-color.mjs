// api/check-dominant-color.js

import sharp from "sharp";

export const config = {
  maxDuration: 10, // 10 seconds timeout
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageUrl, threshold = 35 } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    // Fetch image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();

    // Get raw pixel data
    const { data, info } = await sharp(Buffer.from(imageBuffer))
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

    // Build color analysis
    const colors = sortedColors.map(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(",").map(Number);
      const percentage = ((count / totalPixels) * 100).toFixed(2);
      const hex =
        "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

      return {
        percentage: parseFloat(percentage),
        rgb: { r, g, b },
        hex,
      };
    });

    // Check if most dominant color exceeds threshold
    const maxCount = sortedColors[0][1];
    const dominantPercentage = (maxCount / totalPixels) * 100;
    const hasDominantColor = dominantPercentage >= threshold;

    return res.status(200).json({
      hasDominantColor,
      dominantPercentage: parseFloat(dominantPercentage.toFixed(2)),
      threshold,
      colors,
      totalPixels,
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return res.status(500).json({
      error: "Failed to analyze image",
      message: error.message,
    });
  }
}
