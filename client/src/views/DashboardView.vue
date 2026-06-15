<template>
  <div class="dashboard-container">
    <header>
      <h2>⚙️ Panel de Administración</h2>
      <nav>
        <router-link to="/" class="btn-link">Ver Catálogo Público</router-link>
      </nav>
    </header>

    <div class="panel-grid">
      <!-- Sección Izquierda: Formulario -->
      <section class="form-section">
        <h3>
          {{ isEditing ? "Editar Food Truck" : "Crear Nuevo Food Truck" }}
        </h3>
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
            <button
              type="submit"
              :class="isEditing ? 'btn-actualizar' : 'btn-crear'"
            >
              {{ isEditing ? "Actualizar Food Truck" : "Guardar Food Truck" }}
            </button>
            <button
              v-if="isEditing"
              type="button"
              @click="cancelEdit"
              class="btn-cancelar"
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>

      <!-- Sección Derecha: Listado -->
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
                <button @click="toggleActive(truck)" class="btn-ubica">
                  ⚙️ Gestión
                </button>
                <button @click="startEdit(truck)" class="btn-editar">
                  Editar
                </button>
                <button @click="deleteTruck(truck.id)" class="btn-borrar">
                  Eliminar
                </button>
              </div>
            </div>

            <!-- PANEL DE GESTIÓN (Ubicaciones + Menú) -->
            <div v-if="activeTruckId === truck.id" class="management-panel">
              <!-- Ubicaciones -->
              <div class="sub-panel">
                <h4>📍 Ubicaciones</h4>
                <ul class="loc-list">
                  <li
                    v-for="loc in truckLocations"
                    :key="loc.id"
                    class="loc-item"
                  >
                    <span>🏠 {{ loc.address }} | 🕒 {{ loc.schedule }}</span>
                    <button
                      @click="deleteLocation(loc.id)"
                      class="btn-sm btn-red"
                    >
                      ❌
                    </button>
                  </li>
                </ul>
                <form @submit.prevent="addLocation" class="loc-form">
                  <input
                    v-model="newLoc.address"
                    placeholder="Dirección"
                    required
                  />
                  <input
                    v-model="newLoc.schedule"
                    placeholder="Horario"
                    required
                  />
                  <button type="submit" class="btn-add">
                    Añadir Ubicación
                  </button>
                </form>
              </div>

              <!-- Menú (Dishes) -->
              <div class="sub-panel">
                <h4>🍽️ Menú</h4>
                <ul class="loc-list">
                  <li
                    v-for="dish in truck.dishes"
                    :key="dish.id"
                    class="loc-item"
                  >
                    <!-- MODO EDICIÓN -->
                    <div v-if="editingDishId === dish.id" class="edit-mode">
                      <input v-model="editDishData.name" class="small-input" />
                      <input
                        v-model="editDishData.price"
                        type="number"
                        class="small-input"
                      />
                      <input
                        v-model="editDishData.stock"
                        type="number"
                        class="small-input"
                      />
                      <button
                        @click="saveEditDish(dish.id)"
                        class="btn-sm btn-green"
                      >
                        💾
                      </button>
                    </div>

                    <!-- MODO LECTURA -->
                    <div v-else class="read-mode">
                      <span
                        >{{ dish.name }} - ${{ dish.price }} (Stock:
                        {{ dish.stock }})</span
                      >
                      <div>
                        <button
                          @click="startEditDish(dish)"
                          class="btn-sm btn-blue"
                        >
                          ✏️
                        </button>
                        <button
                          @click="deleteDish(dish.id)"
                          class="btn-sm btn-red"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>

                <form @submit.prevent="addDish(truck.id)" class="loc-form">
                  <input v-model="newDish.name" placeholder="Nombre" required />
                  <input
                    v-model="newDish.price"
                    type="number"
                    placeholder="Precio"
                    required
                  />
                  <input
                    v-model="newDish.stock"
                    type="number"
                    placeholder="Stock"
                    required
                  />
                  <button type="submit" class="btn-add">Añadir</button>
                </form>
              </div>
            </div>
          </li>
        </ul>
      </section>
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
const truckLocations = ref([]);
const newLoc = ref({ address: "", schedule: "" });
const newDish = ref({ name: "", price: "", stock: "" });

const formTruck = ref({ name: "", description: "", logo: "" });
const isEditing = ref(false);
const editingId = ref(null);

const token = localStorage.getItem("token");
const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

const fetchTrucks = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/food-trucks/me`,
      axiosConfig,
    );
    trucks.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const editingDishId = ref(null);
const editDishData = ref({ name: "", price: "", stock: "" });

const startEditDish = (dish) => {
  editingDishId.value = dish.id;
  editDishData.value = {
    name: dish.name,
    price: dish.price,
    stock: dish.stock,
  };
};

const saveEditDish = async (dishId) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/dishes/${dishId}`,
      editDishData.value,
      axiosConfig,
    );
    editingDishId.value = null;
    fetchTrucks(); // Recargamos para ver cambios
  } catch (error) {
    alert("Error al actualizar el plato");
  }
};

onMounted(() => {
  if (!token) router.push("/login");
  else fetchTrucks();
});

// Gestión Truck
const handleSubmit = async () => {
  isEditing.value ? await updateTruck() : await createTruck();
};
const createTruck = async () => {
  await axios.post(
    `${import.meta.env.VITE_API_URL}/food-trucks`,
    formTruck.value,
    axiosConfig,
  );
  fetchTrucks();
  cancelEdit();
};
const updateTruck = async () => {
  await axios.put(
    `${import.meta.env.VITE_API_URL}/food-trucks/${editingId.value}`,
    formTruck.value,
    axiosConfig,
  );
  fetchTrucks();
  cancelEdit();
};
const deleteTruck = async (id) => {
  if (confirm("¿Eliminar?")) {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/food-trucks/${id}`,
      axiosConfig,
    );
    fetchTrucks();
  }
};
const startEdit = (truck) => {
  isEditing.value = true;
  editingId.value = truck.id;
  formTruck.value = { ...truck };
};
const cancelEdit = () => {
  isEditing.value = false;
  editingId.value = null;
  formTruck.value = { name: "", description: "", logo: "" };
};

// Gestión UI Panels
const toggleActive = async (truck) => {
  if (activeTruckId.value === truck.id) activeTruckId.value = null;
  else {
    activeTruckId.value = truck.id;
    await fetchLocations(truck.id);
  }
};

// Gestión Ubicaciones
const fetchLocations = async (truckId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/locations/truck/${truckId}`,
  );
  truckLocations.value = response.data.data;
};
const addLocation = async () => {
  await axios.post(
    `${import.meta.env.VITE_API_URL}/locations`,
    { ...newLoc.value, FoodTruckId: activeTruckId.value },
    axiosConfig,
  );
  newLoc.value = { address: "", schedule: "" };
  fetchLocations(activeTruckId.value);
};
const deleteLocation = async (id) => {
  await axios.delete(
    `${import.meta.env.VITE_API_URL}/locations/${id}`,
    axiosConfig,
  );
  fetchLocations(activeTruckId.value);
};

// Gestión Platos
const addDish = async (truckId) => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/dishes`,
      { ...newDish.value, foodTruckId: truckId },
      axiosConfig,
    );
    newDish.value = { name: "", price: "", stock: "" };
    fetchTrucks(); // Recargar todo
  } catch (error) {
    alert("Error al agregar plato");
  }
};
const deleteDish = async (id) => {
  await axios.delete(
    `${import.meta.env.VITE_API_URL}/dishes/${id}`,
    axiosConfig,
  );
  fetchTrucks();
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: 20px auto;
  font-family: sans-serif;
}
.edit-mode { display: flex; gap: 5px; flex-grow: 1; }
.read-mode { display: flex; justify-content: space-between; flex-grow: 1; align-items: center; }
.small-input { width: 60px; padding: 2px; }
.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 30px;
}
.truck-block {
  border: 1px solid #ddd;
  margin-bottom: 15px;
  border-radius: 6px;
  padding: 10px;
  background: #f9f9f9;
}
.management-panel {
  background: #fff;
  padding: 15px;
  border: 1px solid #ddd;
  margin-top: 10px;
}
.sub-panel {
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.loc-list {
  list-style: none;
  padding: 0;
}
.loc-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 14px;
}
.loc-form {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}
.btn-add {
  background: #009688;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
}
.btn-sm {
  padding: 2px 8px;
  cursor: pointer;
}
.btn-red {
  background: #f44336;
  color: white;
  border: none;
}
</style>
