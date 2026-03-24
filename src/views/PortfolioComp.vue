<template>
  <h1 class="page-title">Portfolio</h1>

  <!-- 상단 카테고리 버튼 -->
  <div class="cate" role="tablist" aria-label="Portfolio categories">
    <button
      v-for="c in categories"
      :key="c.key"
      type="button"
      class="btn-cate"
      role="tab"
      :aria-selected="activeCat === c.key"
      :class="{ active: activeCat === c.key }"
      @click="setCategory(c.key)"
    >
      {{ c.label }}
    </button>
  </div>

  <!-- 슬라이더 -->
  <div class="slider" aria-label="Project slider">
    <button class="nav-btn prev" type="button" aria-label="Previous" @click="onPrevClick" />

    <div class="viewport" ref="viewportRef">
      <div class="track" ref="trackRef" :style="trackStyle" @transitionend="onTransitionEnd">
        <article
          v-for="(p, i) in renderSlides"
          :key="p.__key"
          class="card-item"
          :class="{
            center: filteredLen > 1 && i === current + 1,
            side: filteredLen > 1 && i !== current + 1,
          }"
        >
          <div class="card">
            <!-- thumb: 일반은 background, fitNone만 img -->
            <div class="thumb" :class="{ 'fit-none': p.fitNone }">
              <div v-if="!p.fitNone" class="thumb-bg" :style="{ backgroundImage: `url(${p.thumbnail})` }" />
              <img v-else class="thumb-img" :src="p.thumbnail" :alt="p.title" loading="lazy" />
            </div>

            <div class="card-body">
              <button type="button" class="project-title" @click="handleTitleClick(p)">
                {{ p.title }}
              </button>

              <ul v-if="p.skills?.length" class="skills" aria-label="skills">
                <li v-for="s in p.skills.slice(0, 8)" :key="s.key" class="port-skill-item">
                  <img :src="s.icon" :alt="s.label" class="skill-icon" />
                </li>
              </ul>

              <p class="desc">{{ p.desc }}</p>

              <div class="actions" v-if="hasActions(p)">
                <a v-for="(l, idx) in p.links || []" :key="idx" class="btn" :class="{ ghost: idx === 0 }" :href="l.url" target="_blank" rel="noreferrer noopener">
                  {{ l.label }}
                </a>

                <!-- Web -->
                <a v-if="p.category === 'web' && p.readUrl" class="btn-read solid" :href="p.readUrl" target="_blank" rel="noreferrer noopener"> Read </a>

                <!-- Design -->
                <button v-else-if="p.category === 'design' && (p.thumbnail || p.image)" type="button" class="btn-read solid" @click="openModal(p)">Read</button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <button class="nav-btn next" type="button" aria-label="Next" @click="onNextClick" />
  </div>

  <!-- dot -->
  <div class="dots" role="tablist" aria-label="Slider dots">
    <button
      v-for="(id, idx) in dots"
      :key="id"
      type="button"
      class="dot"
      :class="{ active: idx === activeDot }"
      :aria-label="`Go to slide ${idx + 1}`"
      :aria-selected="idx === activeDot"
      @click="goTo(idx, true)"
    />
  </div>

  <!-- Design 모달 -->
  <teleport to="body">
    <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal" role="dialog" aria-modal="true">
      <button class="modal-close modal-close--outside" type="button" @click="closeModal" aria-label="Close">
        <span class="material-symbols-outlined">close</span>
      </button>

      <div class="modal">
        <img class="modal-img" :src="selectedSrc" :alt="selected?.title || 'preview'" loading="lazy" draggable="false" />
      </div>
    </div>
  </teleport>
</template>

<script setup>
import '@/assets/css/portfolio.css'
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const AUTOPLAY_MS = 3500
const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * State (+프로젝트 데이터)
 */
const projects = ref([
  {
    id: 'p1',
    category: 'web',
    title: 'Windows ERP 시스템 웹 플랫폼 구축',
    thumbnail: new URL('@/assets/images/portfolio/thum1.jpg', import.meta.url).href,
    //fitNone: true, // 첫 번째만 true
    desc: '기존 Windows 기반 ERP 시스템을 Vue3와 RealGrid를 활용한 웹 플랫폼으로 구축하여, 대용량 데이터 처리와 직관적인 화면 구성을 통해 업무 효율성을 높인 ERP 웹 시스템 구현',
    skills: [
      { key: 'vue', label: 'Vue 3', icon: new URL('@/assets/images/common/icon-vue.png', import.meta.url).href },
      { key: 'realgrid', label: 'RealGrid', icon: new URL('@/assets/images/common/icon-realgrid.png', import.meta.url).href },
      { key: 'element-plus', label: 'Element-plus', icon: new URL('@/assets/images/common/icon-element-plus.png', import.meta.url).href },
      { key: 'html', label: 'HTML', icon: new URL('@/assets/images/common/icon-html.png', import.meta.url).href },
      { key: 'css', label: 'CSS', icon: new URL('@/assets/images/common/icon-css.png', import.meta.url).href },
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
  },
  {
    id: 'p2',
    category: 'web',
    title: '엔터인 웹사이트 리뉴얼',
    thumbnail: new URL('@/assets/images/portfolio/thumb2.jpg', import.meta.url).href,
    desc: '반응형 웹 기반으로 ENTIN 기업 홈페이지를 리뉴얼하여 다양한 디바이스 환경에서도 일관된 화면과 안정적인 사용자 경험을 제공하도록 구현',
    skills: [
      { key: 'bootstrap', label: 'Bootstrap', icon: new URL('@/assets/images/common/icon-bootstrap.png', import.meta.url).href },
      { key: 'codeIgniter', label: 'CodeIgniter', icon: new URL('@/assets/images/common/icon-codeIgniter.png', import.meta.url).href },
      { key: 'html', label: 'HTML', icon: new URL('@/assets/images/common/icon-html.png', import.meta.url).href },
      { key: 'css', label: 'CSS', icon: new URL('@/assets/images/common/icon-css.png', import.meta.url).href },
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
    readUrl: 'https://entin.co.kr/',
  },
  {
    id: 'p3',
    category: 'web',
    title: 'ENTIN B2B',
    thumbnail: new URL('@/assets/images/portfolio/thumb3.jpg', import.meta.url).href,
    desc: 'ERP 품목·견적·수주·거래내역과 연계된 기업 간 거래(B2B) 관리 시스템',
    skills: [
      { key: 'codeIgniter', label: 'CodeIgniter', icon: new URL('@/assets/images/common/icon-codeIgniter.png', import.meta.url).href },
      { key: 'html', label: 'HTML', icon: new URL('@/assets/images/common/icon-html.png', import.meta.url).href },
      { key: 'css', label: 'CSS', icon: new URL('@/assets/images/common/icon-css.png', import.meta.url).href },
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
    readUrl: 'https://b2b.entin.co.kr/',
  },
  {
    id: 'p4',
    category: 'web',
    title: 'ETRS 쇼핑몰',
    thumbnail: new URL('@/assets/images/portfolio/thumb4.jpg', import.meta.url).href,
    desc: 'ERP와 연계된 쇼핑몰로, 상품·가격·재고 정보가 실시간으로 반영되어 정확한 상품 정보와 재고 상태를 반영하도록 구현',
    skills: [
      { key: 'codeIgniter', label: 'CodeIgniter', icon: new URL('@/assets/images/common/icon-codeIgniter.png', import.meta.url).href },
      { key: 'html', label: 'HTML', icon: new URL('@/assets/images/common/icon-html.png', import.meta.url).href },
      { key: 'css', label: 'CSS', icon: new URL('@/assets/images/common/icon-css.png', import.meta.url).href },
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
    readUrl: 'https://etrs.co.kr/',
  },
  {
    id: 'p5',
    category: 'web',
    title: '한국기술사업화진흥협회 대구지회',
    thumbnail: new URL('@/assets/images/portfolio/thumb5.jpg', import.meta.url).href,
    desc: '반응형 웹 기반으로 구축되어 다양한 디바이스에서 최적화된 화면을 제공하며, 교육 프로그램과 사업화 지원 정보를 효율적으로 관리할 수 있도록 관리자 기능을 포함하여 구현',
    skills: [
      { key: 'codeIgniter', label: 'CodeIgniter', icon: new URL('@/assets/images/common/icon-codeIgniter.png', import.meta.url).href },
      { key: 'html', label: 'HTML', icon: new URL('@/assets/images/common/icon-html.png', import.meta.url).href },
      { key: 'css', label: 'CSS', icon: new URL('@/assets/images/common/icon-css.png', import.meta.url).href },
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
    readUrl: 'https://jobedu.ktca.or.kr/',
  },
  {
    id: 'p6',
    category: 'web',
    title: 'EntMan-Pro Mobile',
    thumbnail: new URL('@/assets/images/portfolio/thumb6.jpg', import.meta.url).href,
    desc: '기존 ERP 시스템과 연동되어 데이터 일관성을 유지하며, 모바일에서도 안정적인 업무 처리가 가능하도록 구현',
    skills: [
      { key: 'codeIgniter', label: 'CodeIgniter', icon: new URL('@/assets/images/common/icon-codeIgniter.png', import.meta.url).href },
      { key: 'html', label: 'HTML', icon: new URL('@/assets/images/common/icon-html.png', import.meta.url).href },
      { key: 'css', label: 'CSS', icon: new URL('@/assets/images/common/icon-css.png', import.meta.url).href },
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
    readUrl: 'https://m.entin.co.kr/',
  },
  {
    id: 'p7',
    category: 'web',
    title: 'TAS 경영정보 시스템',
    thumbnail: new URL('@/assets/images/portfolio/thumb7.jpg', import.meta.url).href,
    desc: 'ERP와 연계하여 매출, 손익, 재무 등 핵심 경영 데이터를 통합·분석하고, 경영 현황을 한눈에 파악할 수 있도록 지원하는 시스템',
    skills: [
      { key: 'codeIgniter', label: 'CodeIgniter', icon: new URL('@/assets/images/common/icon-codeIgniter.png', import.meta.url).href },
      { key: 'html', label: 'HTML', icon: new URL('@/assets/images/common/icon-html.png', import.meta.url).href },
      { key: 'css', label: 'CSS', icon: new URL('@/assets/images/common/icon-css.png', import.meta.url).href },
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
    readUrl: 'https://tas.taegutec.co.kr/',
  },
  {
    id: 'p8',
    category: 'web',
    title: 'Entin Groupware',
    thumbnail: new URL('@/assets/images/portfolio/thumb8.jpg', import.meta.url).href,
    desc: `사내 구성원 간 원활한 협업을 위해
일정관리·공지사항·전자결재 등 핵심 업무 기능을
하나의 플랫폼으로 통합하여 구현한 시스템.

구글 앱스토어에서 '엔터인 그룹웨어' 모바일 앱도 함께 제공`,
    skills: [
      { key: 'codeIgniter', label: 'CodeIgniter', icon: new URL('@/assets/images/common/icon-codeIgniter.png', import.meta.url).href },
      { key: 'html', label: 'HTML', icon: new URL('@/assets/images/common/icon-html.png', import.meta.url).href },
      { key: 'css', label: 'CSS', icon: new URL('@/assets/images/common/icon-css.png', import.meta.url).href },
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
    readUrl: 'https://gw.entin.co.kr/',
  },
  {
    id: 'p9',
    category: 'web',
    title: '탑스코영남 웹사이트',
    thumbnail: new URL('@/assets/images/portfolio/thumb9.jpg', import.meta.url).href,
    desc: '산업용 기계설비 기자재 전문 유통 기업의 공식 웹사이트 구현',
    skills: [
      { key: 'codeIgniter', label: 'CodeIgniter', icon: new URL('@/assets/images/common/icon-codeIgniter.png', import.meta.url).href },
      { key: 'html', label: 'HTML', icon: new URL('@/assets/images/common/icon-html.png', import.meta.url).href },
      { key: 'css', label: 'CSS', icon: new URL('@/assets/images/common/icon-css.png', import.meta.url).href },
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
    readUrl: 'http://www.tofsco.co.kr/',
  },
  {
    id: 'p10',
    category: 'design',
    title: '이벤트 팝업',
    thumbnail: new URL('@/assets/images/portfolio/design1.jpg', import.meta.url).href,
    desc: '산업용재 유통 프로그램 EntMan-Pro 가입비 면제 제도 안내 팝업 제작',
    skills: [{ key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href }],
  },
  {
    id: 'p11',
    category: 'design',
    title: '이벤트 팝업',
    thumbnail: new URL('@/assets/images/portfolio/design3.gif', import.meta.url).href,
    desc: 'Pre-스타기업 선정/신학협력 체결/인재 채용 안내 팝업 제작',
    skills: [
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
  },
  {
    id: 'p11',
    category: 'design',
    title: '이벤트 팝업',
    thumbnail: new URL('@/assets/images/portfolio/design2.jpg', import.meta.url).href,
    desc: '홈페이지 제작비용 할인 이벤트 안내 팝업 제작',
    skills: [
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
  },
  {
    id: 'p12',
    category: 'design',
    title: '이벤트 팝업',
    thumbnail: new URL('@/assets/images/portfolio/design4.jpg', import.meta.url).href,
    desc: 'Smart GroupWare 출시 안내 팝업 제작',
    skills: [
      { key: 'photoshop', label: 'Photoshop', icon: new URL('@/assets/images/common/icon-photoshop.png', import.meta.url).href },
      { key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href },
    ],
  },
  {
    id: 'p13',
    category: 'design',
    title: '그린킷 Identity Design',
    thumbnail: new URL('@/assets/images/portfolio/design5.png', import.meta.url).href,
    fitNone: true,
    desc: '스마트팜 업체 그린킷의 Identity Design 제작',
    skills: [{ key: 'illustration', label: 'Illustration', icon: new URL('@/assets/images/common/icon-illustration.png', import.meta.url).href }],
  },
])

// 카테고리 버튼
const categories = [
  //  { key: 'all', label: 'All' },
  { key: 'web', label: 'Web&Mobile' },
  { key: 'design', label: 'Design' },
]

//const activeCat = ref('all')
const activeCat = ref(categories[0].key)

/** 필터링된 프로젝트 */
//All 사용 시 아래 내용 사용
//const filtered = computed(() => {
//  const list = projects.value
//  if (activeCat.value === 'all') return list
//  return list.filter((p) => p.category === activeCat.value)
//})

//All 미사용 시 아래 내용 사용
const filtered = computed(() => projects.value.filter((p) => p.category === activeCat.value))
const filteredLen = computed(() => filtered.value.length)

const current = ref(0)
const isAnimating = ref(false)

/**
 * 프로젝트 슬라이드
 */
const renderSlides = computed(() => {
  const list = filtered.value
  const n = list.length
  if (n === 0) return []
  if (n === 1) return [{ ...list[0], __key: `${list[0].id}-only`, __clone: false }]

  const first = { ...list[0], __key: `${list[0].id}-firstClone`, __clone: true }
  const last = { ...list[n - 1], __key: `${list[n - 1].id}-lastClone`, __clone: true }
  return [last, ...list.map((p) => ({ ...p, __key: p.id, __clone: false })), first]
})

/**
 * 트랙 이동 계산(실측 step: 카드 폭 + gap)
 */
const viewportRef = ref(null)
const trackRef = ref(null)
const stepPx = ref(0)
const edgePx = ref(0) // viewport에서 카드가 가운데 오도록 만드는 좌우 여백

const measureStep = () => {
  nextTick(() => {
    const viewport = viewportRef.value
    const track = trackRef.value
    if (!viewport || !track) return

    const item = track.querySelector('.card-item')
    if (!item) return

    const itemW = item.offsetWidth
    if (!itemW) {
      requestAnimationFrame(measureStep)
      return
    }

    const viewportW = viewport.getBoundingClientRect().width
    const styles = getComputedStyle(track)
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0

    stepPx.value = itemW + gap
    edgePx.value = Math.max(0, (viewportW - itemW) / 2)
  })
}

// 현재 위치 = current + 1 (앞에 lastClone이 있으므로)
const trackStyle = computed(() => {
  const n = filtered.value.length
  if (n === 0) return {}

  const pos = n <= 1 ? 0 : current.value + 1
  return {
    transform: `translate3d(${edgePx.value - stepPx.value * pos}px, 0, 0)`,
    transition: isAnimating.value ? 'transform 420ms cubic-bezier(0.22, 0.8, 0.2, 1)' : 'none',
  }
})

/**
 * 팝업(Modal)
 */
const modalOpen = ref(false)
const selected = ref(null)
const selectedSrc = computed(() => selected.value?.thumbnail || selected.value?.image || '')

const openModal = (project) => {
  selected.value = project
  modalOpen.value = true
  document.documentElement.style.overflow = 'hidden'
}

const closeModal = () => {
  modalOpen.value = false
  selected.value = null
  document.documentElement.style.overflow = ''
}

// ESC로 닫기
const onKeydown = (e) => {
  if (e.key === 'Escape' && modalOpen.value) closeModal()
}

/**
 * Autoplay
 */

//const AUTOPLAY_MS = 3500 // 원하는 시간(ms)로 변경
const autoplayTimer = ref(null)

const stopAutoplay = () => {
  if (!autoplayTimer.value) return
  clearInterval(autoplayTimer.value)
  autoplayTimer.value = null
}

const startAutoplay = () => {
  stopAutoplay()
  if (filtered.value.length <= 1) return

  autoplayTimer.value = window.setInterval(() => {
    if (modalOpen.value) return
    next() // 자동재생은 next만 호출
  }, AUTOPLAY_MS)
}

const resetAutoplay = () => startAutoplay()

/**
 * Navigation
 */
const goTo = (index, withAnim = true) => {
  const n = filtered.value.length
  if (n === 0) return
  if (n === 1) {
    current.value = 0
    return
  }

  isAnimating.value = withAnim
  current.value = clamp(index, 0, n - 1)
  resetAutoplay()
}

const next = () => {
  const n = filtered.value.length
  if (n <= 1) return
  isAnimating.value = true
  current.value += 1
}

const prev = () => {
  const n = filtered.value.length
  if (n <= 1) return
  isAnimating.value = true
  current.value -= 1
}

const onPrevClick = () => {
  prev()
  resetAutoplay()
}

const onNextClick = () => {
  next()
  resetAutoplay()
}

// transition 끝나면 클론 구간이면 진짜 인덱스로 순간이동 */
const onTransitionEnd = () => {
  const n = filtered.value.length
  if (n <= 1) return

  if (current.value >= n) {
    isAnimating.value = false
    current.value = 0
  } else if (current.value < 0) {
    isAnimating.value = false
    current.value = n - 1
  }
}

/**
 * Dots
 */
const dots = computed(() => filtered.value.map((p) => p.id))
const activeDot = computed(() => current.value)

/**
 * Misc
 */
const setCategory = (key) => {
  activeCat.value = key
}

// 액션 존재 여부를 함수로 정리
const hasActions = (p) => !!((p.links && p.links.length) || p.readUrl || (p.category === 'design' && (p.thumbnail || p.image)))

// 제목 클릭 행동도 정리(원하면 유지/변경 가능)
const handleTitleClick = (p) => {
  if (p.category === 'web' && p.readUrl) {
    window.open(p.readUrl, '_blank', 'noopener,noreferrer')
    return
  }
  if (p.category === 'design') openModal(p)
}

/**
 * Lifecycle
 */
let ro

// 카테고리 변경 시 초기화
watch(activeCat, async () => {
  current.value = 0
  isAnimating.value = false
  await nextTick()
  measureStep()
  startAutoplay()
})

onMounted(() => {
  measureStep()
  requestAnimationFrame(measureStep)

  window.addEventListener('resize', measureStep)
  window.addEventListener('keydown', onKeydown)

  if (viewportRef.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(measureStep)
    ro.observe(viewportRef.value)
  }

  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
  window.removeEventListener('resize', measureStep)
  window.removeEventListener('keydown', onKeydown)
  if (ro) ro.disconnect()
  document.documentElement.style.overflow = ''
})
</script>

<style scoped></style>
