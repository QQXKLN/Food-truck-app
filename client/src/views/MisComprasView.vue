<template>
  <div class="page-container">
    <header class="navbar">
      <router-link to="/" class="logo">🍔 Food Truck Express</router-link>
      <nav>
        <router-link to="/" class="btn-nav">Volver al Inicio</router-link>
      </nav>
    </header>

    <main class="content">
      <h1>Mis Compras</h1>
      <p class="subtitle">Historial de tus pedidos recientes</p>

      <div v-if="orders.length === 0" class="empty-state">
        No has realizado ninguna compra aún.
      </div>

      <div v-else class="orders-grid">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <h3>Pedido #{{ order.id }}</h3>
            <span :class="['status-badge', order.status.toLowerCase()]">{{ order.status }}</span>
          </div>
          
          <p><strong>Local:</strong> {{ order.FoodTruck ? order.FoodTruck.name : 'Cargando nombre...' }}</p>
          <p><strong>Total:</strong> ${{ order.total }}</p>
          <p><strong>Método de pago:</strong> {{ formatPayment(order.paymentMethod) }}</p>
          
          <div class="items-list">
            <p v-for="(item, idx) in parseItems(order.items)" :key="idx">
              👉 {{ item.name }}
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const orders = ref([]);

// Función para formatear el método de pago con iconos
const formatPayment = (method) => {
  if (!method) return 'No especificado';
  const m = method.toString().toLowerCase();
  if (m.includes('efectivo') || m.includes('cash')) return '💵 Efectivo';
  if (m.includes('debito')) return '💳 Débito';
  if (m.includes('credit') || m.includes('credito')) return '💳 Crédito';
  if (m.includes('transfer')) return '🏦 Transferencia';
  return method;
};

const parseItems = (itemsText) => {
  try { return typeof itemsText === 'string' ? JSON.parse(itemsText) : itemsText; }
  catch (e) { return []; }
};

const fetchMyOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/mis-compras`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    orders.value = response.data.data;
  } catch (error) {
    console.error("Error al cargar compras:", error);
  }
};

onMounted(fetchMyOrders);
</script>

<style scoped>
.page-container { background-color: #f9f9f9; min-height: 100vh; }
.navbar { display: flex; justify-content: space-between; padding: 15px 30px; background-color: #2c3e50; color: white; }
.logo { font-size: 22px; font-weight: bold; color: white; text-decoration: none; }
.btn-nav { color: white; text-decoration: none; font-weight: bold; }
.content { padding: 30px; max-width: 800px; margin: auto; }
h1 { text-align: center; color: #333; margin-bottom: 5px; }
.subtitle { text-align: center; color: #666; margin-bottom: 30px; }
.empty-state { text-align: center; padding: 40px; background: white; border-radius: 8px; border: 1px solid #ddd; }
.orders-grid { display: grid; gap: 20px; }
.order-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #eee; }
.order-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
.order-header h3 { margin: 0; }
.status-badge { padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; text-transform: capitalize; }
.status-badge.pendiente { background-color: #ff9800; }
.status-badge.listo { background-color: #4CAF50; }
.status-badge.entregado { background-color: #9e9e9e; }
.items-list { margin-top: 15px; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 14px; }
.items-list p { margin: 5px 0; }
</style>