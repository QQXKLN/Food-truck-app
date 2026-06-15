<template>
  <main class="auth-container">
    <h1>Nueva contrasena</h1>
    <p>Pega el token de recuperacion y define tu nueva contrasena.</p>

    <form @submit.prevent="resetPassword">
      <label>
        Token
        <textarea v-model="token" rows="4" required></textarea>
      </label>

      <label>
        Nueva contrasena
        <input v-model="password" type="password" required minlength="6" />
      </label>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Actualizando..." : "Actualizar contrasena" }}
      </button>
    </form>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <router-link to="/login" class="back-link">Volver al login</router-link>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const token = ref('');
const password = ref('');
const isLoading = ref(false);
const message = ref('');
const errorMessage = ref('');

const resetPassword = async () => {
  isLoading.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      token: token.value,
      password: password.value
    });

    message.value = response.data.message;
    password.value = '';
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo actualizar la contrasena';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (route.query.token) token.value = String(route.query.token);
});
</script>

<style scoped>
.auth-container { max-width: 440px; margin: 50px auto; font-family: Arial, sans-serif; background: white; border: 1px solid #d9e2ec; border-radius: 8px; padding: 26px; color: #1f2933; }
h1 { margin: 0 0 8px; }
p { color: #64748b; }
form { display: grid; gap: 14px; }
label { display: grid; gap: 6px; font-weight: 700; }
input, textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font: inherit; }
button { border: 0; border-radius: 6px; padding: 11px 12px; background: #0f766e; color: white; font-weight: 800; cursor: pointer; }
button:disabled { background: #cbd5e1; cursor: not-allowed; }
.success { color: #166534; background: #dcfce7; padding: 10px; border-radius: 6px; }
.error { color: #991b1b; background: #fee2e2; padding: 10px; border-radius: 6px; }
.back-link { display: inline-block; margin-top: 16px; color: #334e68; font-weight: 700; }
</style>
