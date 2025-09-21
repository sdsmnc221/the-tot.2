<template>
  <div
    class="cityscape fixed inset-0 scale-y-[-1]"
    :class="{ 'cityscape-colorful': currentTicket }"
  ></div>
  <div
    class="font-serif max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-white z-0 self-end"
  >
    <!-- Header Section -->
    <div class="text-center mb-8 sm:mb-12 pt-8 sm:pt-12" v-if="!currentTicket">
      <h1
        class="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg leading-tight"
      >
        ✨ The Train of Thoughts is welcoming you aboard..! ✨
      </h1>
    </div>

    <!-- Name Input Section -->
    <div class="text-center mb-6 sm:mb-8" v-if="!currentTicket">
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
        :disabled="isGenerating"
        class="w-[320px] md:w-[24vw] bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed border-none px-6 sm:px-10 py-4 sm:py-5 text-lg uppercase sm:text-xl font-semibold text-green-900 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 tracking-wide"
        :class="{ 'animate-pulse': isGenerating }"
      >
        <MorphingText
          v-if="!isGenerating"
          :texts="[
            'Let\'s generate YOUR Sky Ticket!',
            'It only takes...a Leap of Faith!',
          ]"
          className="text-base cursor-pointer pb-4 mt-[-8px]"
          :morphTime="2"
          :cooldownTime="1.5"
        />

        <MorphingText
          v-else
          :texts="['Will you jump?', 'Jump into the Sky...!']"
          className="text-[1.2rem] t cursor-pointer pb-4 mt-[-8px]"
          :morphTime="2"
          :cooldownTime="1.5"
        />
      </button>

      <div
        v-if="error"
        class="text-red-400 bg-red-400/15 border-2 border-red-400 p-4 rounded-lg mt-6 inline-block font-semibold"
      >
        ❌ {{ error }}
      </div>
    </div>

    <!-- Ticket Display Section -->
    <div v-if="currentTicket" class="mt-8 sm:mt-12">
      <!-- Responsive Layout: Stack on mobile, side-by-side on desktop -->
      <div
        class="flex flex-col lg:flex-row gap-6 lg:gap-20 justify-center items-center"
      >
        <!-- Ticket Canvas -->
        <div class="w-full lg:w-auto flex justify-center">
          <SkyTicketCanvas :ticket="currentTicket" class="max-w-full h-auto" />
        </div>
      </div>

      <!-- Download Actions -->
      <div class="text-center mt-2">
        <button
          @click="downloadTicket"
          class="w-full uppercase bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-400 border-none px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold text-white rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg tracking-wide"
        >
          <MorphingText
            :texts="['Download my ticket.']"
            className="text-[1.2rem] t cursor-pointer pb-4 mt-[-8px]"
            :morphTime="2"
            :cooldownTime="1.5"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTicketGenerator } from "../composables/useTicketGenerator";
import SkyTicketCanvas from "./SkyTicketCanvas.vue";
import MorphingText from "./MorphingText.vue";

const { isGenerating, currentTicket, error, generateTicket, markAsDownloaded } =
  useTicketGenerator();

const userName = ref("");

const handleGenerateTicket = async () => {
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style lang="scss" scoped>
.cityscape {
  background-image: url("/citiscape-monochrome.gif");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transition: background-image ease 0.64s;

  &-colorful {
    background-image: url("/citiscape-colorful.gif");
  }
}
</style>
