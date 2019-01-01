import Vue from 'vue'
import App from './App.vue'

import './style.css'

const prod = process.env.NODE_ENV === 'production'
const shouldSW = 'serviceWorker' in navigator && prod
if (shouldSW) {
  navigator.serviceWorker.register('/service-worker.js').then(() => {
    console.log("Service Worker Registered!")
  })
}

Vue.config.productionTip = false

document.addEventListener('gesturestart', function (e) {
  e.preventDefault()
})

new Vue({
  render: h => h(App),
}).$mount('#app')
