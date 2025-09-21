<template>
  <div class="sky-ticket-canvas">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      class="ticket-canvas"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { TicketData } from "../types/ticket";

interface Props {
  ticket: TicketData | null;
}

const props = defineProps<Props>();

const emit = defineEmits(["ticket-ready"]);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = 364;
const canvasHeight = 390;

// Sky ticket images - these should be your actual image URLs
const skyImages = {
  sky1: "/sky-ticket-1.png",
  sky2: "/sky-ticket-2.png",
};

const loadFont = async (): Promise<void> => {
  if ("fonts" in document) {
    try {
      await document.fonts.load("36px Trattatello");
      console.log("Trattatello font loaded successfully");
    } catch (error) {
      console.warn("Failed to load Trattatello font:", error);
    }
  }
};

const drawTicket = async (ticket: TicketData) => {
  if (!canvasRef.value) return;

  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  // Load custom font first
  await loadFont();

  try {
    // Load the sky background image
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = skyImages[ticket.skyType];
    });

    // Clear canvas and draw background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    // Engrave ticket number
    engraveTicketNumber(ctx, ticket.ticketNumber);

    // Add date and other details
    addTicketDetails(ctx, ticket);
  } catch (error) {
    console.error("Failed to draw ticket:", error);
    // Fallback: draw a colored background
    drawFallbackTicket(ctx, ticket);
  }

  emit("ticket-ready");
};

const drawFallbackTicket = (
  ctx: CanvasRenderingContext2D,
  ticket: TicketData
) => {
  // Create a beautiful gradient background as fallback
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  gradient.addColorStop(0, ticket.skyType === "sky1" ? "#1a4a47" : "#2d5a57");
  gradient.addColorStop(0.5, ticket.skyType === "sky1" ? "#4a9b8e" : "#5a9b8e");
  gradient.addColorStop(1, ticket.skyType === "sky1" ? "#72d4c4" : "#82d4c4");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Add some decorative elements
  drawStars(ctx);

  engraveTicketNumber(ctx, ticket.ticketNumber);
  addTicketDetails(ctx, ticket);
};

const drawStars = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const radius = Math.random() * 2 + 1;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
};

const engraveTicketNumber = (
  ctx: CanvasRenderingContext2D,
  ticketNumber: string
) => {
  // Create engraved effect
  ctx.font = 'bold 36px "Trattatello", serif';
  ctx.textAlign = "center";

  // Shadow for depth (darker)
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillText(ticketNumber, canvasWidth / 2 + 3, 120 + 3);

  // Inner shadow (lighter)
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillText(ticketNumber, canvasWidth / 2 + 1, 120 + 1);

  // Main text (golden)
  ctx.fillStyle = "#ffd700";
  ctx.fillText(ticketNumber, canvasWidth / 2, 120);

  // Stroke for definition
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 0.48;
  ctx.strokeText(ticketNumber, canvasWidth / 2, 120);
};

const addTicketDetails = (
  ctx: CanvasRenderingContext2D,
  ticket: TicketData
) => {
  // Title
  ctx.font = 'bold 24px "Trattatello", serif';
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("✨ Train of Thoughts ✨", canvasWidth / 2, 60);

  // Date
  ctx.font = '16px "Trattatello", serif';
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const dateStr = ticket.generatedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  ctx.fillText(`Issued date: ${dateStr}`, canvasWidth / 2, canvasHeight - 80);

  // Sky type indicator
  ctx.font = '16px "Cinzel", serif';
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillText(
    `Sky Variant: ${ticket.skyType.toUpperCase()}`,
    canvasWidth / 2,
    canvasHeight - 50
  );
};

watch(
  () => props.ticket,
  (newTicket) => {
    if (newTicket) {
      drawTicket(newTicket);
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.ticket) {
    drawTicket(props.ticket);
  }
});
</script>

<style scoped>
.sky-ticket-canvas {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.ticket-canvas {
  /* box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); */
  max-width: 100%;
  height: auto;
}
</style>
