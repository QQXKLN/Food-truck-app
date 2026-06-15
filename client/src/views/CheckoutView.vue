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
      <p class="subtitle">Estás comprando en el Food Truck con ID: {{ route.params.id }}</p>
      
      <div v-if="cartStore.items.length > 0" class="order-summary">
        <h3>Resumen del carrito</h3>
        <ul>
          <li v-for="(item, index) in cartStore.items" :key="index" class="summary-item">
            <span>
              {{ item.name }}
              <button @click="removeItem(index)" class="btn-remove" title="Quitar del carrito">❌</button>
            </span>
            <strong>${{ item.price }}</strong>
          </li>
        </ul>
        
        <h2 class="total-price">Total: ${{ orderTotal }}</h2>

        <div class="payment-section">
          <h3>Método de Pago</h3>
          <select v-model="paymentMethod" class="select-payment">
            <option value="" disabled>Selecciona cómo vas a pagar...</option>
            <option value="Efectivo">💵 Efectivo (Al retirar en el Truck)</option>
            <option value="Tarjeta">💳 Tarjeta de Crédito / Débito</option>
            <option value="Transferencia">📱 Transferencia Bancaria</option>
          </select>
        </div>
        
        <button @click="processOrder" class="btn-pay" :disabled="isProcessing">
          {{ isProcessing ? 'Procesando pago...' : 'Confirmar y Pagar' }}
        </button>
      </div>

      <div v-else class="empty-cart">
        <p v-if="orderSuccess" class="success-msg">🎉 ¡Pago Aprobado! Tu pedido está siendo preparado.</p>
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

const paymentMethod = ref('');
const isProcessing = ref(false);
const orderSuccess = ref(false);

const orderTotal = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + Number(item.price), 0);
});

const checkAuth = () => { isLoggedIn.value = !!localStorage.getItem('token'); };

const logout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  router.push('/');
};

// Permite eliminar un plato específico del carrito
const removeItem = (index) => {
  cartStore.items.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cartStore.items));
};

// Función principal: Envía la orden al Backend
const processOrder = async () => {
  if (!paymentMethod.value) {
    alert('Por favor, selecciona un método de pago antes de confirmar.');
    return;
  }

  isProcessing.value = true;

  try {
    const payload = {
      items: cartStore.items,
      paymentMethod: paymentMethod.value,
      total: orderTotal.value
    };

    // Llamada al nuevo endpoint del backend
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/food-trucks/${route.params.id}/order`, payload);

    if (!response.data.error) {
      orderSuccess.value = true;
      // Vaciamos el carrito globalmente
      cartStore.items = [];
      localStorage.removeItem('cart');
    }
  } catch (error) {
    console.error(error);
    // Mostramos el mensaje de error del backend (ej: "Stock insuficiente")
    alert(error.response?.data?.message || 'Error al procesar el pedido. Intenta nuevamente.');
  } finally {
    isProcessing.value = false;
  }
};

onMounted(checkAuth);
</script>

<style scoped>
.page-container { background-color: #f9f9f9; min-height: 100vh; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background-color: #2c3e50; color: white; }
.logo { font-size: 22px; font-weight: bold; color: white; text-decoration: none; cursor: pointer; }
nav { display: flex; gap: 15px; align-items: center; }
.btn-nav { color: white; text-decoration: none; font-weight: bold; font-size: 14px; }
.btn-logout { background-color: transparent; border: 1px solid white; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }

.checkout-container { max-width: 600px; margin: 40px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
h1 { text-align: center; color: #333; margin-bottom: 5px; }
.subtitle { text-align: center; color: #666; margin-bottom: 30px; }
.order-summary { border-top: 2px solid #eee; padding-top: 20px; }
ul { list-style: none; padding: 0; }
.summary-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #ddd; font-size: 16px; }
.btn-remove { background: none; border: none; cursor: pointer; font-size: 14px; margin-left: 10px; opacity: 0.7; }
.btn-remove:hover { opacity: 1; transform: scale(1.1); }
.total-price { text-align: right; margin: 20px 0; color: #d35400; font-size: 24px; }

/* Estilos de la sección de pago */
.payment-section { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e0e0e0; }
.payment-section h3 { margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #333; }
.select-payment { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; background: white; }

.btn-pay { background: #4CAF50; color: white; padding: 15px; border: none; width: 100%; cursor: pointer; font-size: 18px; font-weight: bold; border-radius: 6px; transition: background 0.3s; }
.btn-pay:hover:not(:disabled) { background: #45a049; }
.btn-pay:disabled { background: #9e9e9e; cursor: not-allowed; }

.empty-cart { text-align: center; padding: 40px 0; }
.success-msg { color: #4CAF50; font-size: 20px; font-weight: bold; margin-bottom: 15px; background: #e8f5e9; padding: 15px; border-radius: 6px; }
.btn-back { display: inline-block; margin-top: 15px; color: #ff9800; font-weight: bold; text-decoration: none; }
</style>