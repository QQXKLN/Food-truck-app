<template>
  <div class="auth-container">
    <h2>Iniciar Sesión</h2>
    
    <form @submit.prevent="loginUser">
      <div class="form-group">
        <label>Correo Electrónico:</label>
        <input v-model="email" type="email" required placeholder="tu@correo.com" />
      </div>
      
      <div class="form-group">
        <label>Contraseña:</label>
        <input v-model="password" type="password" required />
      </div>
      
      <button type="submit">Entrar</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    
    <p class="enlace">
      ¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const loginUser = async () => {
  try {
    errorMessage.value = '';
    
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
      email: email.value,
      password: password.value
    });

    // ¡EL PASO CLAVE! Guardamos el token en la memoria del navegador
    localStorage.setItem('token', response.data.token);
    
    // Redirigimos al Panel Principal (que crearemos a continuación)
    router.push('/');

  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Credenciales incorrectas';
  }
};
</script>

<style scoped>
.auth-container { max-width: 400px; margin: 50px auto; font-family: sans-serif; text-align: center; }
.form-group { margin-bottom: 15px; text-align: left; }
input { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
button { width: 100%; padding: 10px; background-color: #2196F3; color: white; border: none; cursor: pointer; }
button:hover { background-color: #0b7dda; }
.error { color: red; font-weight: bold; }
.enlace { margin-top: 15px; font-size: 0.9em; }
</style>