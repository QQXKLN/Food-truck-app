<template>
  <div class="dashboard-container">
    <header>
      <h2>⚙️ Panel de Administración</h2>
      <nav><router-link to="/" class="btn-link">Ver Catálogo Público</router-link></nav>
    </header>

    <div class="panel-grid">
      <section class="form-section">
        <h3>{{ isEditing ? 'Editar Food Truck' : 'Crear Nuevo Food Truck' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="formTruck.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Descripción:</label>
            <textarea v-model="formTruck.description" required></textarea>
          </div>
          <div class="form-group">
            <label>URL del Logo:</label>
            <input v-model="formTruck.logo" type="text" />
          </div>
          <div class="form-actions">
            <button type="submit" :class="isEditing ? 'btn-actualizar' : 'btn-crear'">
              {{ isEditing ? 'Actualizar Food Truck' : 'Guardar Food Truck' }}
            </button>
            <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancelar">Cancelar</button>
          </div>
        </form>
        <p v-if="message" class="feedback-msg">{{ message }}</p>
      </section>

      <section class="list-section">
        <h3>Mis Food Trucks</h3>
        <div v-if="trucks.length === 0">No tienes camiones registrados.</div>
        <ul class="truck-list">
          <li v-for="truck in trucks" :key="truck.id" class="truck-block">
            <div class="truck-item">
              <div class="truck-info">
                <strong>{{ truck.name }}</strong>
                <p>{{ truck.description }}</p>
              </div>
              <div class="truck-actions">
                <button @click="toggleLocations(truck)" class="btn-ubica">📍 Ubicaciones</button>
                <button @click="startEdit(truck)" class="btn-editar">Editar</button>
                <button @click="deleteTruck(truck.id)" class="btn-borrar">Eliminar</button>
              </div>
            </div>

            <!-- PANEL DE UBICACIONES -->
            <div v-if="activeTruckId === truck.id" class="locations-panel">
              <h4>Ubicaciones para {{ truck.name }}</h4>
              <ul v-if="truckLocations.length > 0" class="loc-list">
                <li v-for="loc in truckLocations" :key="loc.id" class="loc-item">
                  
                  <!-- MODO EDICIÓN -->
                  <div v-if="editingLocId === loc.id" class="edit-loc-mode">
                    <input v-model="editLocData.address" type="text" class="small-input" />
                    <input v-model="editLocData.schedule" type="text" class="small-input" />
                    <button @click="saveEditLocation(loc.id)" class="btn-sm btn-green">Guardar</button>
                    <button @click="cancelEditLocation" class="btn-sm btn-gray">X</button>
                  </div>
                  
                  <!-- MODO LECTURA -->
                  <div v-else class="read-loc-mode">
                    <span>🏠 {{ loc.address }} | 🕒 {{ loc.schedule }}</span>
                    <div>
                      <button @click="startEditLocation(loc)" class="btn-sm btn-blue">✏️</button>
                      <button @click="deleteLocation(loc.id)" class="btn-sm btn-red">❌</button>
                    </div>
                  </div>
                  
                </li>
              </ul>
              <p v-else class="no-loc-txt">Sin direcciones registradas.</p>

              <form @submit.prevent="addLocation" class="loc-form">
                <h5>+ Añadir Dirección</h5>
                <input v-model="newLoc.address" type="text" placeholder="Ej: Av. Prat 123" required />
                <input v-model="newLoc.schedule" type="text" placeholder="Ej: Lun-Vie 12:00-20:00" required />
                <button type="submit" class="btn-add-loc">Guardar</button>
              </form>
            </div>
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
const formTruck = ref({ name: '', description: '', logo: '' });
const isEditing = ref(false);
const editingId = ref(null);

const activeTruckId = ref(null);
const truckLocations = ref([]);
const newLoc = ref({ address: '', schedule: '' });

// Variables para editar ubicaciones
const editingLocId = ref(null);
const editLocData = ref({ address: '', schedule: '' });

const token = localStorage.getItem('token');
const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

const fetchTrucks = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/me`, axiosConfig);
    trucks.value = response.data.data;
  } catch (error) { console.error(error); }
};

onMounted(() => { if (!token) router.push('/login'); else fetchTrucks(); });

// Funciones Food Trucks
const startEdit = (truck) => { isEditing.value = true; editingId.value = truck.id; formTruck.value = { ...truck }; };
const cancelEdit = () => { isEditing.value = false; editingId.value = null; formTruck.value = { name: '', description: '', logo: '' }; };
const handleSubmit = async () => { isEditing.value ? await updateTruck() : await createTruck(); };

const createTruck = async () => { await axios.post(`${import.meta.env.VITE_API_URL}/food-trucks`, formTruck.value, axiosConfig); fetchTrucks(); cancelEdit(); };
const updateTruck = async () => { await axios.put(`${import.meta.env.VITE_API_URL}/food-trucks/${editingId.value}`, formTruck.value, axiosConfig); fetchTrucks(); cancelEdit(); };
const deleteTruck = async (id) => { if(confirm('¿Eliminar?')){ await axios.delete(`${import.meta.env.VITE_API_URL}/food-trucks/${id}`, axiosConfig); fetchTrucks(); }};

// Funciones Ubicaciones
const toggleLocations = async (truck) => {
  if (activeTruckId.value === truck.id) activeTruckId.value = null;
  else { activeTruckId.value = truck.id; await fetchLocations(truck.id); }
};
const fetchLocations = async (truckId) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/locations/truck/${truckId}`);
  truckLocations.value = response.data.data;
};
const addLocation = async () => {
  await axios.post(`${import.meta.env.VITE_API_URL}/locations`, { ...newLoc.value, FoodTruckId: activeTruckId.value }, axiosConfig);
  newLoc.value = { address: '', schedule: '' }; fetchLocations(activeTruckId.value);
};
const deleteLocation = async (id) => {
  if (confirm('¿Eliminar ubicación?')) { await axios.delete(`${import.meta.env.VITE_API_URL}/locations/${id}`, axiosConfig); fetchLocations(activeTruckId.value); }
};

// Activar el modo de edición de una ubicación
const startEditLocation = (loc) => {
  editingLocId.value = loc.id;
  editLocData.value = { address: loc.address, schedule: loc.schedule };
};
// Cancelar edición
const cancelEditLocation = () => { editingLocId.value = null; };
// Guardar cambios en el backend
const saveEditLocation = async (locId) => {
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/locations/${locId}`, editLocData.value, axiosConfig);
    editingLocId.value = null;
    await fetchLocations(activeTruckId.value);
  } catch (error) { alert('Error al actualizar'); }
};
</script>

<style scoped>
.dashboard-container { max-width: 1000px; margin: 20px auto; font-family: sans-serif; }
header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;}
.panel-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px; }
.form-group { margin-bottom: 15px; display: flex; flex-direction: column;}
input, textarea { padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px; }
.form-actions { display: flex; gap: 10px; }
.btn-crear { background-color: #4CAF50; color: white; padding: 10px; border: none; cursor: pointer; border-radius: 4px; flex: 1;}
.btn-actualizar { background-color: #ff9800; color: white; padding: 10px; border: none; cursor: pointer; border-radius: 4px; flex: 1;}
.btn-cancelar { background-color: #9e9e9e; color: white; padding: 10px; border: none; cursor: pointer; border-radius: 4px;}

.truck-list { list-style: none; padding: 0; }
.truck-block { border: 1px solid #ddd; margin-bottom: 15px; border-radius: 6px; background-color: #f9f9f9; padding: 10px;}
.truck-item { display: flex; justify-content: space-between; align-items: center; }
.truck-info { flex: 1; }
.truck-actions { display: flex; gap: 5px; }

.btn-ubica { background-color: #9c27b0; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;}
.btn-editar { background-color: #2196F3; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;}
.btn-borrar { background-color: #f44336; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;}

/* Panel Ubicaciones */
.locations-panel { background-color: #fff; margin-top: 10px; padding: 15px; border-radius: 4px; border-left: 4px solid #9c27b0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
.loc-list { list-style: none; padding: 0; margin-bottom: 15px; }
.loc-item { padding: 6px 0; border-bottom: 1px dashed #eee; font-size: 14px; }
.read-loc-mode { display: flex; justify-content: space-between; align-items: center;}
.edit-loc-mode { display: flex; gap: 5px; align-items: center;}
.small-input { padding: 4px; font-size: 12px; flex: 1; margin: 0;}
.btn-sm { border: none; border-radius: 3px; cursor: pointer; padding: 4px 8px; color: white;}
.btn-blue { background-color: #2196F3; }
.btn-red { background-color: #f44336; }
.btn-green { background-color: #4CAF50; }
.btn-gray { background-color: #9e9e9e; }

.loc-form { border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px; }
.loc-form input { width: 95%; display: block; margin-bottom: 8px; font-size: 13px; padding: 6px; }
.btn-add-loc { background-color: #009688; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;}
</style>