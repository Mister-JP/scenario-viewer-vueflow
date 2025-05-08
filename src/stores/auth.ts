// src/stores/auth.ts
import { ref } from 'vue' // Removed onMounted
import { defineStore } from 'pinia'
import router from '@/router'

interface User {
  username: string;
  password?: string; // Password will be stored for mock, NOT for real app
}

// Helper function to get users from localStorage
const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem('app-users');
  return stored ? JSON.parse(stored) : [];
};

// Helper function to save users to localStorage
const saveStoredUsers = (users: User[]) => {
  localStorage.setItem('app-users', JSON.stringify(users));
};


export const useAuthStore = defineStore('auth', () => {
  // Initialize state directly
  const storedToken = localStorage.getItem('user-token');
  const storedUserInfo = localStorage.getItem('user-info');

  const isAuthenticated = ref<boolean>(!!storedToken);
  const currentUser = ref<User | null>(storedUserInfo ? JSON.parse(storedUserInfo) : null);
  const users = ref<User[]>(getStoredUsers()); // Load users immediately

  // Ensure consistency: if no token, clear user info
  if (!storedToken) {
    if (currentUser.value) currentUser.value = null;
    if (isAuthenticated.value) isAuthenticated.value = false;
    localStorage.removeItem('user-info'); // Ensure it's removed
  }


  function register(usernameInput: string, passwordInput: string): boolean {
    if (!usernameInput.trim() || !passwordInput.trim()) {
      alert('Username and password cannot be empty.');
      return false;
    }
    // It's good practice to re-fetch users from localStorage here if multiple tabs could modify it,
    // but for this simple app, using the ref directly is often fine.
    // For robustness: users.value = getStoredUsers();
    const existingUser = users.value.find(u => u.username === usernameInput);
    if (existingUser) {
      alert('Username already exists. Please choose another one.');
      return false;
    }

    const newUser: User = { username: usernameInput, password: passwordInput };
    users.value.push(newUser);
    saveStoredUsers(users.value);

    alert('Registration successful! You can now log in.');
    router.push('/login'); // router instance is available here
    return true;
  }

  function login(usernameInput: string, passwordInput: string): boolean {
    // For robustness: users.value = getStoredUsers();
    const userToLogin = users.value.find(u => u.username === usernameInput && u.password === passwordInput);

    if (userToLogin) {
      isAuthenticated.value = true
      currentUser.value = { username: userToLogin.username } // Don't store password in currentUser
      localStorage.setItem('user-token', `mock-jwt-token-for-${userToLogin.username}`)
      localStorage.setItem('user-info', JSON.stringify(currentUser.value))
      router.push('/') // router instance is available here
      return true
    }
    alert('Invalid username or password.')
    return false
  }

  function logout() {
    isAuthenticated.value = false
    currentUser.value = null
    localStorage.removeItem('user-token')
    localStorage.removeItem('user-info')
    router.push('/login') // router instance is available here
  }

  return {
    isAuthenticated,
    user: currentUser,
    users,
    register,
    login,
    logout,
  }
})