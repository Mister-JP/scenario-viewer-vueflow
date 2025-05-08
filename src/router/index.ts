// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'; // Ensure 'type' keyword if using TS 4.9+ strict mode for imports
import ScenarioViewerPage from '../pages/ScenarioViewerPage.vue';
import MarkdownTestPage from '../pages/MarkdownTestPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'ScenarioViewer',
    component: ScenarioViewerPage,
  },
  {
    path: '/md',
    name: 'MarkdownTest',
    component: MarkdownTestPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;