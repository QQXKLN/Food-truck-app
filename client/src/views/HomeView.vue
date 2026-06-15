<template>
  <div class="home-container">
    <header class="navbar">
      <router-link to="/" class="logo">Food Truck Express</router-link>

      <nav>
        <button @click="goToCart" class="btn-nav btn-cart">
          Carrito ({{ cartStore.cartCount }})
        </button>

        <template v-if="isLoggedIn">
          <span class="user-greeting">Hola, {{ userName }}</span>
          <router-link to="/mis-compras" class="btn-nav">Mis compras</router-link>
          <router-link to="/dashboard" class="btn-nav btn-highlight">Mi panel</router-link>
          <button @click="logout" class="btn-logout">Cerrar sesion</button>
        </template>

        <template v-else>
          <router-link to="/login" class="btn-nav">Iniciar sesion</router-link>
          <router-link to="/register" class="btn-nav btn-highlight">Registrarse</router-link>
        </template>
      </nav>
    </header>

    <main>
      <section class="hero">
        <div>
          <h1>Food trucks cerca de ti</h1>
          <p>Revisa quien esta activo hoy, mira su menu disponible y arma tu pedido.</p>
        </div>
      </section>

      <section class="catalog">
        <div class="section-heading">
          <h2>Catalogo</h2>
          <button @click="fetchAllTrucks" class="btn-refresh">Actualizar</button>
        </div>

        <div v-if="trucks.length === 0" class="empty-state">
          No hay Food Trucks disponibles por ahora.
        </div>

        <div class="grid">
          <article v-for="truck in trucks" :key="truck.id" class="card">
            <img
              :src="truck.logo || 'https://placehold.co/420x220?text=Food+Truck'"
              alt="Logo"
              class="card-img"
            />

            <div class="card-content">
              <div class="card-title">
                <h3>{{ truck.name }}</h3>
                <span :class="['status-pill', truck.activeLocation ? 'open' : 'closed']">
                  {{ truck.activeLocation ? "Abierto" : "Cerrado" }}
                </span>
              </div>

              <p class="desc">{{ truck.description }}</p>

              <div v-if="truck.activeLocation" class="location-box">
                <strong>Ubicacion actual</strong>
                <span>{{ truck.activeLocation.address }}</span>
                <small>{{ formatTime(truck.activeLocation.startTime) }} - {{ formatTime(truck.activeLocation.endTime) }}</small>
              </div>

              <div v-else class="location-box closed">
                <strong>Sin ubicacion activa</strong>
                <span>Este truck no recibe pedidos en este momento.</span>
              </div>

              <div class="menu-count">
                {{ truck.todayMenu?.length || 0 }} platos publicados hoy
              </div>

              <router-link :to="`/truck/${truck.id}`" class="btn-menu">
                Ver menu
              </router-link>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cartStore";

const router = useRouter();
const cartStore = useCartStore();
const trucks = ref([]);
const isLoggedIn = ref(false);
const userName = ref("Usuario");

const resolveUserName = () => {
  const storedName = localStorage.getItem("userName");
  if (storedName) {
    userName.value = storedName;
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    userName.value = "Usuario";
    return;
  }

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    userName.value = payload.name || payload.username || payload.firstName || payload.email || "Usuario";
  } catch (error) {
    userName.value = "Usuario";
  }
};

const checkAuth = () => {
  isLoggedIn.value = Boolean(localStorage.getItem("token"));
};

const fetchAllTrucks = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks`);
    trucks.value = response.data.data;
  } catch (error) {
    alert(error.response?.data?.message || "No se pudo cargar el catalogo");
  }
};

const goToCart = () => {
  if (cartStore.items.length === 0) {
    alert("Tu carrito esta vacio. Agrega algo desde un menu primero.");
    return;
  }

  const truckId = cartStore.items[0].foodTruckId;
  router.push(`/checkout/${truckId}`);
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  isLoggedIn.value = false;
  userName.value = "Usuario";
  router.push("/");
};

const formatTime = (value) => {
  return value ? String(value).slice(0, 5) : "--:--";
};

onMounted(() => {
  checkAuth();
  resolveUserName();
  fetchAllTrucks();
});
</script>

<style scoped>
.home-container { font-family: Arial, sans-serif; background-color: #f4f6f8; min-height: 100vh; color: #1f2933; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 30px; background-color: #243447; color: white; }
.logo { font-size: 21px; font-weight: 700; color: white; text-decoration: none; }
nav { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.btn-nav { color: white; text-decoration: none; font-weight: 700; font-size: 14px; background: none; border: none; cursor: pointer; }
.btn-highlight { background-color: #f59e0b; color: #1f2933; padding: 8px 12px; border-radius: 6px; }
.btn-logout { background-color: transparent; border: 1px solid #cbd5e1; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 700; }
.btn-cart { background: #334e68; padding: 9px 12px; border-radius: 6px; }
.user-greeting { font-size: 14px; color: #dbe4ee; }
.hero { background: white; border-bottom: 1px solid #d9e2ec; padding: 52px 20px; }
.hero div { max-width: 1100px; margin: 0 auto; }
.hero h1 { margin: 0; font-size: 42px; }
.hero p { margin: 10px 0 0; max-width: 620px; color: #64748b; font-size: 18px; }
.catalog { padding: 34px 20px 48px; max-width: 1120px; margin: 0 auto; }
.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
.section-heading h2 { margin: 0; font-size: 26px; }
.btn-refresh { border: 0; border-radius: 6px; padding: 9px 12px; background: #e2e8f0; color: #1e293b; font-weight: 800; cursor: pointer; }
.empty-state { text-align: center; padding: 34px; background: white; border: 1px dashed #cbd5e1; border-radius: 8px; color: #64748b; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 22px; }
.card { background-color: white; border: 1px solid #d9e2ec; border-radius: 8px; overflow: hidden; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05); }
.card-img { width: 100%; height: 190px; object-fit: cover; background: #e2e8f0; }
.card-content { padding: 18px; display: grid; gap: 14px; }
.card-title { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.card-title h3 { margin: 0; font-size: 20px; }
.desc { margin: 0; color: #64748b; min-height: 44px; }
.status-pill { display: inline-flex; border-radius: 999px; padding: 5px 9px; font-size: 12px; font-weight: 800; white-space: nowrap; }
.status-pill.open { color: #166534; background: #dcfce7; }
.status-pill.closed { color: #92400e; background: #fef3c7; }
.location-box { display: grid; gap: 4px; border-left: 4px solid #0f766e; background: #ecfdf5; padding: 12px; border-radius: 6px; }
.location-box.closed { border-left-color: #f59e0b; background: #fffbeb; }
.location-box span { color: #334155; }
.location-box small { color: #64748b; font-weight: 700; }
.menu-count { color: #3730a3; background: #eef2ff; border-radius: 999px; padding: 7px 10px; font-size: 13px; font-weight: 800; width: fit-content; }
.btn-menu { background: #0f766e; color: white; border: none; padding: 11px 12px; border-radius: 6px; font-weight: 800; text-align: center; display: block; text-decoration: none; }

@media (max-width: 720px) {
  .navbar { align-items: flex-start; flex-direction: column; gap: 12px; }
  nav { justify-content: flex-start; }
  .hero h1 { font-size: 34px; }
}
</style>
