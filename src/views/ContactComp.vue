<template>
  <div class="con">
    <div class="sub-tit">
      <p><strong>디자인에 담긴 의도</strong>를 읽고, 코드로 <strong>경험을 완성</strong>합니다.</p>
      <p>궁금한 점이 있다면 언제든 편하게 연락 주세요.</p>
    </div>

    <ul class="contact-list">
      <li v-for="item in contacts" :key="item.label" class="contact-item" :class="`contact-${item.type}`">
        <h4 class="contact-label">
          <span class="material-symbols-outlined contact-icon">
            {{ item.icon }}
          </span>
          {{ item.label }}
        </h4>

        <component :is="item.href ? 'a' : 'span'" class="contact-value" :href="item.href || undefined" :target="item.target || undefined" :rel="item.rel || undefined">
          {{ item.value }}
        </component>
      </li>
    </ul>
  </div>
  <footer-comp />
</template>

<script setup>
import '@/assets/css/contact.css'
import FooterComp from '@/components/FooterComp.vue'

/**
 * Contact 데이터
 */
const contacts = [
  {
    type: 'address',
    label: 'Address',
    value: '대구광역시',
    icon: 'location_on',
  },
  {
    type: 'email',
    label: 'E-mail',
    value: 'tjsdnms@gmail.com',
    href: 'mailto:tjsdnms@gmail.com',
    icon: 'mail',
  },
  {
    type: 'website',
    label: 'Website',
    value: 'https://tjsdnms-dev.github.io/',
    href: 'https://tjsdnms-dev.github.io/',
    target: '_blank',
    rel: 'noopener noreferrer',
    icon: 'language',
  },
]
</script>
