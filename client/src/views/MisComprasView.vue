<template>
  <div class="page-container">
    <header class="navbar">
      <router-link to="/" class="logo">Food Truck Express</router-link>
      <nav>
        <button type="button" class="btn-nav subtle" @click="fetchMyOrders">Actualizar</button>
        <router-link to="/" class="btn-nav">Volver al catalogo</router-link>
      </nav>
    </header>

    <main class="content">
      <section class="page-heading">
        <div>
          <h1>Mis compras</h1>
          <p>Historial de tus pedidos recientes y su estado actual.</p>
        </div>
      </section>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

      <div v-if="orders.length === 0 && !errorMessage" class="empty-state">
        No has realizado ninguna compra aun.
      </div>

      <div v-else class="orders-grid">
        <article v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div>
              <h2>Pedido #{{ order.id }}</h2>
              <p>{{ formatDateTime(order.createdAt) }}</p>
            </div>
            <span :class="['status-badge', order.status?.toLowerCase()]">{{ order.status }}</span>
          </div>

          <div class="meta-grid">
            <p>
              <span>Local</span>
              <strong>{{ order.FoodTruck?.name || 'Food Truck' }}</strong>
            </p>
            <p>
              <span>Pago</span>
              <strong>{{ formatPayment(order.paymentMethod) }}</strong>
            </p>
            <p>
              <span>Total</span>
              <strong>${{ Number(order.total || 0).toLocaleString() }}</strong>
            </p>
          </div>

          <div class="items-list">
            <p v-for="(item, idx) in getOrderItems(order)" :key="idx" class="item-entry">
              <span>{{ item.quantity }} x {{ item.name }}</span>
              <strong>${{ Number(item.subtotal).toLocaleString() }}</strong>
            </p>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const orders = ref([]);
const errorMessage = ref('');

const formatPayment = (method) => {
  if (!method) return 'No especificado';
  const m = method.toString().toLowerCase();
  if (m.includes('efectivo') || m.includes('cash')) return 'Efectivo';
  if (m.includes('debito')) return 'Debito';
  if (m.includes('credit') || m.includes('credito') || m.includes('tarjeta')) return 'Tarjeta';
  if (m.includes('transfer')) return 'Transferencia';
  return method;
};

const formatDateTime = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getOrderItems = (order) => {
  if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
    return order.orderItems.map((item) => ({
      name: item.Dish?.name || `Plato #${item.dishId}`,
      quantity: item.quantity || 1,
      subtotal: Number(item.price || 0) * Number(item.quantity || 1)
    }));
  }

  try {
    const parsed = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      name: item.name || `Plato #${item.dishId || item.id}`,
      quantity: item.quantity || 1,
      subtotal: Number(item.subtotal || Number(item.price || 0) * Number(item.quantity || 1))
    }));
  } catch (error) {
    return [];
  }
};

const fetchMyOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/mis-compras`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    orders.value = response.data.data;
    errorMessage.value = '';
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudieron cargar tus compras';
  }
};

onMounted(fetchMyOrders);
</script>

<style scoped>
.page-container { background-color: #f4f6f8; min-height: 100vh; font-family: Arial, sans-serif; color: #1f2933; }
.navbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 30px; background-color: #243447; color: white; }
.logo { font-size: 21px; font-weight: 700; color: white; text-decoration: none; }
nav { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.btn-nav { color: white; text-decoration: none; font-weight: 700; background: transparent; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; cursor: pointer; }
.btn-nav.subtle { background: #334e68; border-color: #334e68; }
.content { padding: 30px 20px 44px; max-width: 900px; margin: auto; }
.page-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; }
h1 { margin: 0 0 6px; font-size: 30px; }
.page-heading p { margin: 0; color: #64748b; }
.empty-state { text-align: center; padding: 34px; background: white; border-radius: 8px; border: 1px dashed #cbd5e1; color: #64748b; font-weight: 700; }
.orders-grid { display: grid; gap: 18px; }
.order-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #d9e2ec; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04); }
.order-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; }
.order-header h2 { margin: 0; font-size: 20px; }
.order-header p { margin: 5px 0 0; color: #64748b; font-size: 13px; font-weight: 700; }
.status-badge { padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 900; color: #1f2933; background: #e2e8f0; text-transform: capitalize; white-space: nowrap; }
.status-badge.pendiente { background-color: #fef3c7; color: #92400e; }
.status-badge.listo { background-color: #dcfce7; color: #166534; }
.status-badge.entregado { background-color: #e2e8f0; color: #475569; }
.meta-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.meta-grid p { display: grid; gap: 4px; margin: 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
.meta-grid span { color: #64748b; font-size: 12px; font-weight: 800; }
.meta-grid strong { color: #1f2933; overflow-wrap: anywhere; }
.items-list { display: grid; gap: 8px; margin-top: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; font-size: 14px; }
.item-entry { display: flex; justify-content: space-between; gap: 10px; margin: 0; color: #334155; }
.item-entry span { min-width: 0; overflow-wrap: anywhere; }
.error-msg { text-align: center; color: #991b1b; font-weight: 700; margin: 16px 0; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; }

@media (max-width: 720px) {
  .navbar, .page-heading { align-items: flex-start; flex-direction: column; }
  nav { justify-content: flex-start; }
  .meta-grid { grid-template-columns: 1fr; }
  .order-header { flex-direction: column; }
}
</style>
