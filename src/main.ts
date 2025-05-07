// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'      // Vite's default
import './index.css'      // Your Tailwind CSS

import App from './App.vue'

// Vue Flow CSS
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css' // Default theme

// CSS for individual components
// import '@vue-flow/background/dist/style.css' // REMOVED - as this file doesn't exist
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')