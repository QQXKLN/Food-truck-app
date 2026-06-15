<template>
  <main class="auth-container">
    <h1>Iniciar sesion</h1>

    <form @submit.prevent="loginUser">
      <label>
        Correo electronico
        <input v-model="email" type="email" required placeholder="tu@correo.com" />
      </label>

      <label>
        Contrasena
        <input v-model="password" type="password" required />
      </label>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Entrando..." : "Entrar" }}
      </button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <p class="enlace">
      No tienes cuenta? <router-link to="/register">Registrate aqui</router-link>
    </p>
    <p class="enlace">
      <router-link to="/forgot-password">Olvide mi contrasena</router-link>
    </p>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const loginUser = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
      email: email.value,
      password: password.value
    });

    const token = response.data.token || response.data.data?.token;
    if (token) localStorage.setItem('token', token);

    const userObj = response.data.user || response.data.data?.user || response.data.data || response.data;
    const finalName = userObj?.name || userObj?.username || userObj?.firstName || 'Usuario';
    localStorage.setItem('userName', finalName);

    router.push('/');
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Credenciales incorrectas';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-container { max-width: 420px; margin: 50px auto; font-family: Arial, sans-serif; text-align: center; background: white; border: 1px solid #d9e2ec; border-radius: 8px; padding: 26px; color: #1f2933; }
h1 { margin: 0 0 20px; }
form { display: grid; gap: 14px; }
label { display: grid; gap: 6px; text-align: left; font-weight: 700; }
input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font: inherit; }
button { width: 100%; padding: 11px; background-color: #0f766e; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; }
button:disabled { background: #cbd5e1; cursor: not-allowed; }
.error { color: #991b1b; background: #fee2e2; padding: 10px; border-radius: 6px; font-weight: 700; }
.enlace { margin-top: 15px; font-size: 0.95em; }
a { color: #0f766e; font-weight: 800; }
</style>
