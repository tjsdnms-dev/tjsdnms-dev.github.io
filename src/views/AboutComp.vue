<template>
  <div class="con">
    <div class="sub-tit">
      <p>Experience Architect</p>
      <p>
        경험을 설계하는 <br />
        <strong>웹 퍼블리셔 & UI/UX 디자이너</strong>입니다.
      </p>
    </div>

    <div class="profile">
      <!-- Info -->
      <div class="info" aria-label="Profile">
        <dl class="info-list">
          <div v-for="item in info" :key="item.label" class="info-row">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </div>

      <!-- Skills -->
      <div class="skill" aria-label="Skills">
        <h3 class="skill-tit">SKILL</h3>

        <ul class="skill-grid">
          <li v-for="(s, i) in skills" :key="s.name" class="skill-item">
            <div class="ring" :aria-label="`${s.name} skill ${s.value}%`">
              <svg class="ring-svg" viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <linearGradient :id="`skill-gradient-${i}`" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#a6c0fe" />
                    <stop offset="100%" stop-color="#f68084" />
                  </linearGradient>
                </defs>

                <circle class="ring-bg" cx="60" cy="60" :r="R" :stroke-width="STROKE" />

                <circle
                  class="ring-fg"
                  cx="60"
                  cy="60"
                  :r="R"
                  :stroke-width="STROKE"
                  :stroke-dasharray="C"
                  :stroke-dashoffset="dashOffset(s.value)"
                  :stroke="`url(#skill-gradient-${i})`"
                />
              </svg>

              <div class="ring-center">
                <div class="ring-label">{{ s.name }}</div>
                <div class="ring-value">{{ s.value }}%</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/about.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const VIEWBOX_SIZE = 100
const STROKE = 10

const CENTER = VIEWBOX_SIZE / 2
const R = CENTER - STROKE / 2
const C = 2 * Math.PI * R

const dashOffset = (value) => {
  const pct = clamp(Number(value) || 0, 0, 100)
  return C - (C * pct) / 100
}

/**
 * 프로필 데이터
 */
const info = [
  { label: 'Name', value: '김선화' },
  { label: 'Birth', value: '1982.02.13' },
  { label: 'Address', value: '대구광역시' },
  { label: 'E-mail', value: 'tjsdnms@gmail.com' },
]

const skills = [
  { name: 'Figma', value: 40 },
  { name: 'Photoshop', value: 90 },
  { name: 'Illustrator', value: 90 },
  { name: 'HTML', value: 95 },
  { name: 'CSS', value: 95 },
  { name: 'Bootstrap', value: 90 },
  { name: 'Element-Plus', value: 80 },
  { name: 'Vue', value: 60 },
  { name: 'CodeIgniter', value: 70 },
  { name: 'Realgrid', value: 50 },
]
</script>

<style scoped></style>
