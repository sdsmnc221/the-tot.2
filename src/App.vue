<script setup lang="ts">
import {
  type TemplateRef,
  type Ref,
  ref,
  computed,
  onMounted,
  nextTick,
} from "vue";
import { inject } from "@vercel/analytics";

import { Play, Pause } from "lucide-vue-next";
import LiquidRainbowButton from "./components/LiquidRainbowButton.vue";
import TicketGenerator from "./components/TicketGenerator.vue";
import Loader from "./components/Loader.vue";
import MorphingText from "./components/MorphingText.vue";

const isFrameLoading: Ref<boolean> = ref(true);
const isTeaserLoading: Ref<boolean> = ref(true);
const isImagesLoading: Ref<boolean> = ref(true);

const videoTeaser: TemplateRef<HTMLVideoElement> = ref(null);

const frame: TemplateRef<HTMLImageElement> = ref(null);

const isVideoPlaying: Ref<boolean> = ref(false);

const showTicketGenerator: Ref<boolean> = ref(false);

const isAllLoading = computed(
  () => isFrameLoading.value || isTeaserLoading.value || isImagesLoading.value
);

const playVideoTeaser = () => {
  let e = videoTeaser.value;
  if (e) {
    if (e.paused) {
      e.play();
    } else {
      e.pause();
    }

    isVideoPlaying.value = !e.paused;
  }
};

const skipToTicketGenerator = () => {
  showTicketGenerator.value = true;
};

const handleFrameLoaded = () => {
  isFrameLoading.value = false;
};

const handleTeaserLoaded = () => {
  isTeaserLoading.value = false;
};

const checkImagePreloadStatus = () => {
  let interval: any;
  let timeoutId: any;
  const maxWaitTime = 15000; // 15 seconds max wait time

  const startTime = Date.now();

  const checkStatus = () => {
    if (window.imagePreloadStatus?.loaded) {
      isImagesLoading.value = false;
      if (interval) {
        clearInterval(interval);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    } else if (Date.now() - startTime >= maxWaitTime) {
      // Timeout reached, continue anyway
      console.warn(
        "Image preloading timeout reached, continuing with app load"
      );
      isImagesLoading.value = false;
      if (interval) {
        clearInterval(interval);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  // Initial check
  checkStatus();

  // Keep checking every 100ms
  if (!window.imagePreloadStatus?.loaded) {
    interval = setInterval(checkStatus, 100);

    // Set a hard timeout
    timeoutId = setTimeout(() => {
      console.warn("Image preloading hard timeout reached");
      isImagesLoading.value = false;
      if (interval) {
        clearInterval(interval);
      }
    }, maxWaitTime);
  }
};

/**
 * Safari-compatible video ready check
 * Safari may not fire 'canplaythrough' reliably, especially without user interaction
 */
const setupVideoLoading = (video: HTMLVideoElement) => {
  const videoTimeout = 5000; // 5 second timeout for video
  let videoTimeoutId: any;
  let resolved = false;

  const markVideoReady = () => {
    if (resolved) return;
    resolved = true;
    handleTeaserLoaded();
    if (videoTimeoutId) clearTimeout(videoTimeoutId);
  };

  // Try multiple events - Safari may fire different ones
  video.addEventListener("canplaythrough", markVideoReady);
  video.addEventListener("loadeddata", markVideoReady); // More reliable on Safari
  video.addEventListener("loadedmetadata", () => {
    // If we have metadata and some data, consider it ready enough
    if (video.readyState >= 2) {
      markVideoReady();
    }
  });

  // Check if already ready (can happen if cached)
  if (video.readyState >= 3) {
    markVideoReady();
  }

  // Fallback timeout for Safari - don't block forever
  videoTimeoutId = setTimeout(() => {
    if (!resolved) {
      console.warn("Video loading timeout reached (Safari workaround)");
      markVideoReady();
    }
  }, videoTimeout);

  // Other event listeners
  video.addEventListener("click", playVideoTeaser);
  video.addEventListener("ended", () => {
    isVideoPlaying.value = false;
    showTicketGenerator.value = true;
  });
};

/**
 * Safari-compatible image load check
 */
const setupFrameLoading = (img: HTMLImageElement) => {
  const imgTimeout = 8000; // 8 second timeout for GIF
  let imgTimeoutId: any;

  const markFrameReady = () => {
    handleFrameLoaded();
    if (imgTimeoutId) clearTimeout(imgTimeoutId);
  };

  // Check if already loaded (cached)
  if (img.complete && img.naturalHeight !== 0) {
    markFrameReady();
    return;
  }

  img.addEventListener("load", markFrameReady);
  img.addEventListener("error", () => {
    console.error("Frame image failed to load");
    markFrameReady(); // Don't block on error
  });

  // Fallback timeout
  imgTimeoutId = setTimeout(() => {
    console.warn("Frame loading timeout reached");
    markFrameReady();
  }, imgTimeout);
};

onMounted(async () => {
  await nextTick();

  if (frame.value) {
    setupFrameLoading(frame.value);
  }

  if (videoTeaser.value) {
    setupVideoLoading(videoTeaser.value);
  }

  // Start checking image preload status
  checkImagePreloadStatus();

  inject();
});

//** TICKET */
</script>

<template>
  <main
    class="flex justify-center items-center w-[100vw] h-[100dvh] overflow-hidden bg-teal-950"
  >
    <Transition
      enter-active-class="transition-all duration-500"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-500"
      leave-from-class="opacity-100 "
      leave-to-class="opacity-0 -translate-y-2"
      mode="out-in"
    >
      <div
        v-if="!showTicketGenerator"
        class="flex justify-center items-center w-[100vw] h-[100dvh] overflow-hidden relative"
      >
        <!-- Skip Button - moved lower on mobile to avoid overlap -->
        <button
          @click="skipToTicketGenerator"
          class="absolute w-[200px] md:bottom-[14%] bottom-[8%] left-1/2 translate-x-[-50%] z-10 skip-button text-amber-900 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-amber-400"
        >
          <MorphingText
            :texts="['Exit the Theatre', 'To the Borderland']"
            className="text-[1.2rem] text-amber-900 cursor-pointer pb-4 mt-[-8px]"
            :morphTime="2"
            :cooldownTime="1.5"
          />
        </button>

        <div
          class="absolute md:h-[26vh] md:w-auto w-[48vw] h-auto aspect-square z-0"
        >
          <video
            class="aspect-square w-full"
            src="/teaser.webm"
            ref="videoTeaser"
            preload="auto"
            playsinline
            muted
          ></video>
        </div>
        <div
          class="md:h-[64vh] md:w-auto w-[90vw] h-auto aspect-square relative z-1"
        >
          <img
            alt="Theatre of Wonder"
            src="/frame.gif"
            class="frame aspect-square w-full pointer-events-none"
            ref="frame"
          />
          <!-- Play/Pause button - kept at 22% on mobile, now separated from skip button -->
          <LiquidRainbowButton
            @click="playVideoTeaser"
            class="absolute md:bottom-[20%] bottom-[22%] left-1/2 translate-x-[-50%]"
          >
            <Play v-if="!isVideoPlaying"></Play>
            <Pause v-else></Pause>
          </LiquidRainbowButton>
        </div>
      </div>

      <TicketGenerator v-else></TicketGenerator>
    </Transition>
  </main>

  <Transition
    enter-active-class="transition-all duration-2000 absolute top-0 left-0"
    enter-from-class="blur-md opacity-0"
    enter-to-class="blur-none opacity-100"
    leave-active-class="transition-all duration-2000 absolute top-0 left-0"
    leave-from-class="blur-none opacity-100"
    leave-to-class="blur-md opacity-0"
  >
    <Loader class="fixed inset-0 z-99" v-if="isAllLoading"></Loader>
  </Transition>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap");

/* Safari-compatible gradient button */
.skip-button {
  /* Solid fallback for Safari */
  background-color: #d97706;
  /* Standard gradient */
  background-image: linear-gradient(to right, #f59e0b, #ca8a04, #b45309);
  /* Webkit prefix for older Safari */
  background-image: -webkit-linear-gradient(left, #f59e0b, #ca8a04, #b45309);
}

.skip-button:hover {
  background-color: #b45309;
  background-image: linear-gradient(to right, #d97706, #a16207, #92400e);
  background-image: -webkit-linear-gradient(left, #d97706, #a16207, #92400e);
}

.ticket-generator {
  font-family: "Cinzel", serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #fff;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 3em;
  font-weight: 700;
  background: linear-gradient(45deg, #ffd700, #ffed4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.header p {
  font-size: 1.2em;
  opacity: 0.8;
}

.generator-section {
  text-align: center;
  margin-bottom: 40px;
}

.generate-btn {
  /* Safari: Solid color fallback FIRST */
  background-color: #b8860b;
  /* Then gradient */
  background-image: linear-gradient(45deg, #b8860b, #daa520);
  background-image: -webkit-linear-gradient(45deg, #b8860b, #daa520);
  border: none;
  padding: 15px 30px;
  font-size: 1.2em;
  font-family: "Cinzel", serif;
  font-weight: 600;
  color: #2c5530;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(184, 134, 11, 0.4);
  /* Safari: Force GPU layer */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(184, 134, 11, 0.6);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.generate-btn.generating {
  -webkit-animation: pulse 1.5s infinite;
  animation: pulse 1.5s infinite;
}

@-webkit-keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.error-message {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  padding: 10px;
  border-radius: 8px;
  margin-top: 15px;
  display: inline-block;
}

.ticket-display {
  margin-top: 40px;
}

.ticket-actions {
  text-align: center;
  margin-top: 30px;
}

.download-btn {
  /* Safari: Solid fallback */
  background-color: #2d5a57;
  background-image: linear-gradient(45deg, #2d5a57, #4a9b8e);
  background-image: -webkit-linear-gradient(45deg, #2d5a57, #4a9b8e);
  border: none;
  padding: 12px 25px;
  font-size: 1.1em;
  font-family: "Cinzel", serif;
  font-weight: 600;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.download-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(45, 90, 87, 0.4);
}

.ticket-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  /* Safari: backdrop-filter needs prefix */
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  display: inline-block;
  text-align: left;
}

.ticket-info p {
  margin: 8px 0;
  font-size: 0.9em;
}

.ticket-info strong {
  color: #ffd700;
}
</style>
