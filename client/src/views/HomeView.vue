<template>
  <div class="home-container">
    <header class="navbar">
      <div class="logo">🍔 Food Truck Express</div>
      <nav>
        <button @click="goToCart" class="btn-nav btn-cart">
          🛒 Carrito ({{ cartStore.cartCount }})
        </button>

        <template v-if="isLoggedIn">
          <router-link to="/dashboard" class="btn-nav">Mi Panel</router-link>
          <button @click="logout" class="btn-logout">Cerrar Sesión</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn-nav">Iniciar Sesión</router-link>
          <router-link to="/register" class="btn-nav btn-highlight">Registrarse</router-link>
        </template>
      </nav>
    </header>

    <main>
      <section class="hero">
        <h2>Descubre los mejores Food Trucks</h2>
        <p>Explora el catálogo, conoce sus ubicaciones y elige tu favorito.</p>
      </section>

      <section class="catalog">
        <div v-if="trucks.length === 0" class="empty-state">
          No hay Food Trucks disponibles por ahora.
        </div>

        <div class="grid">
          <div v-for="truck in trucks" :key="truck.id" class="card">
            <img
              :src="truck.logo || 'https://placehold.co/300x150?text=Food+Truck'"
              alt="Logo"
              class="card-img"
            />
            <div class="card-content">
              <h3>{{ truck.name }}</h3>
              <p class="desc">{{ truck.description }}</p>

              <div class="public-locations">
                <h4>📍 Dónde encontrarnos:</h4>
                <ul v-if="truck.locations && truck.locations.length > 0">
                  <li v-for="loc in truck.locations" :key="loc.id">
                    <strong>{{ loc.address }}</strong> <br />
                    <small>🕒 {{ loc.schedule }}</small>
                  </li>
                </ul>
                <p v-else class="no-loc">
                  Próximamente anunciaremos nuestra ubicación.
                </p>
              </div>

              <router-link :to="`/truck/${truck.id}`" class="btn-menu">
                Ver Menú y Pedir
              </router-link>
            </div>
          </div>
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

const checkAuth = () => {
  isLoggedIn.value = !!localStorage.getItem("token");
};

const fetchAllTrucks = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/food-trucks`,
    );
    trucks.value = response.data.data;
  } catch (error) {
    console.error(error);
  }
};

const goToCart = () => {
  if (cartStore.items.length === 0) {
    alert("Tu carrito está vacío. Agrega algo en un menú primero.");
    return;
  }
  // Obtenemos el ID del camión del primer ítem del carrito
  const truckId = cartStore.items[0].foodTruckId;
  router.push(`/checkout/${truckId}`);
};

const logout = () => {
  localStorage.removeItem("token");
  isLoggedIn.value = false;
  router.push("/");
};

onMounted(() => {
  checkAuth();
  fetchAllTrucks();
});
</script>

<style scoped>
.home-container { font-family: sans-serif; background-color: #f9f9f9; min-height: 100vh; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background-color: #2c3e50; color: white; }
.logo { font-size: 22px; font-weight: bold; }
nav { display: flex; gap: 15px; align-items: center; }
.btn-nav { color: white; text-decoration: none; font-weight: bold; font-size: 14px; background: none; border: none; cursor: pointer; }
.btn-highlight { background-color: #ff9800; padding: 8px 15px; border-radius: 4px; }
.btn-logout { background-color: transparent; border: 1px solid white; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.hero { text-align: center; padding: 60px 20px; background-color: white; border-bottom: 1px solid #eee; }
.catalog { padding: 40px 20px; max-width: 1100px; margin: 0 auto; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
.card { background-color: white; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
.card-img { width: 100%; height: 200px; object-fit: cover; }
.card-content { padding: 20px; }
.btn-menu { background: #ff9800; color: white; border: none; padding: 10px; width: 100%; cursor: pointer; margin-top: 15px; border-radius: 4px; font-weight: bold; text-align: center; display: block; text-decoration: none; }
.public-locations { background-color: #f5f5f5; padding: 12px; border-radius: 6px; border-left: 4px solid #ff9800; margin-bottom: 15px; }
.public-locations h4 { margin: 0 0 8px 0; font-size: 14px; color: #333; }
.public-locations li { margin-bottom: 8px; font-size: 14px; color: #444; }
.btn-cart { background: #34495e; padding: 8px; border-radius: 4px; }
</style>