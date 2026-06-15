<template>
  <div>
    <header class="navbar">
      <router-link to="/" class="logo">🍔 Food Truck Express</router-link>
      <nav>
        <button @click="goToCheckout" class="btn-nav btn-cart">
          🛒 Carrito ({{ cartStore.cartCount }})
        </button>
      </nav>
    </header>

    <div class="menu-container" v-if="truck">
      <router-link to="/" class="back-btn">⬅ Volver al catálogo</router-link>
      
      <div class="truck-header">
        <img :src="truck.logo || 'https://placehold.co/300x150?text=Food+Truck'" alt="Logo" class="truck-logo">
        <h1>{{ truck.name }}</h1>
        <p>{{ truck.description }}</p>
      </div>

      <div class="menu-grid">
        <div v-for="dish in truck.dishes" :key="dish.id" class="dish-card">
          <div class="dish-info">
            <h3>{{ dish.name }}</h3>
            <p>{{ dish.description }}</p>
            <p class="price"><strong>${{ dish.price }}</strong></p>
          </div>
          <button @click="handleAddToCart(dish)" class="btn-add">Agregar al carrito</button>
        </div>
      </div>
      
      <p v-if="!truck.dishes || truck.dishes.length === 0" class="empty-msg">
        Este Food Truck aún no tiene platos disponibles.
      </p>

      <div class="cart-preview" v-if="cartStore.cartCount > 0">
        <h3>Tu Pedido ({{ cartStore.cartCount }} items)</h3>
        <button @click="goToCheckout" class="btn-checkout">Ir a Pagar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cartStore';

const route = useRoute();
const router = useRouter();
const truck = ref(null);
const cartStore = useCartStore();

const fetchTruck = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/${route.params.id}`);
    truck.value = response.data.data;
  } catch (error) {
    console.error("Error al cargar el menú:", error);
  }
};

const handleAddToCart = (dish) => {
  cartStore.addToCart(dish);
  alert(`${dish.name} agregado al carrito`);
};

const goToCheckout = () => {
  if (cartStore.items.length === 0) {
    alert("Tu carrito está vacío. Agrega algo primero.");
    return;
  }
  router.push(`/checkout/${route.params.id}`); 
};

onMounted(fetchTruck);
</script>

<style scoped>
/* Estilos del Navbar */
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background-color: #2c3e50; color: white; }
.logo { font-size: 22px; font-weight: bold; color: white; text-decoration: none; cursor: pointer; }
nav { display: flex; gap: 15px; align-items: center; }
.btn-nav { color: white; text-decoration: none; font-weight: bold; font-size: 14px; background: none; border: none; cursor: pointer; }
.btn-cart { background: #34495e; padding: 8px; border-radius: 4px; }

/* Estilos del Menú */
.menu-container { max-width: 800px; margin: auto; padding: 20px; }
.truck-header { text-align: center; margin-bottom: 30px; }
.truck-logo { width: 100%; max-width: 300px; border-radius: 8px; }
.menu-grid { display: grid; gap: 15px; }
.dish-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
.btn-add { background: #4CAF50; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 4px;}
.cart-preview { position: fixed; bottom: 20px; right: 20px; background: #333; color: white; padding: 20px; border-radius: 8px; z-index: 1000; }
.btn-checkout { background: #ff9800; color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px; margin-top: 10px;}
.back-btn { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #333; }
.empty-msg { text-align: center; color: #666; font-style: italic; margin-top: 20px; }
</style>