import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

//전역 "공용 CSS
import '@/assets/css/common.css'
import '@/assets/css/home.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
