<template>
  <div class="page">
    <header class="navbar">
      <router-link to="/" class="logo">Food Truck Express</router-link>
      <nav>
        <button @click="goToCheckout" class="btn-nav btn-cart">
          Carrito ({{ cartStore.cartCount }})
        </button>
      </nav>
    </header>

    <main class="menu-container" v-if="truck">
      <router-link to="/" class="back-btn">Volver al catalogo</router-link>

      <section class="truck-header">
        <img :src="truck.logo || 'https://placehold.co/360x200?text=Food+Truck'" alt="Logo" class="truck-logo">
        <div>
          <span :class="['status-pill', truck.activeLocation ? 'open' : 'closed']">
            {{ truck.activeLocation ? "Abierto ahora" : "Cerrado ahora" }}
          </span>
          <h1>{{ truck.name }}</h1>
          <p>{{ truck.description }}</p>

          <div v-if="truck.activeLocation" class="location-box">
            <strong>Ubicacion de hoy</strong>
            <span>{{ truck.activeLocation.address }}</span>
            <small>{{ formatTime(truck.activeLocation.startTime) }} - {{ formatTime(truck.activeLocation.endTime) }}</small>
          </div>
          <div v-else class="location-box closed">
            <strong>Sin ubicacion activa</strong>
            <span>Este truck no esta recibiendo pedidos en este momento.</span>
          </div>
        </div>
      </section>

      <section class="menu-section">
        <div class="section-heading">
          <h2>Menu de hoy</h2>
          <span>{{ availableMenuItems.length }} platos disponibles</span>
        </div>

        <div class="menu-grid">
          <article v-for="item in availableMenuItems" :key="item.id" class="dish-card">
            <div class="dish-info">
              <h3>{{ item.dish.name }}</h3>
              <p>{{ item.dish.description || "Sin descripcion" }}</p>
              <div class="dish-meta">
                <strong>${{ Number(item.dish.price).toLocaleString() }}</strong>
                <span>Stock: {{ item.stock }}</span>
              </div>
            </div>

            <button
              @click="handleAddToCart(item)"
              class="btn-add"
              :disabled="!truck.activeLocation || item.stock <= 0"
            >
              Agregar
            </button>
          </article>
        </div>

        <p v-if="availableMenuItems.length === 0" class="empty-msg">
          No hay platos publicados para hoy o el stock esta agotado.
        </p>
      </section>

      <aside class="cart-preview" v-if="cartStore.cartCount > 0">
        <h3>Tu pedido</h3>
        <p>{{ cartStore.cartCount }} item(s)</p>
        <button @click="goToCheckout" class="btn-checkout">Ir a pagar</button>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cartStore';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const truck = ref(null);

const availableMenuItems = computed(() => {
  if (!truck.value?.todayMenu) return [];

  return truck.value.todayMenu.filter((item) => {
    return item.isAvailable && item.stock > 0 && item.dish && item.dish.isAvailable !== false;
  });
});

const fetchTruckData = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/${route.params.id}`);
    truck.value = response.data.data;
  } catch (error) {
    alert(error.response?.data?.message || "Error al cargar el menu");
  }
};

const handleAddToCart = (menuItem) => {
  if (!truck.value.activeLocation) {
    alert("Este Food Truck no esta activo ahora.");
    return;
  }

  if (cartStore.items.length > 0 && Number(cartStore.items[0].foodTruckId) !== Number(truck.value.id)) {
    alert("Finaliza o vacia tu carrito antes de pedir en otro Food Truck.");
    return;
  }

  const dishForCart = {
    ...menuItem.dish,
    foodTruckId: truck.value.id,
    dailyStock: menuItem.stock
  };

  cartStore.addToCart(dishForCart);
};

const goToCheckout = () => {
  if (cartStore.cartCount === 0) {
    alert("Tu carrito esta vacio.");
    return;
  }

  router.push(`/checkout/${route.params.id}`);
};

const formatTime = (value) => {
  return value ? String(value).slice(0, 5) : "--:--";
};

onMounted(fetchTruckData);
</script>

<style scoped>
.page { min-height: 100vh; background: #f4f6f8; color: #1f2933; font-family: Arial, sans-serif; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 30px; background-color: #243447; color: white; }
.logo { font-size: 21px; font-weight: 700; color: white; text-decoration: none; }
.btn-nav { color: white; font-weight: 700; font-size: 14px; background: none; border: none; cursor: pointer; }
.btn-cart { background: #334e68; padding: 9px 12px; border-radius: 6px; }
.menu-container { max-width: 980px; margin: 0 auto; padding: 24px 20px 80px; }
.back-btn { display: inline-block; margin-bottom: 18px; color: #334e68; text-decoration: none; font-weight: 700; }
.truck-header { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 24px; align-items: center; background: white; border: 1px solid #d9e2ec; border-radius: 8px; padding: 20px; margin-bottom: 22px; }
.truck-logo { width: 100%; height: 190px; object-fit: cover; border-radius: 8px; background: #e2e8f0; }
.truck-header h1 { margin: 10px 0 8px; font-size: 32px; }
.truck-header p { margin: 0 0 16px; color: #64748b; }
.status-pill { display: inline-flex; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 800; }
.status-pill.open { color: #166534; background: #dcfce7; }
.status-pill.closed { color: #92400e; background: #fef3c7; }
.location-box { display: grid; gap: 4px; border-left: 4px solid #0f766e; background: #ecfdf5; padding: 12px; border-radius: 6px; }
.location-box.closed { border-left-color: #f59e0b; background: #fffbeb; }
.location-box span { color: #334155; }
.location-box small { color: #64748b; font-weight: 700; }
.menu-section { background: white; border: 1px solid #d9e2ec; border-radius: 8px; padding: 20px; }
.section-heading { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 14px; }
.section-heading h2 { margin: 0; }
.section-heading span { color: #64748b; font-weight: 700; font-size: 14px; }
.menu-grid { display: grid; gap: 14px; }
.dish-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; gap: 18px; align-items: center; }
.dish-info h3 { margin: 0 0 6px; }
.dish-info p { margin: 0 0 10px; color: #64748b; }
.dish-meta { display: flex; gap: 12px; align-items: center; }
.dish-meta strong { color: #0f766e; }
.dish-meta span { background: #eef2ff; color: #3730a3; border-radius: 999px; padding: 5px 9px; font-size: 12px; font-weight: 800; }
.btn-add, .btn-checkout { border: 0; border-radius: 6px; background: #0f766e; color: white; padding: 10px 14px; font-weight: 800; cursor: pointer; }
.btn-add:disabled { background: #cbd5e1; cursor: not-allowed; }
.empty-msg { text-align: center; color: #64748b; padding: 24px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; }
.cart-preview { position: fixed; bottom: 22px; right: 22px; background: #1f2937; color: white; padding: 16px; border-radius: 8px; min-width: 180px; box-shadow: 0 8px 22px rgba(15, 23, 42, 0.22); }
.cart-preview h3, .cart-preview p { margin: 0 0 8px; }

@media (max-width: 760px) {
  .truck-header { grid-template-columns: 1fr; }
  .dish-card { flex-direction: column; align-items: stretch; }
  .cart-preview { left: 16px; right: 16px; bottom: 16px; }
}
</style>
