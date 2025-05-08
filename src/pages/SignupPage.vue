<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleSignup = () => {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match!")
    return
  }
  authStore.register(username.value, password.value)
  // The register function in the store will handle redirection on success
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
    <div class="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-sm border border-gray-700">
      <h1 class="text-3xl font-bold mb-6 text-center text-sky-400">Sign Up</h1>
      <form @submit.prevent="handleSignup">
        <div class="mb-4">
          <label for="username" class="block mb-2 text-sm font-medium text-gray-300">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            class="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 text-white"
            placeholder="Choose a username"
            required
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block mb-2 text-sm font-medium text-gray-300">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 text-white"
            placeholder="Create a password"
            required
          />
        </div>
        <div class="mb-6">
          <label for="confirmPassword" class="block mb-2 text-sm font-medium text-gray-300">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            class="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 text-white"
            placeholder="Confirm your password"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-sm transition duration-150 ease-in-out"
        >
          Create Account
        </button>
      </form>
      <p class="mt-6 text-center text-sm">
        Already have an account?
        <router-link to="/login" class="font-medium text-sky-400 hover:text-sky-300">
          Log in
        </router-link>
      </p>
    </div>
  </div>
</template>