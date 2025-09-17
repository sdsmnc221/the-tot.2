<template>
  <div
    class="font-serif max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-white min-h-screen"
  >
    <!-- Header Section -->
    <div class="text-center mb-8 sm:mb-12 pt-8 sm:pt-12" v-if="!currentTicket">
      <h1
        class="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent mb-4 drop-shadow-lg"
      >
        ✨ Sky Ticket Generator ✨
      </h1>
    </div>

    <!-- Generator Section -->
    <div class="text-center mb-8 sm:mb-12">
      <button
        v-if="!currentTicket"
        @click="handleGenerateTicket"
        :disabled="isGenerating"
        class="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed border-none px-6 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold text-green-900 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 uppercase tracking-wide"
        :class="{ 'animate-pulse': isGenerating }"
      >
        <span v-if="!isGenerating" class="block">🎫 Generate Sky Ticket</span>
        <span v-else class="block">🌟 Creating Magic...</span>
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

        <!-- Ticket Info -->
        <div
          class="bg-white/10 p-6 sm:p-8 rounded-2xl backdrop-blur-md border border-white/20 w-full lg:w-auto lg:min-w-[300px] text-left"
        >
          <div class="space-y-3 sm:space-y-4">
            <p class="text-sm sm:text-base">
              <strong class="text-yellow-400 font-semibold"
                >Ticket Number:</strong
              >
              <span class="block sm:inline sm:ml-2 mt-1 sm:mt-0">{{
                currentTicket.ticketNumber
              }}</span>
            </p>
            <p class="text-sm sm:text-base">
              <strong class="text-yellow-400 font-semibold">Generated:</strong>
              <span class="block sm:inline sm:ml-2 mt-1 sm:mt-0">{{
                formatDate(currentTicket.generatedAt)
              }}</span>
            </p>
            <p class="text-sm sm:text-base">
              <strong class="text-yellow-400 font-semibold">Sky Type:</strong>
              <span class="block sm:inline sm:ml-2 mt-1 sm:mt-0">{{
                currentTicket.skyType.toUpperCase()
              }}</span>
            </p>
            <p class="text-sm sm:text-base">
              <strong class="text-yellow-400 font-semibold">Status:</strong>
              <span class="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                {{
                  currentTicket.downloaded
                    ? "✅ Downloaded"
                    : "⏳ Ready for Download"
                }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Download Actions -->
      <div class="text-center mt-8 sm:mt-12">
        <button
          @click="downloadTicket"
          class="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-400 border-none px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold text-white rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg uppercase tracking-wide w-full sm:w-auto"
        >
          📥 Download Your Ticket
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTicketGenerator } from "../composables/useTicketGenerator";
import SkyTicketCanvas from "./SkyTicketCanvas.vue";

const { isGenerating, currentTicket, error, generateTicket, markAsDownloaded } =
  useTicketGenerator();

const handleGenerateTicket = async () => {
  await generateTicket();
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
