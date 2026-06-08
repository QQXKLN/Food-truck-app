<template>
  <div class="dashboard-container">
    <header>
      <h2>⚙️ Panel de Administración</h2>
      <nav>
        <router-link to="/" class="btn-link">Ver Catálogo Público</router-link>
      </nav>
    </header>

    <div class="panel-grid">
      <section class="form-section">
        <h3>Crear Nuevo Food Truck</h3>
        <form @submit.prevent="createTruck">
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="newTruck.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Descripción:</label>
            <textarea v-model="newTruck.description" required></textarea>
          </div>
          <div class="form-group">
            <label>URL del Logo:</label>
            <input v-model="newTruck.logo" type="text" placeholder="https://ejemplo.com/logo.jpg" />
          </div>
          <button type="submit" class="btn-crear">Guardar Food Truck</button>
        </form>
        <p v-if="message" class="feedback-msg">{{ message }}</p>
      </section>

      <section class="list-section">
        <h3>Mis Food Trucks</h3>
        <div v-if="trucks.length === 0">No tienes camiones registrados.</div>
        <ul class="truck-list">
          <li v-for="truck in trucks" :key="truck.id" class="truck-item">
            <div>
              <strong>{{ truck.name }}</strong>
              <p>{{ truck.description }}</p>
            </div>
            <button @click="deleteTruck(truck.id)" class="btn-borrar">Eliminar</button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const trucks = ref([]);
const message = ref('');
const newTruck = ref({ name: '', description: '', logo: '' });

// 1. Obtener la llave de seguridad (Token)
const token = localStorage.getItem('token');

// Configuración de Axios para adjuntar el token automáticamente en los headers
const axiosConfig = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

// 2. Cargar los camiones al entrar a la pantalla
const fetchTrucks = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks`);
    trucks.value = response.data.data;
  } catch (error) {
    console.error('Error al cargar', error);
  }
};

onMounted(() => {
  // Si no hay token, lo pateamos de vuelta al login
  if (!token) {
    router.push('/login');
  } else {
    fetchTrucks();
  }
});

// 3. Crear un nuevo camión
const createTruck = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/food-trucks`, newTruck.value, axiosConfig);
    message.value = '¡Food Truck creado con éxito!';
    newTruck.value = { name: '', description: '', logo: '' }; // Limpiamos el formulario
    fetchTrucks(); // Recargamos la lista
  } catch (error) {
    message.value = 'Error al crear el Food Truck.';
  }
};

// 4. Eliminar un camión
const deleteTruck = async (id) => {
  if (confirm('¿Estás seguro de eliminar este Food Truck?')) {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/food-trucks/${id}`, axiosConfig);
      fetchTrucks(); // Recargamos la lista
    } catch (error) {
      alert('Error al eliminar');
    }
  }
};
</script>

<style scoped>
.dashboard-container { max-width: 900px; margin: 20px auto; font-family: sans-serif; }
header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;}
.panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.form-group { margin-bottom: 15px; display: flex; flex-direction: column;}
input, textarea { padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px; }
.btn-crear { background-color: #4CAF50; color: white; padding: 10px; border: none; cursor: pointer; border-radius: 4px;}
.btn-crear:hover { background-color: #45a049; }
.btn-borrar { background-color: #f44336; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;}
.btn-borrar:hover { background-color: #da190b; }
.truck-list { list-style: none; padding: 0; }
.truck-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 4px;}
.feedback-msg { color: green; font-weight: bold; margin-top: 10px;}
.btn-link { color: #2196F3; text-decoration: none; font-weight: bold; }
</style>