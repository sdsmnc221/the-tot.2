<style scoped>
.center-body {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.loader-shape-3 {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 50px;
}
.loader-shape-3:after {
  width: 120px;
  height: 40px;
  border-radius: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  top: 72%;
  left: 50%;
  transform: translate(-50%, 10%);
  margin-top: 15px;
}
.loader-shape-3:before {
  width: 120px;
  height: 120px;
  background-image: url("/capybara.gif");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  animation: anm-SL-3-move 1s linear infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 20px;
}
.loader-shape-3:before,
.loader-shape-3:after {
  position: absolute;
  content: "";
}
@keyframes anm-SL-3-move {
  0% {
    top: 0;
  }
  50% {
    top: -5px;
  }
  100% {
    top: 0;
  }
}
</style>

<template>
  <div class="center-body">
    <div class="loader-shape-3"></div>
  </div>
</template>
