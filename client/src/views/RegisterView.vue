<template>
  <div class="auth-container">
    <h2>Crear Cuenta</h2>
    
    <form @submit.prevent="registerUser">
      <div class="form-group">
        <label>Nombre:</label>
        <input v-model="name" type="text" required placeholder="Ej: Diego" />
      </div>
      
      <div class="form-group">
        <label>Correo Electrónico:</label>
        <input v-model="email" type="email" required placeholder="tu@correo.com" />
      </div>
      
      <div class="form-group">
        <label>Contraseña:</label>
        <input v-model="password" type="password" required />
      </div>
      
      <button type="submit">Registrarse</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    
    <p class="enlace">
      ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// Variables reactivas (lo que escriba el usuario se guarda aquí en tiempo real)
const name = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');

const registerUser = async () => {
  try {
    errorMessage.value = ''; // Limpiamos errores previos
    
    // Enviamos los datos al backend usando la variable de entorno
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
      name: name.value,
      email: email.value,
      password: password.value
    });

    successMessage.value = '¡Registro exitoso! Redirigiendo...';
    
    // Esperamos 2 segundos y lo mandamos a la pantalla de login
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error) {
    // Si el backend responde con un error (ej. el correo ya existe) lo mostramos
    errorMessage.value = error.response?.data?.message || 'Ocurrió un error al registrarse';
  }
};
</script>

<style scoped>
.auth-container { max-width: 400px; margin: 50px auto; font-family: sans-serif; text-align: center; }
.form-group { margin-bottom: 15px; text-align: left; }
input { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
button { width: 100%; padding: 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
button:hover { background-color: #45a049; }
.error { color: red; font-weight: bold; }
.success { color: green; font-weight: bold; }
.enlace { margin-top: 15px; font-size: 0.9em; }
</style>