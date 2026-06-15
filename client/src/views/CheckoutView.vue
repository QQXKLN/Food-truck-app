<template>
  <div class="page-container">
    <header class="navbar">
      <router-link to="/" class="logo">🍔 Food Truck Express</router-link>
      <nav>
        <template v-if="isLoggedIn">
          <router-link to="/dashboard" class="btn-nav">Mi Panel</router-link>
          <button @click="logout" class="btn-logout">Cerrar Sesión</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn-nav">Iniciar Sesión</router-link>
        </template>
      </nav>
    </header>

    <div class="checkout-container">
      <h1>Finalizar Pedido</h1>
      <p class="subtitle">Estás comprando en: <strong>{{ truckName || 'Cargando local...' }}</strong></p>
      
      <div v-if="cartStore.items.length > 0" class="order-summary">
        <h3>Resumen del carrito</h3>
        <ul>
          <li v-for="(item, index) in cartStore.items" :key="index" class="summary-item">
            <span>{{ item.name }} <button @click="removeItem(index)" class="btn-remove" title="Quitar">❌</button></span>
            <strong>${{ item.price }}</strong>
          </li>
        </ul>
        <h2 class="total-price">Total: ${{ orderTotal }}</h2>

        <div class="payment-section">
          <h3>Método de Pago</h3>
          <select v-model="paymentMethod" class="select-payment" required>
            <option value="" disabled selected>Selecciona cómo vas a pagar...</option>
            <option value="Efectivo">💵 Efectivo</option>
            <option value="Transferencia">📱 Transferencia</option>
            <option value="Tarjeta">💳 Tarjeta de Crédito / Débito</option>
          </select>

          <div v-if="paymentMethod === 'Tarjeta'" class="card-form">
            <h4>Datos de la Tarjeta</h4>
            <input type="text" v-model="card.number" placeholder="Número de tarjeta" class="input-card">
            <input type="text" v-model="card.name" placeholder="Nombre del titular" class="input-card">
            <div class="card-row">
              <input type="text" v-model="card.expiry" placeholder="MM/AA" class="input-card half">
              <input type="password" v-model="card.cvv" placeholder="CVV" class="input-card half">
            </div>
          </div>
        </div>
        
        <button @click="processOrder" class="btn-pay" :disabled="isProcessing">
          {{ isProcessing ? 'Procesando...' : 'Confirmar y Pagar' }}
        </button>
      </div>

      <div v-else class="empty-cart">
        <div v-if="orderSuccess" class="success-box">
          <h2>🎉 ¡Pedido Confirmado!</h2>
          <p>Tu pedido ha sido enviado al Food Truck.</p>
        </div>
        <p v-else>Tu carrito está vacío.</p>
        <router-link to="/" class="btn-back">Volver al catálogo</router-link>
      </div>
    </div>
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
const isLoggedIn = ref(false);
const truckName = ref('');
const paymentMethod = ref('');
const isProcessing = ref(false);
const orderSuccess = ref(false);
const card = ref({ number: '', name: '', expiry: '', cvv: '' });

const orderTotal = computed(() => cartStore.items.reduce((sum, item) => sum + Number(item.price), 0));
const checkAuth = () => { isLoggedIn.value = !!localStorage.getItem('token'); };

const fetchTruckData = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/food-trucks/${route.params.id}`);
    if (response.data?.data) truckName.value = response.data.data.name;
  } catch (error) { truckName.value = "Food Truck"; }
};

const processOrder = async () => {
  if (!paymentMethod.value) return alert('Por favor selecciona un método de pago.');
  if (paymentMethod.value === 'Tarjeta' && (!card.value.number || !card.value.cvv)) return alert('Por favor completa los datos de la tarjeta.');

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
      cartStore.items = [];
      localStorage.removeItem('cart');
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Error al procesar.');
  } finally {
    isProcessing.value = false;
  }
};

const logout = () => { localStorage.removeItem('token'); isLoggedIn.value = false; router.push('/'); };
const removeItem = (index) => { cartStore.items.splice(index, 1); localStorage.setItem('cart', JSON.stringify(cartStore.items)); };

onMounted(() => { checkAuth(); fetchTruckData(); });
</script>

<style scoped>
/* Estilos mantenidos */
.page-container { background-color: #f9f9f9; min-height: 100vh; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background-color: #2c3e50; color: white; }
.logo { font-size: 22px; font-weight: bold; color: white; text-decoration: none; cursor: pointer; }
.checkout-container { max-width: 600px; margin: 40px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.payment-section { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.select-payment { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 15px; }
.card-form { background: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd; }
.input-card { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.card-row { display: flex; gap: 10px; }
.half { width: 50%; }
.btn-pay { background: #4CAF50; color: white; padding: 15px; border: none; width: 100%; cursor: pointer; font-size: 18px; border-radius: 6px; }
</style>