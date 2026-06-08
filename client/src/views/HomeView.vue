<template>
  <div class="home-container">
    <header>
      <h1>🚚 Catálogo de Food Trucks</h1>
      <div>
        <router-link to="/dashboard" class="btn-dashboard">Ir al Dashboard</router-link>
        <button @click="logout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </header>

    <main>
      <div v-if="trucks.length === 0" class="empty-state">
        <p>No hay Food Trucks registrados aún.</p>
      </div>

      <div class="grid-trucks">
        <div v-for="truck in trucks" :key="truck.id" class="truck-card">
          <h3>{{ truck.name }}</h3>
          <p>{{ truck.description }}</p>
          <span class="status">Ubicación Activa: Pendiente</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const trucks = ref([]); // Lista vacía que llenaremos con los datos del servidor

// Esta función se ejecuta apenas el usuario entra a la pantalla
onMounted(async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks`);
    trucks.value = response.data.data;
  } catch (error) {
    console.error("Error al cargar los Food Trucks", error);
  }
});

const logout = () => {
  localStorage.removeItem('token'); // Borramos la llave de la memoria
  router.push('/login'); // Lo devolvemos al login
};
</script>

<style scoped>
.home-container { padding: 20px; font-family: sans-serif; max-width: 1000px; margin: 0 auto; }
header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;}
.btn-logout { background-color: #ff4d4f; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; }
.btn-logout:hover { background-color: #d9363e; }
.grid-trucks { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
.truck-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.status { display: inline-block; margin-top: 10px; font-size: 0.85em; color: #666; background: #f0f0f0; padding: 3px 8px; border-radius: 12px; }
.btn-dashboard { background-color: #2196F3; color: white; text-decoration: none; padding: 8px 15px; border-radius: 4px; margin-right: 10px; font-size: 0.9em; }
.btn-dashboard:hover { background-color: #0b7dda; }
</style>