<template>
  <span
    ref="morphingTextRef"
    :class="className"
    :style="{ fontFamily: 'Trattatello, serif' }"
  >
    {{ displayText }}
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'

interface Props {
  texts: string[]
  className?: string
  morphTime?: number
  cooldownTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  morphTime: 1,
  cooldownTime: 0.25
})

const morphingTextRef: Ref<HTMLElement | null> = ref(null)
const displayText = ref('')
const textIndex = ref(0)
const time = ref(new Date())
const morph = ref(0)
const cooldown = ref(props.cooldownTime)

let animationId: number | null = null

const doMorph = () => {
  morph.value -= cooldown.value
  cooldown.value = 0

  let fraction = morph.value / props.morphTime

  if (fraction > 1) {
    cooldown.value = props.cooldownTime
    fraction = 1
  }

  setMorph(fraction)
}

const setMorph = (fraction: number) => {
  const morphingTextElement = morphingTextRef.value
  if (!morphingTextElement) return

  morphingTextElement.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`

  fraction = Math.cos(fraction * Math.PI) / -2 + 0.5

  morphingTextElement.style.opacity = (2 * fraction - 0.5).toString()

  const text1 = props.texts[textIndex.value % props.texts.length]
  const text2 = props.texts[(textIndex.value + 1) % props.texts.length]

  const chars1 = text1.split('')
  const chars2 = text2.split('')

  const maxLength = Math.max(chars1.length, chars2.length)
  let result = ''

  for (let i = 0; i < maxLength; i++) {
    const char1 = chars1[i] || ' '
    const char2 = chars2[i] || ' '

    if (char1 === char2) {
      result += char1
    } else if (fraction < 0.5) {
      result += char1
    } else {
      result += char2
    }
  }

  displayText.value = result
}

const doCooldown = () => {
  morph.value = 0

  morphingTextRef.value!.style.filter = ''
  morphingTextRef.value!.style.opacity = '100%'

  if (cooldown.value > 0) {
    cooldown.value -= 0.016
  } else {
    cooldown.value = 0
    textIndex.value++
  }
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  const newTime = new Date()
  const shouldIncrementIndex = cooldown.value > 0
  const dt = (newTime.getTime() - time.value.getTime()) / 1000
  time.value = newTime

  cooldown.value -= dt

  if (cooldown.value <= 0) {
    if (shouldIncrementIndex) {
      doCooldown()
    } else {
      doMorph()
    }
  }
}

onMounted(() => {
  displayText.value = props.texts[0] || ''
  animate()
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
})

watch(() => props.texts, () => {
  if (props.texts.length > 0) {
    displayText.value = props.texts[0]
    textIndex.value = 0
    morph.value = 0
    cooldown.value = props.cooldownTime
  }
})
</script>
