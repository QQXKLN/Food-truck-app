<template>
  <main class="auth-container">
    <h1>Recuperar contrasena</h1>
    <p>Ingresa tu correo y generaremos un token temporal de recuperacion.</p>

    <form @submit.prevent="requestReset">
      <label>
        Correo electronico
        <input v-model="email" type="email" required placeholder="tu@correo.com" />
      </label>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Generando..." : "Generar recuperacion" }}
      </button>
    </form>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="resetToken" class="token-box">
      <strong>Token de recuperacion</strong>
      <textarea readonly :value="resetToken" rows="4"></textarea>
      <router-link :to="{ name: 'reset-password', query: { token: resetToken } }" class="link-button">
        Continuar al cambio de contrasena
      </router-link>
    </div>

    <router-link to="/login" class="back-link">Volver al login</router-link>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const isLoading = ref(false);
const message = ref('');
const errorMessage = ref('');
const resetToken = ref('');

const requestReset = async () => {
  isLoading.value = true;
  message.value = '';
  errorMessage.value = '';
  resetToken.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      email: email.value
    });

    message.value = response.data.message;
    resetToken.value = response.data.data?.resetToken || '';
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo generar la recuperacion';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-container { max-width: 440px; margin: 50px auto; font-family: Arial, sans-serif; background: white; border: 1px solid #d9e2ec; border-radius: 8px; padding: 26px; color: #1f2933; }
h1 { margin: 0 0 8px; }
p { color: #64748b; }
form { display: grid; gap: 14px; }
label { display: grid; gap: 6px; font-weight: 700; }
input, textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font: inherit; }
button, .link-button { border: 0; border-radius: 6px; padding: 11px 12px; background: #0f766e; color: white; font-weight: 800; cursor: pointer; text-align: center; text-decoration: none; }
button:disabled { background: #cbd5e1; cursor: not-allowed; }
.success { color: #166534; background: #dcfce7; padding: 10px; border-radius: 6px; }
.error { color: #991b1b; background: #fee2e2; padding: 10px; border-radius: 6px; }
.token-box { display: grid; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 14px; }
.back-link { display: inline-block; margin-top: 16px; color: #334e68; font-weight: 700; }
</style>
