<style scoped>
.uiverse {
  --duration: 7s;
  --easing: linear;
  /* Updated colors to match baroque theatre */
  --c-color-1: rgba(184, 134, 11, 0.8); /* Rich gold */
  --c-color-2: #2d5a57; /* Deep jade/teal */
  --c-color-3: #d97066; /* Coral/rose pink */
  --c-color-4: rgba(240, 180, 41, 0.9); /* Bright gold */
  --c-shadow: rgba(240, 180, 41, 0.6); /* Golden glow */
  --c-shadow-inset-top: rgba(184, 134, 11, 0.9); /* Rich gold inset */
  --c-shadow-inset-bottom: rgba(255, 235, 205, 0.8); /* Cream inset */
  --c-radial-inner: #b8860b; /* Dark gold center */
  --c-radial-outer: #daa520; /* Gold outer */
  --c-color: #2c5530; /* Dark jade text for contrast */

  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  outline: none;
  position: relative;
  cursor: pointer;
  border: none;
  display: table;
  border-radius: 24px;
  padding: 0;
  margin: 0;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.02em;
  line-height: 1.5;
  color: var(--c-color);
  background: radial-gradient(
    circle,
    var(--c-radial-inner),
    var(--c-radial-outer) 80%
  );
  box-shadow: 0 0 14px var(--c-shadow);
  transition: all 0.3s ease;
  /* Safari: Force GPU layer for the parent */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.uiverse:before {
  content: "";
  pointer-events: none;
  position: absolute;
  z-index: 3;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  box-shadow: inset 0 3px 12px var(--c-shadow-inset-top),
    inset 0 -3px 4px var(--c-shadow-inset-bottom);
}

.uiverse .wrapper {
  /* Safari fix: Use standard mask with webkit fallback */
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  mask-image: radial-gradient(white, black);
  overflow: hidden;
  border-radius: 50%;
  width: 64px;
  height: 32px;
  padding: 12px 0;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Safari: Isolate blend modes within this container */
  isolation: isolate;
  /* Safari: Force compositing layer */
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  /* Safari: Ensure proper stacking context */
  position: relative;
  z-index: 1;
}

.uiverse .wrapper span {
  display: inline-block;
  position: relative;
  z-index: 1;
}

.uiverse:hover {
  --duration: 1400ms;
  transform: scale(1.05) translateZ(0);
  box-shadow: 0 0 20px var(--c-shadow);
}

.uiverse .wrapper .circle {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  /* Safari fix: Use webkit prefix for filter */
  -webkit-filter: blur(var(--blur, 8px));
  filter: blur(var(--blur, 8px));
  /* Safari fix: Avoid mix-blend-mode issues by using opacity instead */
  /* mix-blend-mode: overlay; */
  opacity: 0.7;
  background: var(--background, transparent);
  /* Safari fix: Use translate3d for better GPU acceleration */
  -webkit-transform: translate3d(var(--x, 0), var(--y, 0), 0);
  transform: translate3d(var(--x, 0), var(--y, 0), 0);
  /* Safari fix: Add will-change for animation performance */
  will-change: transform;
  /* Safari fix: Force GPU compositing */
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  animation: var(--animation, none) var(--duration) var(--easing) infinite;
  /* Safari fix: Ensure animations run smoothly */
  -webkit-animation: var(--animation, none) var(--duration) var(--easing)
    infinite;
}

.uiverse .wrapper .circle.circle-1,
.uiverse .wrapper .circle.circle-9,
.uiverse .wrapper .circle.circle-10 {
  --background: var(--c-color-4);
}

.uiverse .wrapper .circle.circle-3,
.uiverse .wrapper .circle.circle-4 {
  --background: var(--c-color-2);
  --blur: 14px;
}

.uiverse .wrapper .circle.circle-5,
.uiverse .wrapper .circle.circle-6 {
  --background: var(--c-color-3);
  --blur: 16px;
}

.uiverse .wrapper .circle.circle-2,
.uiverse .wrapper .circle.circle-7,
.uiverse .wrapper .circle.circle-8,
.uiverse .wrapper .circle.circle-11,
.uiverse .wrapper .circle.circle-12 {
  --background: var(--c-color-1);
  --blur: 12px;
}

.uiverse .wrapper .circle.circle-1 {
  --x: 0px;
  --y: -40px;
  --animation: circle-1;
}

.uiverse .wrapper .circle.circle-2 {
  --x: 92px;
  --y: 8px;
  --animation: circle-2;
}

.uiverse .wrapper .circle.circle-3 {
  --x: -12px;
  --y: -12px;
  --animation: circle-3;
}

.uiverse .wrapper .circle.circle-4 {
  --x: 80px;
  --y: -12px;
  --animation: circle-4;
}

.uiverse .wrapper .circle.circle-5 {
  --x: 12px;
  --y: -4px;
  --animation: circle-5;
}

.uiverse .wrapper .circle.circle-6 {
  --x: 56px;
  --y: 16px;
  --animation: circle-6;
}

.uiverse .wrapper .circle.circle-7 {
  --x: 8px;
  --y: 28px;
  --animation: circle-7;
}

.uiverse .wrapper .circle.circle-8 {
  --x: 28px;
  --y: -4px;
  --animation: circle-8;
}

.uiverse .wrapper .circle.circle-9 {
  --x: 20px;
  --y: -12px;
  --animation: circle-9;
}

.uiverse .wrapper .circle.circle-10 {
  --x: 64px;
  --y: 16px;
  --animation: circle-10;
}

.uiverse .wrapper .circle.circle-11 {
  --x: 4px;
  --y: 4px;
  --animation: circle-11;
}

.uiverse .wrapper .circle.circle-12 {
  --blur: 14px;
  --x: 52px;
  --y: 4px;
  --animation: circle-12;
}

/* Safari fix: Use translate3d in all keyframes */
@-webkit-keyframes circle-1 {
  33% {
    -webkit-transform: translate3d(0px, 16px, 0);
    transform: translate3d(0px, 16px, 0);
  }
  66% {
    -webkit-transform: translate3d(12px, 64px, 0);
    transform: translate3d(12px, 64px, 0);
  }
}
@keyframes circle-1 {
  33% {
    -webkit-transform: translate3d(0px, 16px, 0);
    transform: translate3d(0px, 16px, 0);
  }
  66% {
    -webkit-transform: translate3d(12px, 64px, 0);
    transform: translate3d(12px, 64px, 0);
  }
}

@-webkit-keyframes circle-2 {
  33% {
    -webkit-transform: translate3d(80px, -10px, 0);
    transform: translate3d(80px, -10px, 0);
  }
  66% {
    -webkit-transform: translate3d(72px, -48px, 0);
    transform: translate3d(72px, -48px, 0);
  }
}
@keyframes circle-2 {
  33% {
    -webkit-transform: translate3d(80px, -10px, 0);
    transform: translate3d(80px, -10px, 0);
  }
  66% {
    -webkit-transform: translate3d(72px, -48px, 0);
    transform: translate3d(72px, -48px, 0);
  }
}

@-webkit-keyframes circle-3 {
  33% {
    -webkit-transform: translate3d(20px, 12px, 0);
    transform: translate3d(20px, 12px, 0);
  }
  66% {
    -webkit-transform: translate3d(12px, 4px, 0);
    transform: translate3d(12px, 4px, 0);
  }
}
@keyframes circle-3 {
  33% {
    -webkit-transform: translate3d(20px, 12px, 0);
    transform: translate3d(20px, 12px, 0);
  }
  66% {
    -webkit-transform: translate3d(12px, 4px, 0);
    transform: translate3d(12px, 4px, 0);
  }
}

@-webkit-keyframes circle-4 {
  33% {
    -webkit-transform: translate3d(76px, -12px, 0);
    transform: translate3d(76px, -12px, 0);
  }
  66% {
    -webkit-transform: translate3d(112px, -8px, 0);
    transform: translate3d(112px, -8px, 0);
  }
}
@keyframes circle-4 {
  33% {
    -webkit-transform: translate3d(76px, -12px, 0);
    transform: translate3d(76px, -12px, 0);
  }
  66% {
    -webkit-transform: translate3d(112px, -8px, 0);
    transform: translate3d(112px, -8px, 0);
  }
}

@-webkit-keyframes circle-5 {
  33% {
    -webkit-transform: translate3d(84px, 28px, 0);
    transform: translate3d(84px, 28px, 0);
  }
  66% {
    -webkit-transform: translate3d(40px, -32px, 0);
    transform: translate3d(40px, -32px, 0);
  }
}
@keyframes circle-5 {
  33% {
    -webkit-transform: translate3d(84px, 28px, 0);
    transform: translate3d(84px, 28px, 0);
  }
  66% {
    -webkit-transform: translate3d(40px, -32px, 0);
    transform: translate3d(40px, -32px, 0);
  }
}

@-webkit-keyframes circle-6 {
  33% {
    -webkit-transform: translate3d(28px, -16px, 0);
    transform: translate3d(28px, -16px, 0);
  }
  66% {
    -webkit-transform: translate3d(76px, -56px, 0);
    transform: translate3d(76px, -56px, 0);
  }
}
@keyframes circle-6 {
  33% {
    -webkit-transform: translate3d(28px, -16px, 0);
    transform: translate3d(28px, -16px, 0);
  }
  66% {
    -webkit-transform: translate3d(76px, -56px, 0);
    transform: translate3d(76px, -56px, 0);
  }
}

@-webkit-keyframes circle-7 {
  33% {
    -webkit-transform: translate3d(8px, 28px, 0);
    transform: translate3d(8px, 28px, 0);
  }
  66% {
    -webkit-transform: translate3d(20px, -60px, 0);
    transform: translate3d(20px, -60px, 0);
  }
}
@keyframes circle-7 {
  33% {
    -webkit-transform: translate3d(8px, 28px, 0);
    transform: translate3d(8px, 28px, 0);
  }
  66% {
    -webkit-transform: translate3d(20px, -60px, 0);
    transform: translate3d(20px, -60px, 0);
  }
}

@-webkit-keyframes circle-8 {
  33% {
    -webkit-transform: translate3d(32px, -4px, 0);
    transform: translate3d(32px, -4px, 0);
  }
  66% {
    -webkit-transform: translate3d(56px, -20px, 0);
    transform: translate3d(56px, -20px, 0);
  }
}
@keyframes circle-8 {
  33% {
    -webkit-transform: translate3d(32px, -4px, 0);
    transform: translate3d(32px, -4px, 0);
  }
  66% {
    -webkit-transform: translate3d(56px, -20px, 0);
    transform: translate3d(56px, -20px, 0);
  }
}

@-webkit-keyframes circle-9 {
  33% {
    -webkit-transform: translate3d(20px, -12px, 0);
    transform: translate3d(20px, -12px, 0);
  }
  66% {
    -webkit-transform: translate3d(80px, -8px, 0);
    transform: translate3d(80px, -8px, 0);
  }
}
@keyframes circle-9 {
  33% {
    -webkit-transform: translate3d(20px, -12px, 0);
    transform: translate3d(20px, -12px, 0);
  }
  66% {
    -webkit-transform: translate3d(80px, -8px, 0);
    transform: translate3d(80px, -8px, 0);
  }
}

@-webkit-keyframes circle-10 {
  33% {
    -webkit-transform: translate3d(68px, 20px, 0);
    transform: translate3d(68px, 20px, 0);
  }
  66% {
    -webkit-transform: translate3d(100px, 28px, 0);
    transform: translate3d(100px, 28px, 0);
  }
}
@keyframes circle-10 {
  33% {
    -webkit-transform: translate3d(68px, 20px, 0);
    transform: translate3d(68px, 20px, 0);
  }
  66% {
    -webkit-transform: translate3d(100px, 28px, 0);
    transform: translate3d(100px, 28px, 0);
  }
}

@-webkit-keyframes circle-11 {
  33% {
    -webkit-transform: translate3d(4px, 4px, 0);
    transform: translate3d(4px, 4px, 0);
  }
  66% {
    -webkit-transform: translate3d(68px, 20px, 0);
    transform: translate3d(68px, 20px, 0);
  }
}
@keyframes circle-11 {
  33% {
    -webkit-transform: translate3d(4px, 4px, 0);
    transform: translate3d(4px, 4px, 0);
  }
  66% {
    -webkit-transform: translate3d(68px, 20px, 0);
    transform: translate3d(68px, 20px, 0);
  }
}

@-webkit-keyframes circle-12 {
  33% {
    -webkit-transform: translate3d(56px, 0px, 0);
    transform: translate3d(56px, 0px, 0);
  }
  66% {
    -webkit-transform: translate3d(60px, -32px, 0);
    transform: translate3d(60px, -32px, 0);
  }
}
@keyframes circle-12 {
  33% {
    -webkit-transform: translate3d(56px, 0px, 0);
    transform: translate3d(56px, 0px, 0);
  }
  66% {
    -webkit-transform: translate3d(60px, -32px, 0);
    transform: translate3d(60px, -32px, 0);
  }
}
</style>

<template>
  <button class="uiverse">
    <div class="wrapper">
      <div class="circle circle-12"></div>
      <div class="circle circle-11"></div>
      <div class="circle circle-10"></div>
      <div class="circle circle-9"></div>
      <div class="circle circle-8"></div>
      <div class="circle circle-7"></div>
      <div class="circle circle-6"></div>
      <div class="circle circle-5"></div>
      <div class="circle circle-4"></div>
      <div class="circle circle-3"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-1"></div>
      <slot></slot>
    </div>
  </button>
</template>
