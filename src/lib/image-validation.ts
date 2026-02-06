"use client";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an uploaded image for quality and card detection
 */
export async function validateCardImage(imageBase64: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      // Check 1: Minimum dimensions
      const minDimension = 200;
      if (img.width < minDimension || img.height < minDimension) {
        resolve({
          valid: false,
          error: "Image is too small. Please upload a clearer photo.",
        });
        return;
      }

      // Check 2: Aspect ratio (should be roughly portrait or square, not extreme)
      const aspectRatio = img.width / img.height;
      if (aspectRatio > 3 || aspectRatio < 0.33) {
        resolve({
          valid: false,
          error: "Image has unusual proportions. Please upload a photo of just the card.",
        });
        return;
      }

      // Create canvas for pixel analysis
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        resolve({ valid: true }); // Can't analyze, allow through
        return;
      }

      // Scale down for faster processing
      const maxSize = 300;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Check 3: Image variance (not blank/solid color)
      const variance = calculateColorVariance(pixels);
      if (variance < 500) {
        resolve({
          valid: false,
          error: "Image appears blank or has very low contrast. Please upload a clearer photo.",
        });
        return;
      }

      // Check 4: Detect card-like rectangular shape
      const hasCardShape = detectCardShape(ctx, canvas.width, canvas.height);
      if (!hasCardShape) {
        resolve({
          valid: false,
          error: "No card detected in the image. Please make sure the card is clearly visible.",
        });
        return;
      }

      // Check 5: Check for blur (edge sharpness)
      const sharpness = calculateSharpness(pixels, canvas.width, canvas.height);
      if (sharpness < 5) {
        resolve({
          valid: false,
          error: "Image appears blurry. Please take a clearer photo with better focus.",
        });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      resolve({
        valid: false,
        error: "Could not load the image. Please try again with a different photo.",
      });
    };

    img.src = imageBase64;
  });
}

/**
 * Calculate color variance to detect blank/solid images
 */
function calculateColorVariance(pixels: Uint8ClampedArray): number {
  let sumR = 0, sumG = 0, sumB = 0;
  let sumR2 = 0, sumG2 = 0, sumB2 = 0;
  const pixelCount = pixels.length / 4;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    sumR += r;
    sumG += g;
    sumB += b;
    sumR2 += r * r;
    sumG2 += g * g;
    sumB2 += b * b;
  }

  const varR = (sumR2 / pixelCount) - Math.pow(sumR / pixelCount, 2);
  const varG = (sumG2 / pixelCount) - Math.pow(sumG / pixelCount, 2);
  const varB = (sumB2 / pixelCount) - Math.pow(sumB / pixelCount, 2);

  return varR + varG + varB;
}

/**
 * Calculate image sharpness using Laplacian variance
 */
function calculateSharpness(pixels: Uint8ClampedArray, width: number, height: number): number {
  // Convert to grayscale
  const gray: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    gray.push(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
  }

  // Apply Laplacian operator
  let sum = 0;
  let sum2 = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const laplacian = 
        -gray[idx - width] - gray[idx - 1] + 4 * gray[idx] - gray[idx + 1] - gray[idx + width];
      
      sum += laplacian;
      sum2 += laplacian * laplacian;
      count++;
    }
  }

  const mean = sum / count;
  const variance = (sum2 / count) - (mean * mean);
  
  return variance;
}

/**
 * Detect if the image contains a card-like rectangular shape
 * Uses edge detection and contour analysis
 */
function detectCardShape(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  // Convert to grayscale
  const gray: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    gray.push(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
  }

  // Simple edge detection using Sobel operator
  const edges: number[] = new Array(width * height).fill(0);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Sobel X
      const gx = 
        -gray[idx - width - 1] + gray[idx - width + 1] +
        -2 * gray[idx - 1] + 2 * gray[idx + 1] +
        -gray[idx + width - 1] + gray[idx + width + 1];
      
      // Sobel Y
      const gy = 
        -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1] +
        gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1];
      
      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Find edge threshold (adaptive)
  const sortedEdges = [...edges].sort((a, b) => b - a);
  const threshold = sortedEdges[Math.floor(edges.length * 0.1)] * 0.5;

  // Count strong edges
  let strongEdgeCount = 0;
  for (const edge of edges) {
    if (edge > threshold) strongEdgeCount++;
  }

  const edgeRatio = strongEdgeCount / edges.length;

  // Check for horizontal and vertical edges (card characteristics)
  let horizontalEdges = 0;
  let verticalEdges = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (edges[idx] > threshold) {
        // Check if predominantly horizontal or vertical
        const dx = Math.abs(gray[idx + 1] - gray[idx - 1]);
        const dy = Math.abs(gray[idx + width] - gray[idx - width]);
        
        if (dx > dy * 1.5) horizontalEdges++;
        else if (dy > dx * 1.5) verticalEdges++;
      }
    }
  }

  // Card should have both horizontal and vertical edges (rectangle)
  const hasRectangularEdges = horizontalEdges > strongEdgeCount * 0.15 && 
                              verticalEdges > strongEdgeCount * 0.15;

  // Check center region has content (card typically centered)
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const regionSize = Math.floor(Math.min(width, height) * 0.3);
  
  let centerVariance = 0;
  let centerCount = 0;
  
  for (let y = centerY - regionSize; y < centerY + regionSize && y < height; y++) {
    for (let x = centerX - regionSize; x < centerX + regionSize && x < width; x++) {
      if (y >= 0 && x >= 0) {
        const idx = y * width + x;
        centerVariance += gray[idx];
        centerCount++;
      }
    }
  }
  
  const centerMean = centerVariance / centerCount;
  let centerVar = 0;
  
  for (let y = centerY - regionSize; y < centerY + regionSize && y < height; y++) {
    for (let x = centerX - regionSize; x < centerX + regionSize && x < width; x++) {
      if (y >= 0 && x >= 0) {
        const idx = y * width + x;
        centerVar += Math.pow(gray[idx] - centerMean, 2);
      }
    }
  }
  centerVar /= centerCount;

  const hasCenterContent = centerVar > 200;

  // Combined check: needs edges and center content
  const isLikelyCard = edgeRatio > 0.02 && edgeRatio < 0.5 && 
                       hasRectangularEdges && hasCenterContent;

  return isLikelyCard;
}
