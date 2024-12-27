import { createRouter, createWebHistory } from 'vue-router'
import WelcomeScreen from '@/components/welcome/WelcomeScreen.vue'
import OnlineRoomManager from '@/components/game/OnlineRoomManager.vue'
import OnlineGame from '@/components/game/OnlineGame.vue'
import SinglePlayerGame from '@/components/game/SinglePlayerGame.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeScreen
    },
    {
      path: '/online/room',
      name: 'online-room',
      component: OnlineRoomManager
    },
    {
      path: '/online/game',
      name: 'online-game',
      component: OnlineGame,
      props: (route) => ({
        roomId: route.query.roomId,
        action: route.query.action
      })
    },
    {
      path: '/ai',
      name: 'single-player',
      component: SinglePlayerGame
    }
  ]
})

export default router 