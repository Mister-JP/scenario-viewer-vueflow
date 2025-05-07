// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './index.css'

import App from './App.vue'

// Vue Flow CSS
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// CSS for individual components
// import '@vue-flow/background/dist/style.css' // This was confirmed to not exist
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')