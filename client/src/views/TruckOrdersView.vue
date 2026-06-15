<template>
  <div class="orders-container">
    <header class="navbar">
      <router-link to="/" class="logo">🍔 Food Truck Express</router-link>
      <nav>
        <router-link to="/dashboard" class="btn-nav">Volver al Panel</router-link>
      </nav>
    </header>

    <main class="content">
      <h1>Gestión de Pedidos en Vivo</h1>
      <p class="subtitle">Administrando: <strong>{{ truckName || 'Cargando...' }}</strong></p>

      <div v-if="!route.params.id" class="error-msg">
        Error: No se ha seleccionado un Food Truck.
      </div>

      <div v-else class="kanban-board">
        
        <div class="column">
          <h2>🟡 Pendientes</h2>
          <div v-for="order in pendingOrders" :key="order.id" class="order-card pending">
            <h3>Pedido #{{ order.id }}</h3>
            <p class="pay-info">💳 Pago: <strong>{{ formatPayment(order.paymentMethod) }}</strong></p>
            <div class="items-list">
              <p v-for="(item, idx) in parseItems(order.items)" :key="idx" class="item-entry">
                • {{ item.name }}
              </p>
            </div>
            <p class="total-price">Total: <strong>${{ order.total }}</strong></p>
            <button @click="changeStatus(order.id, 'Listo')" class="btn-action btn-ready">
              ✅ Marcar como Listo
            </button>
          </div>
        </div>

        <div class="column">
          <h2>🟢 Listos para Retiro</h2>
          <div v-for="order in readyOrders" :key="order.id" class="order-card ready">
            <h3>Pedido #{{ order.id }}</h3>
            <p class="pay-info">💳 Pago: <strong>{{ formatPayment(order.paymentMethod) }}</strong></p>
            <div class="items-list">
              <p v-for="(item, idx) in parseItems(order.items)" :key="idx" class="item-entry">
                • {{ item.name }}
              </p>
            </div>
            <p class="total-price">Total: <strong>${{ order.total }}</strong></p>
            <button @click="changeStatus(order.id, 'Entregado')" class="btn-action btn-delivered">
              🛍️ Entregar al Cliente
            </button>
          </div>
        </div>

        <div class="column scrollable">
          <h2>✅ Historial (Entregados)</h2>
          <div class="recaudado-box">
            Total Recaudado: <strong>${{ totalRecaudado.toLocaleString() }}</strong>
          </div>
          <div v-for="order in deliveredOrders" :key="order.id" class="order-card delivered">
            <h3>Pedido #{{ order.id }}</h3>
            <p class="pay-info">💳 Pago: <strong>{{ formatPayment(order.paymentMethod) }}</strong></p>
            <p class="total-price">Total: <strong>${{ order.total }}</strong></p>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const orders = ref([]);
const truckName = ref('');

// Total Recaudado (suma de pedidos entregados)
const totalRecaudado = computed(() => {
  return deliveredOrders.value.reduce((sum, o) => sum + Number(o.total || 0), 0);
});

const formatPayment = (method) => {
  if (!method) return 'N/A'; 
  const m = method.toString().toLowerCase();
  if (m.includes('efectivo') || m.includes('cash')) return '💵 Efectivo';
  if (m.includes('debito')) return '💳 Débito';
  if (m.includes('credit') || m.includes('credito')) return '💳 Crédito';
  if (m.includes('transfer')) return '🏦 Transferencia';
  return method; 
};

const fetchTruckName = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/${route.params.id}`);
    truckName.value = response.data.data.name;
  } catch (error) { truckName.value = "Local Desconocido"; }
};

const fetchOrders = async () => {
  const truckId = route.params.id;
  if (!truckId) return;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/${truckId}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    orders.value = response.data.data;
  } catch (error) { console.error("Error al cargar pedidos:", error); }
};

const parseItems = (itemsText) => {
  try { return typeof itemsText === 'string' ? JSON.parse(itemsText) : itemsText; }
  catch (e) { return []; }
};

const changeStatus = async (orderId, newStatus) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${import.meta.env.VITE_API_URL}/food-trucks/orders/${orderId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    fetchOrders(); 
  } catch (error) { alert("Error al actualizar estado"); }
};

const pendingOrders = computed(() => orders.value.filter(o => o.status === 'Pendiente'));
const readyOrders = computed(() => orders.value.filter(o => o.status === 'Listo'));
const deliveredOrders = computed(() => orders.value.filter(o => o.status === 'Entregado'));

onMounted(() => {
  fetchTruckName();
  fetchOrders(); 
  setInterval(fetchOrders, 10000);
});
</script>

<style scoped>
.orders-container { background-color: #f0f2f5; min-height: 100vh; }
.navbar { display: flex; justify-content: space-between; padding: 15px 30px; background-color: #2c3e50; color: white; }
.logo { font-size: 22px; font-weight: bold; color: white; text-decoration: none; }
.content { padding: 30px; max-width: 1200px; margin: auto; }
h1 { text-align: center; color: #333; margin-bottom: 5px; }
.subtitle { text-align: center; color: #666; margin-bottom: 30px; }
.kanban-board { display: flex; gap: 20px; align-items: flex-start; }
.column { flex: 1; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-height: 500px; }
.column.scrollable { max-height: 600px; overflow-y: auto; } /* ESTO HACE EL SCROLL */
.column h2 { font-size: 18px; text-align: center; margin-bottom: 10px; }
.recaudado-box { background: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 4px; text-align: center; margin-bottom: 15px; font-weight: bold; }

.order-card { padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 5px solid #ccc; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.pending { border-left-color: #f1c40f; }
.ready { border-left-color: #2ecc71; }
.delivered { border-left-color: #95a5a6; }

.pay-info { font-size: 14px; color: #555; margin-bottom: 5px; }
.items-list { background: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 14px; }
.item-entry { margin: 0; padding: 2px 0; color: #333; }
.total-price { font-weight: bold; font-size: 16px; color: #2c3e50; }

.btn-action { width: 100%; padding: 10px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px; color: white; }
.btn-ready { background: #ff9800; }
.btn-delivered { background: #4CAF50; }
.error-msg { text-align: center; color: red; font-weight: bold; margin-top: 20px; }
</style>