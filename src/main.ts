import { createApp } from "vue";
import "./index.css";
import "./index.scss";
import App from "./App.vue";

// Preload critical images
const preloadImages = [
  "/leaping-person.gif",
  "/citiscape-monochrome.gif",
  "/citiscape-colorful.gif",
];

const loadImage = (src: String) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(src);
    img.src = src as any;
  });
};

const preloadAllImages = async () => {
  try {
    await Promise.all(preloadImages.map(loadImage));
    console.log("All images preloaded successfully");
  } catch (error) {
    console.warn("Some images failed to preload:", error);
  }
};

// Start preloading immediately
preloadAllImages();

createApp(App).mount("#app");
