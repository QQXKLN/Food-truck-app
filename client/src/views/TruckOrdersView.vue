<template>
  <div class="orders-container">
    <header class="navbar">
      <router-link to="/" class="logo">Food Truck Express</router-link>
      <nav>
        <router-link to="/dashboard" class="btn-nav">Volver al panel</router-link>
      </nav>
    </header>

    <main class="content">
      <h1>Gestion de pedidos en vivo</h1>
      <p class="subtitle">Administrando: <strong>{{ truckName || 'Cargando...' }}</strong></p>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

      <div v-if="!route.params.id" class="error-msg">
        Error: No se ha seleccionado un Food Truck.
      </div>

      <div v-else class="kanban-board">
        <section class="column">
          <h2>Pendientes</h2>
          <article v-for="order in pendingOrders" :key="order.id" class="order-card pending">
            <OrderCardContent :order="order" />
            <button type="button" @click="changeStatus(order.id, 'Listo')" class="btn-action btn-ready">
              Marcar como listo
            </button>
          </article>
        </section>

        <section class="column">
          <h2>Listos para retiro</h2>
          <article v-for="order in readyOrders" :key="order.id" class="order-card ready">
            <OrderCardContent :order="order" />
            <button type="button" @click="changeStatus(order.id, 'Entregado')" class="btn-action btn-delivered">
              Entregar al cliente
            </button>
          </article>
        </section>

        <section class="column scrollable">
          <h2>Historial</h2>
          <div class="recaudado-box">
            Total recaudado: <strong>${{ totalRecaudado.toLocaleString() }}</strong>
          </div>

          <article v-for="order in deliveredOrders" :key="order.id" class="order-card delivered">
            <OrderCardContent :order="order" compact />
          </article>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const orders = ref([]);
const truckName = ref('');
const errorMessage = ref('');
let pollingId = null;

const getOrderItems = (order) => {
  if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
    return order.orderItems.map((item) => ({
      name: item.Dish?.name || item.Dish?.dataValues?.name || `Plato #${item.dishId}`,
      quantity: item.quantity || 1,
      price: Number(item.price || 0),
      subtotal: Number(item.price || 0) * Number(item.quantity || 1)
    }));
  }

  try {
    const parsed = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      name: item.name || `Plato #${item.dishId || item.id}`,
      quantity: item.quantity || 1,
      price: Number(item.price || 0),
      subtotal: Number(item.subtotal || Number(item.price || 0) * Number(item.quantity || 1))
    }));
  } catch (error) {
    return [];
  }
};

const formatPayment = (method) => {
  if (!method) return 'N/A';
  const m = method.toString().toLowerCase();
  if (m.includes('efectivo') || m.includes('cash')) return 'Efectivo';
  if (m.includes('debito')) return 'Debito';
  if (m.includes('credit') || m.includes('credito') || m.includes('tarjeta')) return 'Tarjeta';
  if (m.includes('transfer')) return 'Transferencia';
  return method;
};

const OrderCardContent = defineComponent({
  props: {
    order: { type: Object, required: true },
    compact: { type: Boolean, default: false }
  },
  setup(props) {
    return () => h('div', [
      h('h3', `Pedido #${props.order.id}`),
      h('p', { class: 'pay-info' }, [
        'Pago: ',
        h('strong', formatPayment(props.order.paymentMethod))
      ]),
      !props.compact && h('div', { class: 'items-list' },
        getOrderItems(props.order).map((item, index) => h('p', { class: 'item-entry', key: index }, [
          `${item.quantity} x ${item.name}`,
          h('span', `$${Number(item.subtotal).toLocaleString()}`)
        ]))
      ),
      h('p', { class: 'total-price' }, [
        'Total: ',
        h('strong', `$${Number(props.order.total || 0).toLocaleString()}`)
      ])
    ]);
  }
});

const totalRecaudado = computed(() => {
  return deliveredOrders.value.reduce((sum, order) => sum + Number(order.total || 0), 0);
});

const fetchTruckName = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/${route.params.id}`);
    truckName.value = response.data.data.name;
  } catch (error) {
    truckName.value = 'Local desconocido';
  }
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
    errorMessage.value = '';
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error al cargar pedidos';
  }
};

const changeStatus = async (orderId, newStatus) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `${import.meta.env.VITE_API_URL}/food-trucks/orders/${orderId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchOrders();
  } catch (error) {
    alert(error.response?.data?.message || 'Error al actualizar estado');
  }
};

const pendingOrders = computed(() => orders.value.filter((order) => order.status === 'Pendiente'));
const readyOrders = computed(() => orders.value.filter((order) => order.status === 'Listo'));
const deliveredOrders = computed(() => orders.value.filter((order) => order.status === 'Entregado'));

onMounted(() => {
  fetchTruckName();
  fetchOrders();
  pollingId = window.setInterval(fetchOrders, 10000);
});

onUnmounted(() => {
  if (pollingId) window.clearInterval(pollingId);
});
</script>

<style scoped>
.orders-container { background-color: #f0f2f5; min-height: 100vh; font-family: Arial, sans-serif; color: #1f2933; }
.navbar { display: flex; justify-content: space-between; padding: 16px 30px; background-color: #243447; color: white; }
.logo { font-size: 21px; font-weight: 700; color: white; text-decoration: none; }
.btn-nav { color: white; text-decoration: none; font-weight: 700; }
.content { padding: 30px; max-width: 1200px; margin: auto; }
h1 { text-align: center; margin-bottom: 5px; }
.subtitle { text-align: center; color: #64748b; margin-bottom: 30px; }
.kanban-board { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; align-items: flex-start; }
.column { background: white; padding: 15px; border-radius: 8px; border: 1px solid #d9e2ec; min-height: 500px; }
.column.scrollable { max-height: 640px; overflow-y: auto; }
.column h2 { font-size: 18px; text-align: center; margin: 0 0 14px; }
.recaudado-box { background: #dcfce7; color: #166534; padding: 10px; border-radius: 6px; text-align: center; margin-bottom: 15px; font-weight: 700; }
.order-card { padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid #cbd5e1; background: #fff; box-shadow: 0 1px 3px rgba(15,23,42,0.08); }
.pending { border-left-color: #f59e0b; }
.ready { border-left-color: #22c55e; }
.delivered { border-left-color: #94a3b8; }
.pay-info { font-size: 14px; color: #475569; margin-bottom: 8px; }
.items-list { background: #f8fafc; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 14px; }
.item-entry { display: flex; justify-content: space-between; gap: 10px; margin: 0; padding: 4px 0; color: #334155; }
.total-price { font-weight: 700; font-size: 16px; color: #243447; }
.btn-action { width: 100%; padding: 10px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; margin-top: 10px; color: white; }
.btn-ready { background: #f59e0b; }
.btn-delivered { background: #0f766e; }
.error-msg { text-align: center; color: #991b1b; font-weight: 700; margin: 16px 0; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; }

@media (max-width: 900px) {
  .kanban-board { grid-template-columns: 1fr; }
}
</style>
