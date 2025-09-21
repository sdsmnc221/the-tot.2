<template>
  <div
    class="cityscape fixed inset-0 scale-y-[-1]"
    :style="cityscapeStyle"
  ></div>
  <Transition
    enter-active-class="transition-all duration-1000"
    enter-from-class="blur-md opacity-0"
    enter-to-class="blur-none opacity-100"
    leave-active-class="transition-all duration-1000"
    leave-from-class="blur-none opacity-100"
    leave-to-class="blur-md opacity-0"
  >
    <div
      class="font-serif max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-white z-0 self-end"
    >
      <div v-if="!currentTicket && !transitionLeapOfFaith" class="self-end">
        <!-- Header Section -->
        <div class="text-center mb-8 sm:mb-12 pt-8 sm:pt-12">
          <h1
            class="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg leading-tight"
          >
            ✨ The Train of Thoughts is welcoming you aboard..! ✨
          </h1>
        </div>

        <!-- Name Input Section -->
        <div class="text-center mb-6 sm:mb-8">
          <div class="max-w-md mx-auto">
            <label
              for="userName"
              class="block text-yellow-400 font-semibold mb-2 text-lg"
            >
              Your Name (Optional)
            </label>
            <input
              id="userName"
              v-model="userName"
              type="text"
              placeholder="Enter your name..."
              maxlength="50"
              class="w-full px-4 py-3 text-lg bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
            />
            <p class="text-white/60 text-sm mt-2">
              This will be included in your ticket metadata
            </p>
          </div>
        </div>

        <!-- Generator Section -->
        <div class="text-center mb-8 sm:mb-12">
          <button
            v-if="!currentTicket"
            @click="handleGenerateTicket"
            :disabled="isGenerating || !areImagesReady"
            class="w-[320px] md:w-[24vw] bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed border-none px-6 sm:px-10 py-4 sm:py-5 text-lg uppercase sm:text-xl font-semibold text-green-900 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 tracking-wide"
            :class="{ 'animate-pulse': isGenerating }"
          >
            <MorphingText
              v-if="!isGenerating && areImagesReady"
              :texts="[
                'Let\'s generate YOUR Sky Ticket!',
                'It only takes...a Leap of Faith!',
              ]"
              className="text-base cursor-pointer pb-4 mt-[-8px]"
              :morphTime="2"
              :cooldownTime="1.5"
            />

            <MorphingText
              v-else-if="isGenerating"
              :texts="['Will you jump?', 'Jump into the Sky...!']"
              className="text-[1.2rem] t cursor-pointer pb-4 mt-[-8px]"
              :morphTime="2"
              :cooldownTime="1.5"
            />

            <span v-else class="text-base"> Loading magical assets... </span>
          </button>

          <div
            v-if="error"
            class="text-red-400 bg-red-400/15 border-2 border-red-400 p-4 rounded-lg mt-6 inline-block font-semibold"
          >
            ❌ {{ error }}
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Leap of Faith -->
  <Transition
    enter-active-class="transition-[transform,opacity] duration-1200 absolute"
    style="transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-[transform,opacity] duration-1200 ease-in absolute"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="transitionLeapOfFaith && isLeapingImageReady"
      class="person-leaping w-[170px] h-[422px] scale-[0.5] pointer-events-none fixed bottom-16 z-10"
      :style="{ backgroundImage: `url(${leapingImageUrl})` }"
    ></div>
  </Transition>

  <div class="absolute bottom-10">
    <Transition
      enter-active-class="transition-all duration-500"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-500"
      leave-from-class="opacity-100 "
      leave-to-class="opacity-0 -translate-y-2"
      mode="out-in"
    >
      <!-- Ticket Display Section -->
      <div
        v-if="currentTicket && !transitionLeapOfFaith"
        class="mt-8 px-10 sm:mt-12"
      >
        <!-- Responsive Layout: Stack on mobile, side-by-side on desktop -->
        <div
          class="flex flex-col lg:flex-row gap-6 lg:gap-20 justify-center items-center"
        >
          <!-- Ticket Canvas -->
          <div class="w-full lg:w-auto flex justify-center">
            <SkyTicketCanvas
              :ticket="currentTicket"
              class="max-w-full h-auto"
              @ticket-ready="() => (capybaraLoading = false)"
            />
          </div>
        </div>

        <!-- Download Actions -->
        <div class="text-center mt-2">
          <button
            @click="downloadTicket"
            class="w-full uppercase bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-400 border-none px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold text-white rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg tracking-wide"
          >
            <MorphingText
              :texts="['Download my ticket']"
              className="text-[1.2rem] t cursor-pointer pb-4 mt-[-8px]"
              :morphTime="2"
              :cooldownTime="1.5"
            />
          </button>
        </div>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition-all duration-500"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-500"
      leave-from-class="opacity-100 "
      leave-to-class="opacity-0 -translate-y-2"
      mode="out-in"
    >
      <CapybaraLoader
        class="fixed translate-x-[-50%] left-1/2 bottom-[-24vh]"
        v-if="capybaraLoading"
      ></CapybaraLoader>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useTicketGenerator } from "../composables/useTicketGenerator";
import SkyTicketCanvas from "./SkyTicketCanvas.vue";
import MorphingText from "./MorphingText.vue";
import CapybaraLoader from "./CapybaraLoader.vue";

const { isGenerating, currentTicket, error, generateTicket, markAsDownloaded } =
  useTicketGenerator();

const capybaraLoading = ref(false);

const transitionLeapOfFaith = ref(false);
const userName = ref("");

// Get cached blob URLs from preloaded images
const getCachedImageUrl = (originalUrl: string): string => {
  const cachedUrl = window.imagePreloadStatus?.cache?.get?.(originalUrl);
  return cachedUrl || originalUrl; // Fallback to original URL
};

// Check if preloaded images are available
const areImagesReady = computed(() => {
  return window.imagePreloadStatus?.loaded || false;
});

// Dynamic cityscape background using cached blob URLs
const cityscapeStyle = computed(() => {
  if (currentTicket.value && isCityscapeColorfulReady.value) {
    return {
      backgroundImage: `url('${getCachedImageUrl("/citiscape-colorful.gif")}')`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      transition: "background-image ease 0.64s",
    };
  } else if (isCityscapeMonochromeReady.value) {
    return {
      backgroundImage: `url('${getCachedImageUrl(
        "/citiscape-monochrome.gif"
      )}')`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      transition: "background-image ease 0.64s",
    };
  }
  // Fallback to CSS if preloaded images aren't ready
  return {};
});

// Get cached leaping image URL
const leapingImageUrl = computed(() => {
  return getCachedImageUrl("/leaping-person.gif");
});

const isLeapingImageReady = computed(() => {
  return window.imagePreloadStatus?.cache?.has("/leaping-person.gif") || false;
});

const isCityscapeMonochromeReady = computed(() => {
  return (
    window.imagePreloadStatus?.cache?.has("/citiscape-monochrome.gif") || false
  );
});

const isCityscapeColorfulReady = computed(() => {
  return (
    window.imagePreloadStatus?.cache?.has("/citiscape-colorful.gif") || false
  );
});

const handleGenerateTicket = async () => {
  // Double-check that all critical images are ready before starting transition
  if (
    !areImagesReady.value ||
    !isLeapingImageReady.value ||
    !isCityscapeMonochromeReady.value
  ) {
    console.warn("Critical images not ready yet, waiting...");
    return;
  }

  transitionLeapOfFaith.value = true;
  await generateTicket(userName.value.trim() || undefined);
};

const downloadTicket = async () => {
  if (!currentTicket.value) return;

  const canvas = document.querySelector(".ticket-canvas") as HTMLCanvasElement;
  if (!canvas) return;

  // Create download link
  canvas.toBlob(async (blob) => {
    if (!blob || !currentTicket.value) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sky-ticket-${currentTicket.value.ticketNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Mark as downloaded in Redis
    const success = await markAsDownloaded(currentTicket.value.ticketNumber);
    if (success && currentTicket.value) {
      currentTicket.value = {
        ...currentTicket.value,
        downloaded: true,
      };
    }
  }, "image/png");
};

watch(
  () => transitionLeapOfFaith.value,
  (newLeapOfFaithState) => {
    if (newLeapOfFaithState === true) {
      setTimeout(() => {
        transitionLeapOfFaith.value = false;
        capybaraLoading.value = true;
      }, 2400);
    }
  }
);

// Optional: Log preload status for debugging
onMounted(() => {
  console.log(
    "TicketGenerator mounted. Preload status:",
    window.imagePreloadStatus
  );
  console.log(
    "Available images:",
    Array.from(window.imagePreloadStatus?.cache || [])
  );
});
</script>

<style lang="scss" scoped>
.cityscape {
  // Fallback styles - will be overridden by dynamic styles when preloaded images are ready
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transition: background-image ease 0.64s;

  // Fallback background images in case preloaded images aren't available
  background-image: url("/citiscape-monochrome.gif");
}

.person-leaping {
  // Background image is set dynamically via :style binding
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
