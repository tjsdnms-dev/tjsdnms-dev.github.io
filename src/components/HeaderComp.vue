<template>
  <header class="header" :class="{ 'header-scrolled': props.isTouch ? props.isScrolled : props.isScrolled || !props.isHome }">
    <div class="con">
      <a class="logo" href="/" aria-label="Home" @click.prevent="handleNavigate('home')">Sun Folio</a>

      <!-- 데스크탑 nav -->
      <nav class="menu" aria-label="Primary">
        <button
          v-for="s in sections"
          :key="s.id"
          type="button"
          class="menu-item"
          :class="{ active: activeId === s.id }"
          :aria-current="activeId === s.id ? 'page' : null"
          @click="handleNavigate(s.id)"
        >
          {{ s.label }}
        </button>
      </nav>

      <!-- 모바일 menu -->
      <button class="btn-menu" :class="{ open: isOpen }" type="button" aria-label="Menu" :aria-expanded="isOpen ? 'true' : 'false'" @click="toggleMenu">
        <span></span>
      </button>
    </div>

    <!-- 모바일 overlay menu -->
    <Teleport to="body">
      <div v-if="isOpen" class="m-overlay" @click.self="closeMenu">
        <div class="m-panel">
          <nav class="m-nav">
            <button v-for="s in sections" :key="s.id" class="m-item" :class="{ active: activeId === s.id }" @click="handleNavigate(s.id)">
              {{ s.label }}
            </button>
          </nav>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'

/**
 * Props
 */
const props = defineProps({
  sections: Array,
  activeId: String,
  isHome: Boolean,
  isScrolled: Boolean,
  isTouch: Boolean,
})

const emit = defineEmits(['navigate'])

/**
 * State
 */
const isOpen = ref(false)

/**
 * Actions / Handlers
 */
const closeMenu = () => {
  isOpen.value = false
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

/**
 * 공통 네비게이션 핸들러
 */
const handleNavigate = (id) => {
  if (!props.sections.some((s) => s.id === id)) return
  emit('navigate', id)
  if (isOpen.value) closeMenu()
}

/**
 * overlay 열릴 때 배경 스크롤 방지
 */
const prevOverflow = document.documentElement.style.overflow

watch(isOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : prevOverflow
})
</script>

<style scoped></style>
