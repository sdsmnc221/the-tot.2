<template>
  <div class="ticket-generator">
    <div class="header">
      <h1>✨ Sky Ticket Generator ✨</h1>
    </div>

    <div class="generator-section">
      <button
        v-if="!currentTicket"
        @click="handleGenerateTicket"
        :disabled="isGenerating"
        class="generate-btn"
        :class="{ generating: isGenerating }"
      >
        <span v-if="!isGenerating">🎫 Generate Sky Ticket</span>
        <span v-else>🌟 Creating Magic...</span>
      </button>

      <div v-if="error" class="error-message">❌ {{ error }}</div>
    </div>

    <div v-if="currentTicket" class="ticket-display">
      <div class="flex gap-20 justify-center items-center">
        <SkyTicketCanvas :ticket="currentTicket" />

        <div class="ticket-info">
          <p>
            <strong>Ticket Number:</strong> {{ currentTicket.ticketNumber }}
          </p>
          <p>
            <strong>Generated:</strong>
            {{ formatDate(currentTicket.generatedAt) }}
          </p>
          <p>
            <strong>Sky Type:</strong> {{ currentTicket.skyType.toUpperCase() }}
          </p>
          <p>
            <strong>Status:</strong>
            {{
              currentTicket.downloaded
                ? "✅ Downloaded"
                : "⏳ Ready for Download"
            }}
          </p>
        </div>
      </div>

      <div class="ticket-actions">
        <button @click="downloadTicket" class="download-btn">
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

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap");

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
  padding-top: 40px;
}

.header h1 {
  font-size: 3em;
  font-weight: 700;
  background: linear-gradient(45deg, #ffd700, #ffed4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  background: linear-gradient(45deg, #b8860b, #daa520);
  border: none;
  padding: 18px 40px;
  font-size: 1.3em;
  font-family: "Cinzel", serif;
  font-weight: 600;
  color: #2c5530;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(184, 134, 11, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(184, 134, 11, 0.6);
  background: linear-gradient(45deg, #daa520, #ffd700);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.generate-btn.generating {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.error-message {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.15);
  border: 2px solid #ff6b6b;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  display: inline-block;
  font-weight: 600;
}

.ticket-display {
  margin-top: 40px;
}

.ticket-actions {
  text-align: center;
  margin-top: 30px;
}

.download-btn {
  background: linear-gradient(45deg, #2d5a57, #4a9b8e);
  border: none;
  padding: 15px 30px;
  font-size: 1.2em;
  font-family: "Cinzel", serif;
  font-weight: 600;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 25px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 90, 87, 0.4);
  background: linear-gradient(45deg, #4a9b8e, #72d4c4);
}

.ticket-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 25px;
  border-radius: 15px;
  backdrop-filter: blur(15px);
  display: inline-block;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.ticket-info p {
  margin: 10px 0;
  font-size: 1em;
}

.ticket-info strong {
  color: #ffd700;
  font-weight: 600;
}
</style>
