import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'

import ASTItem from './components/items/ASTItem.vue'
import ArgsItem from './components/items/ArgsItem.vue'
import PostCondItem from './components/items/PostCondItem.vue'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)

app.component('ASTItem', ASTItem)
app.component('ArgsItem', ArgsItem)
app.component('PostCondItem', PostCondItem)

app.mount('#app')
