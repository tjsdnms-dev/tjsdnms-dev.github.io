<template>
  <Transition name="title-up" appear @after-enter="onAfterEnter">
    <div v-if="show" class="title" :class="{ shifted: isShifted }">
      <p>HELLO <span>:)</span></p>
      <p>경험을 설계하는 웹 퍼블리셔 / UI·UX 디자이너</p>
    </div>
  </Transition>

  <div class="scrolldown">
    <span class="mouse">
      <img src="/src/assets/images/common/mouse.svg" alt="Mouse" />
    </span>
    <span class="arrow">
      <img src="/src/assets/images/common/arrow-down.svg" alt="Scroll down" />
      <img src="/src/assets/images/common/arrow-down.svg" alt="Scroll down" />
      <img src="/src/assets/images/common/arrow-down.svg" alt="Scroll down" />
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/**
 * State
 */
const show = ref(false)
const isShifted = ref(false)

/**
 * Lifecycle
 */
onMounted(() => {
  show.value = true
})

const onAfterEnter = () => {
  isShifted.value = true
}
</script>
