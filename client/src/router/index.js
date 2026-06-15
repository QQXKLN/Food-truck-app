import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import MenuView from '../views/MenuView.vue';
import CheckoutView from '../views/CheckoutView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/truck/:id', name: 'MenuView', component: MenuView },
    { path: '/checkout/:id', name: 'CheckoutView', component: CheckoutView }
  ]
});


router.beforeEach((to, from) => {
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !token) {
    return { name: 'login' }; 
  }
  return true;
});

export default router;