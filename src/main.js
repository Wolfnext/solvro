import Vue from 'vue'
import 'babel-polyfill'
import App from './App.vue'
import './registerServiceWorker'
import 'material-design-icons-iconfont/dist/material-design-icons.css'; // Ikonki od Vuetify
import vuetify from './plugins/vuetify'; // Biblioteka CSS

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
