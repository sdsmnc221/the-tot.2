// main.ts - UPDATED VERSION
import { createApp } from "vue";
import "./index.css";
import "./index.scss";
import App from "./App.vue";

// Global state for image preloading with blob URLs
declare global {
  interface Window {
    imagePreloadStatus: {
      loaded: boolean;
      loadedCount: number;
      totalCount: number;
      cache: Map<string, string>; // Maps original URL to blob URL
    };
  }
}

// Preload critical images
const preloadImages = [
  "/leaping-person.gif",
  "/citiscape-monochrome.gif",
  "/citiscape-colorful.gif",
];

window.imagePreloadStatus = {
  loaded: false,
  loadedCount: 0,
  totalCount: preloadImages.length,
  cache: new Map(),
};

const loadImage = (src: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create blob URL to avoid re-downloading
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          window.imagePreloadStatus.cache.set(src, blobUrl);
          console.log(`Cached ${src} as blob: ${blobUrl}`);
        }
        window.imagePreloadStatus.loadedCount++;
        resolve(src);
      }, "image/gif"); // Specify format for GIFs
    };
    img.onerror = () => reject(src);
    img.src = src;
  });
};

const preloadAllImages = async () => {
  const timeout = new Promise((resolve) => setTimeout(resolve, 10000)); // 10 second timeout
  
  try {
    await Promise.race([
      Promise.all(preloadImages.map(loadImage)),
      timeout
    ]);
    window.imagePreloadStatus.loaded = true;
    console.log(
      "All images preloaded with blob URLs:",
      window.imagePreloadStatus.cache
    );
  } catch (error) {
    console.warn("Some images failed to preload:", error);
    window.imagePreloadStatus.loaded = true; // Continue anyway
  }
};

// Start preloading immediately
preloadAllImages();

createApp(App).mount("#app");
