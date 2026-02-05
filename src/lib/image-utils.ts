/**
 * Compress and resize an image to reduce payload size
 * @param base64Image - The base64 encoded image
 * @param maxWidth - Maximum width (default 800px)
 * @param quality - JPEG quality 0-1 (default 0.7)
 * @returns Compressed base64 image
 */
export function compressImage(
  base64Image: string,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed JPEG
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image for compression"));
    };
    
    img.src = base64Image;
  });
}

/**
 * Get the size of a base64 string in bytes
 */
export function getBase64Size(base64: string): number {
  // Remove data URL prefix
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  // Base64 encodes 3 bytes into 4 characters
  return Math.ceil((base64Data.length * 3) / 4);
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
