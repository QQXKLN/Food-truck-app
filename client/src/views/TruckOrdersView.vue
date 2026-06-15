<template>
  <div class="orders-container">
    <header class="navbar">
      <router-link to="/" class="logo">Food Truck Express</router-link>
      <nav>
        <button type="button" class="btn-nav subtle" @click="fetchOrders({ notify: false })">
          Actualizar
        </button>
        <router-link to="/dashboard" class="btn-nav">Volver al panel</router-link>
      </nav>
    </header>

    <main class="content">
      <section class="page-heading">
        <div>
          <h1>Gestion de pedidos en vivo</h1>
          <p>Administrando: <strong>{{ truckName || 'Cargando...' }}</strong></p>
        </div>

        <label class="sound-toggle">
          <input v-model="soundEnabled" type="checkbox" @change="persistSoundPreference" />
          Sonido
        </label>
      </section>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

      <div v-if="newOrderNotice" class="new-order-alert">
        <div>
          <strong>Nuevo pedido pendiente</strong>
          <span>Revisa la columna Pendientes para comenzar la preparacion.</span>
        </div>
        <button type="button" @click="dismissNotice">Entendido</button>
      </div>

      <section class="summary-grid">
        <article>
          <span>Pendientes</span>
          <strong>{{ pendingOrders.length }}</strong>
        </article>
        <article>
          <span>Listos</span>
          <strong>{{ readyOrders.length }}</strong>
        </article>
        <article>
          <span>Entregados</span>
          <strong>{{ deliveredOrders.length }}</strong>
        </article>
        <article>
          <span>Recaudado</span>
          <strong>${{ totalRecaudado.toLocaleString() }}</strong>
        </article>
      </section>

      <p class="last-update">
        Ultima actualizacion: {{ lastUpdatedAt || 'Pendiente' }}
      </p>

      <div v-if="!route.params.id" class="error-msg">
        Error: No se ha seleccionado un Food Truck.
      </div>

      <div v-else class="kanban-board">
        <section class="column">
          <header class="column-title pending-title">
            <h2>Pendientes</h2>
            <span>{{ pendingOrders.length }}</span>
          </header>

          <p v-if="pendingOrders.length === 0" class="empty-state">No hay pedidos pendientes.</p>

          <article v-for="order in pendingOrders" :key="order.id" class="order-card pending">
            <OrderCardContent :order="order" />
            <button type="button" @click="changeStatus(order.id, 'Listo')" class="btn-action btn-ready">
              Marcar como listo
            </button>
          </article>
        </section>

        <section class="column">
          <header class="column-title ready-title">
            <h2>Listos para retiro</h2>
            <span>{{ readyOrders.length }}</span>
          </header>

          <p v-if="readyOrders.length === 0" class="empty-state">Aun no hay pedidos listos.</p>

          <article v-for="order in readyOrders" :key="order.id" class="order-card ready">
            <OrderCardContent :order="order" />
            <button type="button" @click="changeStatus(order.id, 'Entregado')" class="btn-action btn-delivered">
              Entregar al cliente
            </button>
          </article>
        </section>

        <section class="column scrollable">
          <header class="column-title delivered-title">
            <h2>Historial</h2>
            <span>{{ deliveredOrders.length }}</span>
          </header>

          <p v-if="deliveredOrders.length === 0" class="empty-state">No hay pedidos entregados.</p>

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
const newOrderNotice = ref(false);
const lastUpdatedAt = ref('');
const soundEnabled = ref(localStorage.getItem('ordersSoundEnabled') === 'true');
let pollingId = null;
let initialOrdersLoaded = false;
let knownPendingOrderIds = new Set();

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

const getCustomerName = (order) => {
  return order.User?.name || order.User?.email || `Cliente #${order.userId || 'N/A'}`;
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

const formatDateTime = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const OrderCardContent = defineComponent({
  props: {
    order: { type: Object, required: true },
    compact: { type: Boolean, default: false }
  },
  setup(props) {
    return () => h('div', { class: 'order-content' }, [
      h('div', { class: 'order-topline' }, [
        h('h3', `Pedido #${props.order.id}`),
        h('span', { class: `status-badge ${props.order.status?.toLowerCase() || ''}` }, props.order.status || 'Pendiente')
      ]),
      h('p', { class: 'meta-line' }, [
        h('span', 'Cliente'),
        h('strong', getCustomerName(props.order))
      ]),
      h('p', { class: 'meta-line' }, [
        h('span', 'Hora'),
        h('strong', formatDateTime(props.order.createdAt))
      ]),
      h('p', { class: 'meta-line' }, [
        h('span', 'Pago'),
        h('strong', formatPayment(props.order.paymentMethod))
      ]),
      !props.compact && h('div', { class: 'items-list' },
        getOrderItems(props.order).map((item, index) => h('p', { class: 'item-entry', key: index }, [
          h('span', `${item.quantity} x ${item.name}`),
          h('strong', `$${Number(item.subtotal).toLocaleString()}`)
        ]))
      ),
      h('p', { class: 'total-price' }, [
        'Total: ',
        h('strong', `$${Number(props.order.total || 0).toLocaleString()}`)
      ])
    ]);
  }
});

const pendingOrders = computed(() => orders.value.filter((order) => order.status === 'Pendiente'));
const readyOrders = computed(() => orders.value.filter((order) => order.status === 'Listo'));
const deliveredOrders = computed(() => orders.value.filter((order) => order.status === 'Entregado'));

const totalRecaudado = computed(() => {
  return deliveredOrders.value.reduce((sum, order) => sum + Number(order.total || 0), 0);
});

const updatePageTitle = () => {
  document.title = newOrderNotice.value && pendingOrders.value.length > 0
    ? `(${pendingOrders.value.length}) Pedidos pendientes`
    : 'Food Truck Express';
};

const playNotificationSound = () => {
  if (!soundEnabled.value) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
  } catch (error) {
    // El navegador puede bloquear audio si el usuario no interactuo con la pagina.
  }
};

const persistSoundPreference = () => {
  localStorage.setItem('ordersSoundEnabled', soundEnabled.value ? 'true' : 'false');
};

const dismissNotice = () => {
  newOrderNotice.value = false;
  updatePageTitle();
};

const fetchTruckName = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/${route.params.id}`);
    truckName.value = response.data.data.name;
  } catch (error) {
    truckName.value = 'Local desconocido';
  }
};

const fetchOrders = async ({ notify = true } = {}) => {
  const truckId = route.params.id;
  if (!truckId) return;

  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/${truckId}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const nextOrders = response.data.data;
    const nextPendingIds = new Set(
      nextOrders.filter((order) => order.status === 'Pendiente').map((order) => Number(order.id))
    );
    const hasNewPendingOrder = notify
      && initialOrdersLoaded
      && [...nextPendingIds].some((orderId) => !knownPendingOrderIds.has(orderId));

    orders.value = nextOrders;
    knownPendingOrderIds = nextPendingIds;
    initialOrdersLoaded = true;
    lastUpdatedAt.value = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    errorMessage.value = '';

    if (hasNewPendingOrder) {
      newOrderNotice.value = true;
      playNotificationSound();
    }

    updatePageTitle();
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
    await fetchOrders({ notify: false });
  } catch (error) {
    alert(error.response?.data?.message || 'Error al actualizar estado');
  }
};

onMounted(() => {
  fetchTruckName();
  fetchOrders({ notify: false });
  pollingId = window.setInterval(() => fetchOrders({ notify: true }), 10000);
});

onUnmounted(() => {
  if (pollingId) window.clearInterval(pollingId);
  document.title = 'Food Truck Express';
});
</script>

<style scoped>
.orders-container { background-color: #f4f6f8; min-height: 100vh; font-family: Arial, sans-serif; color: #1f2933; }
.navbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 30px; background-color: #243447; color: white; }
.logo { font-size: 21px; font-weight: 700; color: white; text-decoration: none; }
nav { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.btn-nav { color: white; text-decoration: none; font-weight: 700; background: transparent; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; cursor: pointer; }
.btn-nav.subtle { background: #334e68; border-color: #334e68; }
.content { padding: 30px 20px 44px; max-width: 1220px; margin: auto; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
h1 { margin: 0 0 6px; font-size: 30px; }
.page-heading p { margin: 0; color: #64748b; }
.sound-toggle { display: inline-flex; gap: 8px; align-items: center; background: white; border: 1px solid #d9e2ec; border-radius: 8px; padding: 10px 12px; font-size: 14px; font-weight: 800; color: #334155; }
.sound-toggle input { width: auto; }
.new-order-alert { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fef3c7; border: 1px solid #f59e0b; color: #78350f; border-radius: 8px; padding: 13px 14px; margin-bottom: 18px; }
.new-order-alert div { display: grid; gap: 3px; }
.new-order-alert button { border: 0; border-radius: 6px; background: #f59e0b; color: #1f2933; font-weight: 800; padding: 8px 12px; cursor: pointer; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 10px; }
.summary-grid article { background: white; border: 1px solid #d9e2ec; border-radius: 8px; padding: 14px; display: grid; gap: 5px; }
.summary-grid span { color: #64748b; font-size: 13px; font-weight: 800; }
.summary-grid strong { font-size: 24px; color: #0f766e; }
.last-update { color: #64748b; text-align: right; margin: 0 0 18px; font-size: 13px; font-weight: 700; }
.kanban-board { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; align-items: flex-start; }
.column { background: white; padding: 15px; border-radius: 8px; border: 1px solid #d9e2ec; min-height: 500px; }
.column.scrollable { max-height: 690px; overflow-y: auto; }
.column-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
.column-title h2 { font-size: 17px; margin: 0; }
.column-title span { min-width: 30px; text-align: center; border-radius: 999px; padding: 4px 8px; color: white; font-size: 13px; font-weight: 900; }
.pending-title span { background: #f59e0b; }
.ready-title span { background: #22c55e; }
.delivered-title span { background: #64748b; }
.order-card { padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid #cbd5e1; background: #fff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08); }
.pending { border-left-color: #f59e0b; }
.ready { border-left-color: #22c55e; }
.delivered { border-left-color: #94a3b8; }
.order-content { display: grid; gap: 9px; }
.order-topline { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.order-topline h3 { margin: 0; font-size: 18px; }
.status-badge { border-radius: 999px; padding: 5px 8px; font-size: 12px; font-weight: 900; color: #1f2933; background: #e2e8f0; }
.status-badge.pendiente { background: #fef3c7; color: #92400e; }
.status-badge.listo { background: #dcfce7; color: #166534; }
.status-badge.entregado { background: #e2e8f0; color: #475569; }
.meta-line { display: flex; justify-content: space-between; gap: 10px; margin: 0; color: #475569; font-size: 14px; }
.meta-line span { color: #64748b; font-weight: 700; }
.items-list { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-size: 14px; }
.item-entry { display: flex; justify-content: space-between; gap: 10px; margin: 0; padding: 4px 0; color: #334155; }
.item-entry span { min-width: 0; overflow-wrap: anywhere; }
.total-price { margin: 0; font-weight: 700; font-size: 16px; color: #243447; text-align: right; }
.btn-action { width: 100%; padding: 10px; border: none; border-radius: 6px; font-weight: 800; cursor: pointer; margin-top: 10px; color: white; }
.btn-ready { background: #f59e0b; color: #1f2933; }
.btn-delivered { background: #0f766e; }
.error-msg { text-align: center; color: #991b1b; font-weight: 700; margin: 16px 0; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; }
.empty-state { color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px 12px; text-align: center; font-weight: 700; }

@media (max-width: 900px) {
  .page-heading, .navbar { align-items: flex-start; flex-direction: column; }
  nav { justify-content: flex-start; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kanban-board { grid-template-columns: 1fr; }
  .last-update { text-align: left; }
}

@media (max-width: 560px) {
  .summary-grid { grid-template-columns: 1fr; }
  .new-order-alert { align-items: stretch; flex-direction: column; }
}
</style>
