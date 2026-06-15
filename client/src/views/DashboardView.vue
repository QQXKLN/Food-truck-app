<template>
  <div class="dashboard-container">
    <header class="navbar">
      <router-link to="/" class="logo">🍔 Food Truck Express</router-link>
      <nav>
        <span class="user-greeting">👤 Hola, {{ userName }}</span>
        <router-link to="/mis-compras" class="btn-nav btn-notify">🔔 Mis Compras</router-link>
        <router-link to="/" class="btn-nav">Catálogo</router-link>
      </nav>
    </header>

    <div class="main-panel">
      <h2>⚙️ Panel de Administración</h2>
      <div class="panel-grid">
        <section class="form-section">
          <h3>{{ isEditing ? "Editar Food Truck" : "Crear Nuevo Food Truck" }}</h3>
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
                {{ isEditing ? "Actualizar" : "Guardar" }}
              </button>
              <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancelar">Cancelar</button>
            </div>
          </form>
        </section>

        <section class="list-section">
          <h3>Mis Food Trucks</h3>
          <ul class="truck-list">
            <li v-for="truck in trucks" :key="truck.id" class="truck-block">
              <div class="truck-item">
                <div class="truck-info">
                  <strong>{{ truck.name }}</strong>
                  <p>{{ truck.description }}</p>
                </div>
                <div class="truck-actions">
                  <button @click="goToOrders(truck.id)" class="btn-pedidos">📋 Pedidos</button>
                  <button @click="toggleActive(truck)" class="btn-ubica">⚙️ Gestión</button>
                  <button @click="startEdit(truck)" class="btn-editar">Editar</button>
                  <button @click="deleteTruck(truck.id)" class="btn-borrar">Eliminar</button>
                </div>
              </div>

              <div v-if="activeTruckId === truck.id" class="management-panel">
                <h4>🍽️ Menú</h4>
                <ul class="loc-list">
                  <li v-for="dish in truck.dishes" :key="dish.id" class="dish-item">
                    <div v-if="editingDishId === dish.id" class="edit-mode">
                      <input v-model="editDishData.name" placeholder="Nombre" />
                      <input v-model="editDishData.price" type="number" placeholder="$" />
                      <button @click="saveEditDish(dish.id)" class="btn-add">Guardar</button>
                    </div>
                    <div v-else class="read-mode">
                      <strong>{{ dish.name }}</strong> - ${{ dish.price }}
                      <div class="dish-actions">
                        <button @click="handleToggle(dish)" :class="['btn-toggle', dish.isAvailable ? 'btn-available' : 'btn-soldout']">
                          {{ dish.isAvailable ? '✅ Disponible' : '❌ Agotado' }}
                        </button>
                        <button @click="startEditDish(dish)" class="btn-editar">✏️</button>
                        <button @click="deleteDish(dish.id)" class="btn-delete">🗑️</button>
                      </div>
                    </div>
                  </li>
                </ul>
                <form @submit.prevent="addDish(truck.id)" class="add-dish-form">
                  <input v-model="newDish.name" placeholder="Nombre" required />
                  <input v-model="newDish.price" type="number" placeholder="$" required />
                  <button type="submit" class="btn-add">➕ Añadir</button>
                </form>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const trucks = ref([]);
const activeTruckId = ref(null);
const newDish = ref({ name: "", price: "" });
const userName = ref(localStorage.getItem("userName") || "Usuario");
const formTruck = ref({ name: "", description: "", logo: "" });
const isEditing = ref(false);
const editingId = ref(null);
const editingDishId = ref(null);
const editDishData = ref({ name: "", price: "" });

const axiosConfig = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };

const fetchTrucks = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/me`, axiosConfig);
    trucks.value = res.data.data;
  } catch (err) { console.error(err); }
};

const handleToggle = async (dish) => {
  try {
    const newState = !dish.isAvailable;
    await axios.put(`${import.meta.env.VITE_API_URL}/dishes/${dish.id}`, { isAvailable: newState }, axiosConfig);
    dish.isAvailable = newState;
  } catch (err) { alert("Error al actualizar"); }
};

const startEditDish = (dish) => { editingDishId.value = dish.id; editDishData.value = { name: dish.name, price: dish.price }; };
const saveEditDish = async (id) => { 
  await axios.put(`${import.meta.env.VITE_API_URL}/dishes/${id}`, editDishData.value, axiosConfig); 
  editingDishId.value = null; fetchTrucks(); 
};
const addDish = async (truckId) => { 
  await axios.post(`${import.meta.env.VITE_API_URL}/dishes`, { ...newDish.value, foodTruckId: truckId, isAvailable: true }, axiosConfig); 
  newDish.value = { name: "", price: "" }; fetchTrucks(); 
};
const deleteDish = async (id) => { if(confirm("¿Borrar?")) { await axios.delete(`${import.meta.env.VITE_API_URL}/dishes/${id}`, axiosConfig); fetchTrucks(); }};
const handleSubmit = async () => { isEditing.value ? await updateTruck() : await createTruck(); };
const createTruck = async () => { await axios.post(`${import.meta.env.VITE_API_URL}/food-trucks`, formTruck.value, axiosConfig); fetchTrucks(); cancelEdit(); };
const updateTruck = async () => { await axios.put(`${import.meta.env.VITE_API_URL}/food-trucks/${editingId.value}`, formTruck.value, axiosConfig); fetchTrucks(); cancelEdit(); };
const deleteTruck = async (id) => { if (confirm("¿Eliminar?")) { await axios.delete(`${import.meta.env.VITE_API_URL}/food-trucks/${id}`, axiosConfig); fetchTrucks(); }};
const startEdit = (truck) => { isEditing.value = true; editingId.value = truck.id; formTruck.value = { ...truck }; };
const cancelEdit = () => { isEditing.value = false; editingId.value = null; formTruck.value = { name: "", description: "", logo: "" }; };
const goToOrders = (id) => router.push(`/truck-orders/${id}`);
const toggleActive = (truck) => activeTruckId.value = activeTruckId.value === truck.id ? null : truck.id;

onMounted(() => { if (!localStorage.getItem("token")) router.push("/login"); else fetchTrucks(); });
</script>

<style scoped>
/* Estilos mantenidos */
.dashboard-container { font-family: sans-serif; min-height: 100vh; background: #f9f9f9; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background-color: #2c3e50; color: white; }
.panel-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; padding: 20px; max-width: 1200px; margin: auto; }
.form-section, .list-section { background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
.truck-block { border: 1px solid #ddd; margin-bottom: 10px; padding: 15px; border-radius: 6px; }
.btn-toggle { padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold; min-width: 100px; }
.btn-available { background: #d4edda; color: #155724; }
.btn-soldout { background: #f8d7da; color: #721c24; }
.btn-delete { background: #fee; color: #c00; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; }
.btn-add { background: #009688; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
</style>