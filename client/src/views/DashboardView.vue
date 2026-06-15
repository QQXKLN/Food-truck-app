<template>
  <div class="dashboard-container">
    <header class="navbar">
      <router-link to="/" class="logo">Food Truck Express</router-link>
      <nav>
        <span class="user-greeting">Hola, {{ userName }}</span>
        <router-link to="/mis-compras" class="btn-nav">Mis compras</router-link>
        <router-link to="/" class="btn-nav">Catalogo</router-link>
      </nav>
    </header>

    <main class="main-panel">
      <section class="page-heading">
        <div>
          <h1>Panel de administracion</h1>
          <p>Administra tus trucks, ubicaciones activas y menu disponible para hoy.</p>
        </div>
        <button @click="fetchTrucks" class="btn-secondary">Actualizar</button>
      </section>

      <div class="panel-grid">
        <section class="form-section">
          <h2>{{ isEditing ? "Editar Food Truck" : "Crear Food Truck" }}</h2>
          <form @submit.prevent="handleSubmit" class="stack-form">
            <label>
              Nombre
              <input v-model="formTruck.name" type="text" required />
            </label>

            <label>
              Descripcion
              <textarea v-model="formTruck.description" required rows="4"></textarea>
            </label>

            <label>
              URL del logo
              <input v-model="formTruck.logo" type="url" placeholder="https://..." />
            </label>

            <div class="form-actions">
              <button type="submit" class="btn-primary">
                {{ isEditing ? "Actualizar" : "Guardar" }}
              </button>
              <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-secondary">Cancelar</button>
            </div>
          </form>
        </section>

        <section class="list-section">
          <h2>Mis Food Trucks</h2>

          <p v-if="trucks.length === 0" class="empty-state">Aun no tienes food trucks registrados.</p>

          <ul class="truck-list">
            <li v-for="truck in trucks" :key="truck.id" class="truck-block">
              <div class="truck-item">
                <div class="truck-info">
                  <strong>{{ truck.name }}</strong>
                  <p>{{ truck.description }}</p>
                  <span :class="['status-pill', truck.activeLocation ? 'open' : 'closed']">
                    {{ truck.activeLocation ? "Activo ahora" : "Sin ubicacion activa" }}
                  </span>
                </div>

                <div class="truck-actions">
                  <button @click="goToOrders(truck.id)" class="btn-secondary">Pedidos</button>
                  <button @click="toggleActive(truck)" class="btn-secondary">Gestion</button>
                  <button @click="startEdit(truck)" class="btn-secondary">Editar</button>
                  <button @click="deleteTruck(truck.id)" class="btn-danger">Eliminar</button>
                </div>
              </div>

              <div v-if="activeTruckId === truck.id" class="management-panel">
                <section class="manager-section">
                  <div class="section-title">
                    <h3>Menu base y stock de hoy</h3>
                    <span>{{ today }}</span>
                  </div>

                  <ul class="dish-list">
                    <li v-for="dish in truck.dishes" :key="dish.id" class="dish-row">
                      <div v-if="editingDishId === dish.id" class="edit-grid">
                        <input v-model="editDishData.name" placeholder="Nombre" />
                        <input v-model="editDishData.price" type="number" min="1" step="1" placeholder="Precio" />
                        <textarea v-model="editDishData.description" rows="2" placeholder="Descripcion o ingredientes"></textarea>
                        <div class="inline-actions">
                          <button @click="saveEditDish(dish.id)" class="btn-primary">Guardar</button>
                          <button @click="cancelEditDish" class="btn-secondary">Cancelar</button>
                        </div>
                      </div>

                      <div v-else class="dish-content">
                        <div class="dish-main">
                          <strong>{{ dish.name }}</strong>
                          <span>${{ Number(dish.price).toLocaleString() }}</span>
                          <p>{{ dish.description || "Sin descripcion" }}</p>
                        </div>

                        <div class="dish-controls">
                          <label class="stock-control">
                            Stock hoy
                            <input
                              type="number"
                              min="0"
                              :value="getStockDraft(truck, dish)"
                              @input="setStockDraft(truck.id, dish.id, $event.target.value)"
                            />
                          </label>

                          <label class="check-control">
                            <input
                              type="checkbox"
                              :checked="getDailyAvailability(truck, dish)"
                              @change="setDailyAvailability(truck.id, dish.id, $event.target.checked)"
                            />
                            En menu hoy
                          </label>

                          <span class="stock-badge">
                            {{ dailyMenuLabel(truck, dish) }}
                          </span>

                          <button @click="saveDailyMenuItem(truck, dish)" class="btn-primary">Publicar</button>
                          <button @click="handleToggle(dish)" :class="['btn-secondary', !dish.isAvailable ? 'muted' : '']">
                            {{ dish.isAvailable ? "Pausar plato" : "Activar plato" }}
                          </button>
                          <button @click="startEditDish(dish)" class="btn-secondary">Editar</button>
                          <button @click="deleteDish(dish.id)" class="btn-danger">Eliminar</button>
                        </div>
                      </div>
                    </li>
                  </ul>

                  <form @submit.prevent="addDish(truck.id)" class="add-dish-form">
                    <input v-model="newDish.name" placeholder="Nombre del plato" required />
                    <input v-model="newDish.price" type="number" min="1" step="1" placeholder="Precio" required />
                    <textarea v-model="newDish.description" rows="2" placeholder="Descripcion breve o ingredientes"></textarea>
                    <button type="submit" class="btn-primary">Anadir plato</button>
                  </form>
                </section>

                <section class="manager-section">
                  <div class="section-title">
                    <h3>Ubicaciones por dia</h3>
                    <span>{{ truck.locations?.length || 0 }} registradas</span>
                  </div>

                  <ul class="location-list">
                    <li v-for="location in truck.locations" :key="location.id" class="location-row">
                      <div>
                        <strong>{{ dayLabel(location.dayOfWeek) }}</strong>
                        <p>{{ location.address }}</p>
                        <span>{{ formatTime(location.startTime) }} - {{ formatTime(location.endTime) }}</span>
                      </div>
                      <div class="location-actions">
                        <span :class="['status-pill', location.isActive ? 'open' : 'closed']">
                          {{ location.isActive ? "Activa" : "Pausada" }}
                        </span>
                        <button @click="deleteLocation(location.id)" class="btn-danger">Eliminar</button>
                      </div>
                    </li>
                  </ul>

                  <form @submit.prevent="addLocation(truck.id)" class="location-form">
                    <input v-model="locationForm(truck.id).address" placeholder="Direccion o punto de referencia" required />
                    <select v-model.number="locationForm(truck.id).dayOfWeek" required>
                      <option v-for="day in days" :key="day.value" :value="day.value">{{ day.label }}</option>
                    </select>
                    <input v-model="locationForm(truck.id).startTime" type="time" required />
                    <input v-model="locationForm(truck.id).endTime" type="time" required />
                    <label class="check-control">
                      <input v-model="locationForm(truck.id).isActive" type="checkbox" />
                      Activa
                    </label>
                    <button type="submit" class="btn-primary">Anadir ubicacion</button>
                  </form>
                </section>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const trucks = ref([]);
const activeTruckId = ref(null);
const newDish = ref({ name: "", price: "", description: "" });
const userName = ref(localStorage.getItem("userName") || "Usuario");
const formTruck = ref({ name: "", description: "", logo: "" });
const isEditing = ref(false);
const editingId = ref(null);
const editingDishId = ref(null);
const editDishData = ref({ name: "", price: "", description: "" });
const dailyStockDrafts = ref({});
const dailyAvailabilityDrafts = ref({});
const locationForms = ref({});

const days = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" }
];

const today = (() => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
})();

const axiosConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const getErrorMessage = (error, fallback = "Ocurrio un error") => {
  return error.response?.data?.message || fallback;
};

const fetchTrucks = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/me`, axiosConfig());
    trucks.value = res.data.data;
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo cargar el panel"));
  }
};

const handleToggle = async (dish) => {
  try {
    const newState = !dish.isAvailable;
    await axios.put(`${import.meta.env.VITE_API_URL}/dishes/${dish.id}`, { isAvailable: newState }, axiosConfig());
    dish.isAvailable = newState;
  } catch (err) {
    alert(getErrorMessage(err, "Error al actualizar plato"));
  }
};

const startEditDish = (dish) => {
  editingDishId.value = dish.id;
  editDishData.value = { name: dish.name, price: dish.price, description: dish.description || "" };
};

const cancelEditDish = () => {
  editingDishId.value = null;
  editDishData.value = { name: "", price: "", description: "" };
};

const saveEditDish = async (id) => {
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/dishes/${id}`, editDishData.value, axiosConfig());
    cancelEditDish();
    fetchTrucks();
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo actualizar el plato"));
  }
};

const addDish = async (truckId) => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/dishes`,
      { ...newDish.value, foodTruckId: truckId, isAvailable: true },
      axiosConfig()
    );
    newDish.value = { name: "", price: "", description: "" };
    fetchTrucks();
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo crear el plato"));
  }
};

const deleteDish = async (id) => {
  if (!confirm("Eliminar este plato?")) return;

  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/dishes/${id}`, axiosConfig());
    fetchTrucks();
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo eliminar el plato"));
  }
};

const getDailyMenuItem = (truck, dish) => {
  return (truck.todayMenu || truck.dailyMenuItems || []).find((item) => Number(item.dishId) === Number(dish.id));
};

const stockKey = (truckId, dishId) => `${truckId}:${dishId}`;

const getStockDraft = (truck, dish) => {
  const key = stockKey(truck.id, dish.id);
  if (dailyStockDrafts.value[key] !== undefined) return dailyStockDrafts.value[key];
  return getDailyMenuItem(truck, dish)?.stock ?? 0;
};

const setStockDraft = (truckId, dishId, value) => {
  dailyStockDrafts.value[stockKey(truckId, dishId)] = value;
};

const getDailyAvailability = (truck, dish) => {
  const key = stockKey(truck.id, dish.id);
  if (dailyAvailabilityDrafts.value[key] !== undefined) return dailyAvailabilityDrafts.value[key];
  return getDailyMenuItem(truck, dish)?.isAvailable ?? true;
};

const setDailyAvailability = (truckId, dishId, checked) => {
  dailyAvailabilityDrafts.value[stockKey(truckId, dishId)] = checked;
};

const dailyMenuLabel = (truck, dish) => {
  const menuItem = getDailyMenuItem(truck, dish);
  if (!menuItem) return "No publicado hoy";
  return `Stock actual: ${menuItem.stock}`;
};

const saveDailyMenuItem = async (truck, dish) => {
  try {
    const stock = Number(getStockDraft(truck, dish));
    if (Number.isNaN(stock) || stock < 0) {
      alert("El stock debe ser 0 o mayor");
      return;
    }

    await axios.post(
      `${import.meta.env.VITE_API_URL}/food-trucks/${truck.id}/daily-menu`,
      {
        dishId: dish.id,
        date: today,
        stock,
        isAvailable: getDailyAvailability(truck, dish)
      },
      axiosConfig()
    );

    fetchTrucks();
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo publicar el plato de hoy"));
  }
};

const locationForm = (truckId) => {
  if (!locationForms.value[truckId]) {
    locationForms.value[truckId] = {
      address: "",
      dayOfWeek: new Date().getDay(),
      startTime: "12:00",
      endTime: "18:00",
      isActive: true
    };
  }
  return locationForms.value[truckId];
};

const addLocation = async (truckId) => {
  try {
    const form = locationForm(truckId);
    await axios.post(
      `${import.meta.env.VITE_API_URL}/locations`,
      {
        foodTruckId: truckId,
        address: form.address,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        schedule: `${form.startTime} - ${form.endTime}`,
        isActive: form.isActive
      },
      axiosConfig()
    );

    locationForms.value[truckId] = {
      address: "",
      dayOfWeek: new Date().getDay(),
      startTime: "12:00",
      endTime: "18:00",
      isActive: true
    };
    fetchTrucks();
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo anadir la ubicacion"));
  }
};

const deleteLocation = async (id) => {
  if (!confirm("Eliminar esta ubicacion?")) return;

  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/locations/${id}`, axiosConfig());
    fetchTrucks();
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo eliminar la ubicacion"));
  }
};

const handleSubmit = async () => {
  isEditing.value ? await updateTruck() : await createTruck();
};

const createTruck = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/food-trucks`, formTruck.value, axiosConfig());
    fetchTrucks();
    cancelEdit();
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo crear el Food Truck"));
  }
};

const updateTruck = async () => {
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/food-trucks/${editingId.value}`, formTruck.value, axiosConfig());
    fetchTrucks();
    cancelEdit();
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo actualizar el Food Truck"));
  }
};

const deleteTruck = async (id) => {
  if (!confirm("Eliminar este Food Truck?")) return;

  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/food-trucks/${id}`, axiosConfig());
    fetchTrucks();
  } catch (err) {
    alert(getErrorMessage(err, "No se pudo eliminar el Food Truck"));
  }
};

const startEdit = (truck) => {
  isEditing.value = true;
  editingId.value = truck.id;
  formTruck.value = { name: truck.name, description: truck.description, logo: truck.logo || "" };
};

const cancelEdit = () => {
  isEditing.value = false;
  editingId.value = null;
  formTruck.value = { name: "", description: "", logo: "" };
};

const goToOrders = (id) => router.push(`/truck-orders/${id}`);

const toggleActive = (truck) => {
  activeTruckId.value = activeTruckId.value === truck.id ? null : truck.id;
};

const dayLabel = (value) => {
  return days.find((day) => day.value === Number(value))?.label || "Sin dia";
};

const formatTime = (value) => {
  return value ? String(value).slice(0, 5) : "--:--";
};

onMounted(() => {
  if (!localStorage.getItem("token")) router.push("/login");
  else fetchTrucks();
});
</script>

<style scoped>
.dashboard-container { font-family: Arial, sans-serif; min-height: 100vh; background: #f4f6f8; color: #1f2933; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 30px; background-color: #243447; color: white; }
.logo { font-size: 21px; font-weight: 700; color: white; text-decoration: none; }
nav { display: flex; gap: 14px; align-items: center; }
.btn-nav { color: white; text-decoration: none; font-weight: 700; font-size: 14px; }
.user-greeting { color: #dbe4ee; font-size: 14px; }
.main-panel { max-width: 1240px; margin: 0 auto; padding: 28px 20px 44px; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 22px; }
.page-heading h1 { margin: 0; font-size: 30px; }
.page-heading p { margin: 6px 0 0; color: #64748b; }
.panel-grid { display: grid; grid-template-columns: 360px minmax(0, 1fr); gap: 20px; align-items: start; }
.form-section, .list-section { background: white; border: 1px solid #d9e2ec; border-radius: 8px; padding: 20px; }
h2, h3 { margin: 0 0 14px; }
.stack-form, .add-dish-form, .location-form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: #334155; }
input, textarea, select { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 11px; font: inherit; background: white; }
textarea { resize: vertical; }
.form-actions, .inline-actions, .truck-actions, .dish-controls, .location-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
button { border: 0; border-radius: 6px; padding: 9px 12px; font-weight: 700; cursor: pointer; }
.btn-primary { background: #0f766e; color: white; }
.btn-secondary { background: #e2e8f0; color: #1e293b; }
.btn-secondary.muted { background: #f1f5f9; color: #64748b; }
.btn-danger { background: #fee2e2; color: #b91c1c; }
.empty-state { color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; }
.truck-list, .dish-list, .location-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
.truck-block { border: 1px solid #d9e2ec; border-radius: 8px; background: #ffffff; overflow: hidden; }
.truck-item { display: flex; justify-content: space-between; gap: 14px; padding: 16px; }
.truck-info strong { display: block; font-size: 18px; margin-bottom: 4px; }
.truck-info p { margin: 0 0 10px; color: #64748b; }
.status-pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 9px; font-size: 12px; font-weight: 800; }
.status-pill.open { color: #166534; background: #dcfce7; }
.status-pill.closed { color: #92400e; background: #fef3c7; }
.management-panel { border-top: 1px solid #e2e8f0; padding: 16px; display: grid; gap: 18px; background: #f8fafc; }
.manager-section { display: grid; gap: 14px; }
.section-title { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.section-title span { color: #64748b; font-size: 13px; font-weight: 700; }
.dish-row, .location-row { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
.dish-content, .location-row { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }
.dish-main { min-width: 220px; }
.dish-main strong { font-size: 16px; }
.dish-main span { display: inline-block; margin-left: 8px; font-weight: 800; color: #0f766e; }
.dish-main p, .location-row p { margin: 6px 0 0; color: #64748b; }
.dish-controls { justify-content: flex-end; max-width: 520px; }
.stock-control { width: 110px; }
.check-control { display: flex; grid-template-columns: auto 1fr; align-items: center; gap: 7px; white-space: nowrap; }
.check-control input { width: auto; }
.stock-badge { background: #eef2ff; color: #3730a3; border-radius: 999px; padding: 6px 9px; font-size: 12px; font-weight: 800; }
.edit-grid { display: grid; grid-template-columns: 1fr 120px; gap: 10px; }
.edit-grid textarea, .edit-grid .inline-actions { grid-column: 1 / -1; }
.add-dish-form { grid-template-columns: minmax(0, 1fr) 120px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
.add-dish-form textarea, .add-dish-form button { grid-column: 1 / -1; }
.location-form { grid-template-columns: minmax(0, 1.5fr) 130px 110px 110px auto; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; align-items: center; }
.location-form button { grid-column: 1 / -1; }

@media (max-width: 900px) {
  .panel-grid { grid-template-columns: 1fr; }
  .truck-item, .dish-content, .location-row, .page-heading { flex-direction: column; }
  .dish-controls { justify-content: flex-start; max-width: none; }
  .location-form, .add-dish-form, .edit-grid { grid-template-columns: 1fr; }
  .location-form button, .add-dish-form textarea, .add-dish-form button, .edit-grid textarea, .edit-grid .inline-actions { grid-column: auto; }
}
</style>
