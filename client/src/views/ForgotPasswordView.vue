<template>
  <main class="auth-container">
    <template v-if="resetCompleted">
      <h1>Contrasena actualizada</h1>
      <p>Ya puedes iniciar sesion con tu nueva contrasena.</p>
    </template>

    <template v-else-if="resetToken">
      <h1>Nueva contrasena</h1>
      <p>Define una nueva contrasena para <strong>{{ email }}</strong>.</p>

      <form @submit.prevent="changePassword">
        <label>
          Nueva contrasena
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            autocomplete="new-password"
          />
        </label>

        <label>
          Confirmar contrasena
          <input
            v-model="passwordConfirmation"
            type="password"
            required
            minlength="6"
            autocomplete="new-password"
          />
        </label>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? "Actualizando..." : "Cambiar contrasena" }}
        </button>
        <button type="button" class="secondary-button" :disabled="isLoading" @click="restartFlow">
          Usar otro correo
        </button>
      </form>
    </template>

    <template v-else>
      <h1>Recuperar contrasena</h1>
      <p>Ingresa tu correo para continuar con el cambio de contrasena.</p>

      <form @submit.prevent="requestReset">
        <label>
          Correo electronico
          <input v-model="email" type="email" required placeholder="tu@correo.com" autocomplete="email" />
        </label>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? "Verificando..." : "Continuar" }}
        </button>
      </form>
    </template>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <router-link to="/login" class="back-link">Volver al login</router-link>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const isLoading = ref(false);
const message = ref('');
const errorMessage = ref('');
const resetToken = ref('');
const resetCompleted = ref(false);

const clearNotices = () => {
  message.value = '';
  errorMessage.value = '';
};

const requestReset = async () => {
  isLoading.value = true;
  clearNotices();
  resetToken.value = '';

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      email: email.value
    });

    const token = response.data.data?.resetToken || '';
    if (!token) {
      errorMessage.value = 'No se pudo iniciar el cambio en esta pantalla. Verifica el correo y el modo de demostracion.';
      return;
    }

    resetToken.value = token;
    message.value = 'Correo verificado. Ingresa tu nueva contrasena.';
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo generar la recuperacion';
  } finally {
    isLoading.value = false;
  }
};

const changePassword = async () => {
  clearNotices();

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Las contrasenas no coinciden.';
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      token: resetToken.value,
      password: password.value
    });

    resetCompleted.value = true;
    resetToken.value = '';
    password.value = '';
    passwordConfirmation.value = '';
    message.value = response.data.message;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo actualizar la contrasena';
  } finally {
    isLoading.value = false;
  }
};

const restartFlow = () => {
  resetToken.value = '';
  password.value = '';
  passwordConfirmation.value = '';
  clearNotices();
};
</script>

<style scoped>
.auth-container { max-width: 440px; margin: 50px auto; font-family: Arial, sans-serif; background: white; border: 1px solid #d9e2ec; border-radius: 8px; padding: 26px; color: #1f2933; }
h1 { margin: 0 0 8px; }
p { color: #64748b; }
form { display: grid; gap: 14px; }
label { display: grid; gap: 6px; font-weight: 700; }
input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font: inherit; }
button { border: 0; border-radius: 6px; padding: 11px 12px; background: #0f766e; color: white; font-weight: 800; cursor: pointer; }
button:disabled { background: #cbd5e1; cursor: not-allowed; }
.secondary-button { background: #e2e8f0; color: #1e293b; }
.success { color: #166534; background: #dcfce7; padding: 10px; border-radius: 6px; }
.error { color: #991b1b; background: #fee2e2; padding: 10px; border-radius: 6px; }
.back-link { display: inline-block; margin-top: 16px; color: #334e68; font-weight: 700; }
</style>
