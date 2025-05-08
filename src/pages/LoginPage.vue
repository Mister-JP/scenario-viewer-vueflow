<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')

const handleLogin = () => {
  authStore.login(username.value, password.value)
}
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div class="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-sm border border-gray-700">
        <h1 class="text-3xl font-bold mb-6 text-center text-sky-400">Login</h1>
        <form @submit.prevent="handleLogin">
          <!-- ... form inputs ... -->
          <div class="mb-4">
            <label for="username" class="block mb-2 text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              id="username"
              v-model="username"
              class="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 text-white"
              placeholder="Your username"
              required
            />
          </div>
          <div class="mb-6">
            <label for="password" class="block mb-2 text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              class="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 text-white"
              placeholder="Your password"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition duration-150 ease-in-out"
          >
            Log In
          </button>
        </form>
        <p class="text-xs text-gray-400 mt-4 text-center">Hint for default: Try username `user` and password `password`</p>
        <p class="mt-6 text-center text-sm">
          Don't have an account?
          <router-link to="/signup" class="font-medium text-green-400 hover:text-green-300">
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </template>