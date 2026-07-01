import "./assets/main.css";

import { createApp } from "vue";

import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { useUserStore } from "@/stores/user";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate) // Tambahkan plugin untuk menyimpan state di localStorage

app.use(pinia);


const userStore = useUserStore()

userStore
  .listenToAuthState()
  .then(() => {
    app.use(router)
    // app.component('font-awesome-icon', FontAwesomeIcon)
    app.mount('#app')
  })
  .catch((error) => {
    console.error('Error listening to auth state:', error)
    // Tetap mount meskipun error agar aplikasi tidak blank putih
    app.use(router)
    app.mount('#app')
  })

// app.use(router);
// app.directive('click-outside', {
//   mounted(el, binding) {
//     el._clickOutside = (event) => {
//       if (!el.contains(event.target)) binding.value()
//     }
//     document.addEventListener('click', el._clickOutside)
//   },
//   unmounted(el) {
//     document.removeEventListener('click', el._clickOutside)
//   },
// })
// app.mount("#app");
