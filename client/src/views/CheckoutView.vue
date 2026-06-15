<template>
  <div class="page-container">
    <header class="navbar">
      <router-link to="/" class="logo">Food Truck Express</router-link>
      <nav>
        <router-link to="/dashboard" class="btn-nav">Mi panel</router-link>
        <button type="button" @click="logout" class="btn-logout">Cerrar sesion</button>
      </nav>
    </header>

    <main class="checkout-container">
      <h1>Finalizar pedido</h1>
      <p class="subtitle">Estas comprando en: <strong>{{ truckName || 'Cargando local...' }}</strong></p>

      <div v-if="truckStatusMessage" :class="['notice', truckIsOpen ? 'success' : 'warning']">
        {{ truckStatusMessage }}
      </div>

      <div v-if="errorMessage" class="notice error">{{ errorMessage }}</div>
      <div v-if="orderSuccess" class="notice success">Pedido confirmado. Tu pedido fue enviado al Food Truck.</div>

      <section v-if="cartStore.items.length > 0" class="order-summary">
        <h2>Resumen del carrito</h2>

        <ul>
          <li v-for="(item, index) in cartStore.items" :key="index" class="summary-item">
            <span>{{ item.name }}</span>
            <strong>${{ Number(item.price).toLocaleString() }}</strong>
            <button type="button" @click="removeItem(index)" class="btn-remove" title="Quitar">Quitar</button>
          </li>
        </ul>

        <h3 class="total-price">Total estimado: ${{ orderTotal.toLocaleString() }}</h3>
        <p class="small-note">El total final se recalcula en el servidor con precios y stock vigentes.</p>

        <div class="payment-section">
          <h3>Metodo de pago</h3>
          <select v-model="paymentMethod" class="select-payment" required>
            <option value="" disabled>Selecciona como vas a pagar...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta de credito / debito</option>
          </select>

          <div v-if="paymentMethod === 'Tarjeta'" class="card-form">
            <h4>Datos de la tarjeta</h4>
            <input type="text" v-model="card.number" placeholder="Numero de tarjeta" class="input-card">
            <input type="text" v-model="card.name" placeholder="Nombre del titular" class="input-card">
            <div class="card-row">
              <input type="text" v-model="card.expiry" placeholder="MM/AA" class="input-card half">
              <input type="password" v-model="card.cvv" placeholder="CVV" class="input-card half">
            </div>
          </div>
        </div>

        <button type="button" @click="processOrder" class="btn-pay" :disabled="isProcessing || !truckIsOpen">
          {{ isProcessing ? 'Procesando...' : 'Confirmar pedido' }}
        </button>
      </section>

      <section v-else class="empty-cart">
        <p>{{ orderSuccess ? 'Puedes seguir explorando el catalogo.' : 'Tu carrito esta vacio.' }}</p>
        <router-link to="/" class="btn-back">Volver al catalogo</router-link>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '../stores/cartStore';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const truckName = ref('');
const truckIsOpen = ref(false);
const truckStatusMessage = ref('');
const paymentMethod = ref('');
const isProcessing = ref(false);
const orderSuccess = ref(false);
const errorMessage = ref('');
const card = ref({ number: '', name: '', expiry: '', cvv: '' });

const orderTotal = computed(() => cartStore.items.reduce((sum, item) => sum + Number(item.price), 0));

const fetchTruckData = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/${route.params.id}`);
    const truck = response.data?.data;

    if (truck) {
      truckName.value = truck.name;
      truckIsOpen.value = Boolean(truck.activeLocation);
      truckStatusMessage.value = truck.activeLocation
        ? `Abierto ahora en ${truck.activeLocation.address}`
        : 'Este Food Truck no esta activo ahora. No se pueden confirmar pedidos.';
    }
  } catch (error) {
    truckName.value = 'Food Truck';
    errorMessage.value = error.response?.data?.message || 'No se pudo verificar el estado del Food Truck';
  }
};

const processOrder = async () => {
  errorMessage.value = '';

  if (!localStorage.getItem('token')) {
    router.push('/login');
    return;
  }

  if (!paymentMethod.value) {
    errorMessage.value = 'Selecciona un metodo de pago.';
    return;
  }

  if (paymentMethod.value === 'Tarjeta' && (!card.value.number || !card.value.cvv)) {
    errorMessage.value = 'Completa los datos minimos de la tarjeta.';
    return;
  }

  isProcessing.value = true;

  try {
    const payload = {
      items: cartStore.items,
      paymentMethod: paymentMethod.value,
      total: orderTotal.value
    };

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/food-trucks/${route.params.id}/order`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 200) {
      orderSuccess.value = true;
      cartStore.clearCart();
      await fetchTruckData();
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error al procesar el pedido.';
    await fetchTruckData();
  } finally {
    isProcessing.value = false;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  router.push('/');
};

const removeItem = (index) => {
  cartStore.removeFromCart(index);
};

onMounted(fetchTruckData);
</script>

<style scoped>
.page-container { background-color: #f4f6f8; min-height: 100vh; font-family: Arial, sans-serif; color: #1f2933; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 30px; background-color: #243447; color: white; }
.logo { font-size: 21px; font-weight: 700; color: white; text-decoration: none; }
nav { display: flex; align-items: center; gap: 14px; }
.btn-nav { color: white; text-decoration: none; font-weight: 700; }
.btn-logout { background-color: transparent; border: 1px solid #cbd5e1; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 700; }
.checkout-container { max-width: 680px; margin: 40px auto; padding: 30px; background: white; border-radius: 8px; border: 1px solid #d9e2ec; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05); }
h1 { margin: 0 0 6px; }
.subtitle { color: #64748b; margin: 0 0 18px; }
.notice { border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; font-weight: 700; }
.notice.success { color: #166534; background: #dcfce7; border: 1px solid #86efac; }
.notice.warning { color: #92400e; background: #fef3c7; border: 1px solid #fde68a; }
.notice.error { color: #991b1b; background: #fee2e2; border: 1px solid #fecaca; }
.order-summary ul { list-style: none; padding: 0; margin: 0 0 18px; display: grid; gap: 10px; }
.summary-item { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 10px; align-items: center; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
.btn-remove { border: 0; border-radius: 6px; background: #fee2e2; color: #b91c1c; padding: 7px 9px; font-weight: 700; cursor: pointer; }
.total-price { color: #0f766e; }
.small-note { color: #64748b; font-size: 13px; margin-top: -8px; }
.payment-section { background: #f8fafc; padding: 18px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
.select-payment { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 15px; }
.card-form { background: white; padding: 15px; border-radius: 6px; border: 1px solid #d9e2ec; }
.input-card { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
.card-row { display: flex; gap: 10px; }
.half { width: 50%; }
.btn-pay, .btn-back { display: inline-block; background: #0f766e; color: white; padding: 14px; border: none; width: 100%; cursor: pointer; font-size: 17px; border-radius: 6px; font-weight: 800; text-align: center; text-decoration: none; box-sizing: border-box; }
.btn-pay:disabled { background: #cbd5e1; cursor: not-allowed; }
.empty-cart { text-align: center; display: grid; gap: 14px; }
</style>
