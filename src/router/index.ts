// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import ScenarioViewerPage from '../pages/ScenarioViewerPage.vue';
import MarkdownTestPage from '../pages/MarkdownTestPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import SignupPage from '../pages/SignupPage.vue';
import { useAuthStore } from '../stores/auth'; // Pinia store

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'ScenarioViewer',
    component: ScenarioViewerPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/md',
    name: 'MarkdownTest',
    component: MarkdownTestPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*', // Catch-all route
    redirect: () => {
      // No need to re-initialize store here if it's done correctly in beforeEach
      // This redirect will be evaluated after beforeEach has run
      // However, it's safer to access the store instance within the redirect function
      // to ensure it uses the latest state if there were multiple navigations.
      const auth = useAuthStore();
      return auth.isAuthenticated ? { name: 'ScenarioViewer' } : { name: 'Login' };
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  // Pinia is initialized in main.ts before the router, so useAuthStore() is safe here.
  const auth = useAuthStore();

  // Debugging:
  // console.log(`Navigating to: ${to.name?.toString()}, requiresAuth: ${to.meta.requiresAuth}, isAuthenticated: ${auth.isAuthenticated}`);

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // console.log('Redirecting to Login');
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && auth.isAuthenticated) {
    // console.log('Redirecting to ScenarioViewer (already logged in)');
    next({ name: 'ScenarioViewer' });
  } else {
    // console.log('Allowing navigation');
    next();
  }
});

export default router;