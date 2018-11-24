import Vue from 'vue'
import App from './App.vue'

import './style.css'

Vue.config.productionTip = false

document.addEventListener('gesturestart', function (e) {
  e.preventDefault()
})

new Vue({
  render: h => h(App),
}).$mount('#app')
