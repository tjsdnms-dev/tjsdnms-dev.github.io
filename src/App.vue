<template>
  <HeaderComp :sections="sections" :activeId="activeId" :isHome="isHome" :isScrolled="isScrolled" :isTouch="isTouch" @navigate="goTo" />

  <!-- 데스크탑: 기존처럼 섹션 교체 + 페이드 -->
  <main v-if="!isTouch" class="fade-container">
    <Transition name="fade" mode="out-in">
      <section :key="activeId" :id="activeId" class="page fade-page">
        <component :is="activeComp" />
      </section>
    </Transition>
  </main>

  <!-- 모바일: 섹션을 쌓아두고 네이티브 스크롤 -->
  <main v-else ref="scrollEl" class="stack-container">
    <section id="home" class="page stack-page"><HomeComp /></section>
    <section id="about" class="page stack-page"><AboutComp /></section>
    <section id="portfolio" class="page stack-page"><PortfolioComp /></section>
    <section id="contact" class="page stack-page"><ContactComp /></section>
  </main>

  <!-- Top 바로가기 버튼 -->
  <Transition name="fade-up">
    <button v-if="!isHome" class="btn-top" type="button" aria-label="Go to Top" @click="goTo('home')" />
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import HeaderComp from '@/components/HeaderComp.vue'
import HomeComp from '@/views/HomeComp.vue'
import AboutComp from '@/views/AboutComp.vue'
import PortfolioComp from '@/views/PortfolioComp.vue'
import ContactComp from '@/views/ContactComp.vue'

/**
 * Constants
 */
const HEADER_H = 65
const WHEEL_THRESHOLD = 80
const WHEEL_LOCK_MS = 350

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'contact', label: 'Contact' },
]

const compMap = {
  home: HomeComp,
  about: AboutComp,
  portfolio: PortfolioComp,
  contact: ContactComp,
}

const indexMap = new Map(sections.map((s, i) => [s.id, i]))

/**
 * Utils
 */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max)
const detectTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

/**
 * State
 */
const activeId = ref('home')
// 데스크탑에서는 activeId로, 모바일에서는 스크롤로도 판단 가능하지만
// 헤더 배경은 isScrolled로 확실하게 처리
const isTouch = ref(false)
const isScrolled = ref(false)
const scrollEl = ref(null)

/**
 * Derived State
 */
const activeComp = computed(() => compMap[activeId.value] ?? HomeComp)
const isHome = computed(() => activeId.value === 'home')

/**
 * DOM Cache (mobile scroll spy 성능 개선)
 */
const sectionEls = ref(new Map()) // id -> element

const cacheSectionEls = () => {
  const container = scrollEl.value
  if (!container) return
  const map = new Map()
  for (const s of sections) {
    const el = container.querySelector(`#${s.id}`)
    if (el) map.set(s.id, el)
  }
  sectionEls.value = map
}

/**
 * Scroll helpers
 */
const getScrollTop = () => {
  // 모바일 환경에서 container scroll / window scroll 케이스 모두 대비
  const containerTop = scrollEl.value?.scrollTop ?? 0
  const windowTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
  return Math.max(containerTop, windowTop)
}

const updateScrolled = () => {
  isScrolled.value = getScrollTop() > 0
}

/**
 * Navigation (Header -> main)
 */
const goTo = (id) => {
  if (!indexMap.has(id)) return
  activeId.value = id

  if (isTouch.value) {
    const container = scrollEl.value
    const el = container?.querySelector(`#${id}`)
    if (!container || !el) return

    // 컨테이너를 확실히 스크롤 (헤더 높이만큼 보정)
    const top = Math.max(0, el.offsetTop - HEADER_H)
    container.scrollTo({ top, behavior: 'smooth' })
  }
}

/**
 * Mobile: Scroll spy (activeId 갱신)
 */
let rafId = 0

const updateActiveByScroll = () => {
  const container = scrollEl.value
  if (!container) return

  // 헤더 높이를 고려해서 "상단 기준점"을 조금 아래로
  const probeY = container.scrollTop + HEADER_H + container.clientHeight * 0.25

  let current = 'home'
  for (const s of sections) {
    const el = sectionEls.value.get(s.id)
    if (!el) continue
    if (probeY >= el.offsetTop) current = s.id
  }

  if (activeId.value !== current) activeId.value = current
}

const onMobileScroll = () => {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    updateScrolled()
    updateActiveByScroll()
  })
}

/**
 * Desktop: Wheel Paging
 */
let wheelLock = false
let wheelAccum = 0
let wheelUnlockTimer = 0

const goByDelta = (delta) => {
  const cur = indexMap.get(activeId.value) ?? 0
  const next = clamp(cur + delta, 0, sections.length - 1)
  activeId.value = sections[next].id
}

const onWheel = (e) => {
  if (isTouch.value) return

  e.preventDefault()
  if (wheelLock) return

  wheelAccum += e.deltaY
  if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return

  wheelLock = true
  goByDelta(wheelAccum > 0 ? 1 : -1)
  wheelAccum = 0

  // unlock 타이머 관리(언마운트 시 정리 가능)
  wheelUnlockTimer = window.setTimeout(() => {
    wheelLock = false
    wheelUnlockTimer = 0
  }, WHEEL_LOCK_MS)
}

/**
 * Effects / Lifecycle
 */
onMounted(async () => {
  isTouch.value = detectTouch()

  // DOM 준비된 다음 섹션 엘리먼트 캐시
  await nextTick()
  if (isTouch.value) cacheSectionEls()

  updateScrolled()

  if (isTouch.value) {
    updateActiveByScroll()

    scrollEl.value?.addEventListener('scroll', onMobileScroll, { passive: true })

    // body 스크롤 케이스 대비(백업)
    window.addEventListener('scroll', updateScrolled, { passive: true })
    window.addEventListener('touchmove', updateScrolled, { passive: true })
  } else {
    window.addEventListener('wheel', onWheel, { passive: false })
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)

  scrollEl.value?.removeEventListener('scroll', onMobileScroll)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('scroll', updateScrolled)
  window.removeEventListener('touchmove', updateScrolled)

  if (wheelUnlockTimer) {
    clearTimeout(wheelUnlockTimer)
    wheelUnlockTimer = 0
  }
})

/**
 * Watches
 */
// 모바일: 카테고리 이동 후 DOM 캐시가 필요할 수 있어 watch로 보강(선택)
watch(isTouch, async (v) => {
  if (!v) return
  await nextTick()
  cacheSectionEls()
})

// 데스크탑에서 메뉴 클릭으로 activeId가 바뀌면 isScrolled 상태도 한번 보정(선택)
watch(activeId, () => {
  if (!isTouch.value) updateScrolled()
})
</script>

<style scoped></style>
