import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart') || '[]'),
  }),
  actions: {
    addToCart(dish) {
      this.items.push(dish);
      localStorage.setItem('cart', JSON.stringify(this.items));
    },
    removeFromCart(index) {
      this.items.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(this.items));
    },
    clearCart() {
      this.items = [];
      localStorage.removeItem('cart');
    }
  },
  getters: {
    totalPrice: (state) => state.items.reduce((sum, item) => sum + Number(item.price), 0),
    cartCount: (state) => state.items.length
  }
});
