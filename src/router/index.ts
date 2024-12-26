import { createRouter, createWebHistory } from 'vue-router'
import WelcomeScreen from '../components/welcome/WelcomeScreen.vue'
import GameBoard from '../components/game/GameBoard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: WelcomeScreen
    },
    {
      path: '/game/:mode',
      component: GameBoard,
      props: route => ({
        gameMode: route.params.mode
      })
    }
  ]
})

export default router 