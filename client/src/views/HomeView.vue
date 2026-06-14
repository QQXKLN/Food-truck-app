<template>
  <div class="home-container">
    <header class="navbar">
      <div class="logo">🍔 Food Truck Express</div>
      <nav>
        <template v-if="isLoggedIn">
          <router-link to="/dashboard" class="btn-nav">Mi Panel (Dashboard)</router-link>
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
        <div v-if="trucks.length === 0" class="empty-state">No hay Food Trucks disponibles por ahora.</div>
        
        <div class="grid">
          <div v-for="truck in trucks" :key="truck.id" class="card">
            <img :src="truck.logo || 'https://via.placeholder.com/300x150?text=Food+Truck'" alt="Logo" class="card-img">
            <div class="card-content">
              <h3>{{ truck.name }}</h3>
              <p class="desc">{{ truck.description }}</p>
              
              <!-- 🌟 NUEVA SECCIÓN DE UBICACIONES PÚBLICAS -->
              <div class="public-locations">
                <h4>📍 Dónde encontrarnos:</h4>
                <ul v-if="truck.locations && truck.locations.length > 0">
                  <li v-for="loc in truck.locations" :key="loc.id">
                    <strong>{{ loc.address }}</strong> <br>
                    <small>🕒 {{ loc.schedule }}</small>
                  </li>
                </ul>
                <p v-else class="no-loc">Próximamente anunciaremos nuestra ubicación.</p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const trucks = ref([]);
const isLoggedIn = ref(false);

const checkAuth = () => { isLoggedIn.value = !!localStorage.getItem('token'); };

const fetchAllTrucks = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks`);
    trucks.value = response.data.data;
  } catch (error) { console.error(error); }
};

const logout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  router.push('/');
};

onMounted(() => { checkAuth(); fetchAllTrucks(); });
</script>

<style scoped>
.home-container { font-family: sans-serif; background-color: #f9f9f9; min-height: 100vh; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background-color: #2c3e50; color: white;}
.logo { font-size: 22px; font-weight: bold; }
nav { display: flex; gap: 15px; align-items: center;}
.btn-nav { color: white; text-decoration: none; font-weight: bold; font-size: 14px;}
.btn-highlight { background-color: #ff9800; padding: 8px 15px; border-radius: 4px;}
.btn-logout { background-color: transparent; border: 1px solid white; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;}

.hero { text-align: center; padding: 60px 20px; background-color: white; border-bottom: 1px solid #eee;}
.catalog { padding: 40px 20px; max-width: 1100px; margin: 0 auto;}
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px;}

.card { background-color: white; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);}
.card-img { width: 100%; height: 200px; object-fit: cover;}
.card-content { padding: 20px;}
.card-content h3 { margin: 0 0 10px 0; color: #333; font-size: 22px;}
.desc { color: #666; margin-bottom: 15px; line-height: 1.5;}

/* Estilos de las ubicaciones públicas */
.public-locations { background-color: #f5f5f5; padding: 12px; border-radius: 6px; border-left: 4px solid #ff9800;}
.public-locations h4 { margin: 0 0 8px 0; font-size: 14px; color: #333;}
.public-locations ul { list-style: none; padding: 0; margin: 0;}
.public-locations li { margin-bottom: 8px; font-size: 14px; color: #444;}
.public-locations small { color: #777; font-size: 12px;}
.no-loc { font-size: 13px; color: #888; font-style: italic; margin: 0;}
</style>