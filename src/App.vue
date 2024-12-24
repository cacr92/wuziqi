<template>
  <div id="app">
    <WelcomeScreen v-if="!gameStarted" 
      @start="startGame"
      @tutorial="showTutorial = true"
      @settings="showSettings = true"
      @stats="showStats = true"
    />
    <GameLayout v-else @back="gameStarted = false" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import WelcomeScreen from './components/welcome/WelcomeScreen.vue'
import GameLayout from './components/layout/GameLayout.vue'

export default defineComponent({
  name: 'App',
  components: {
    WelcomeScreen,
    GameLayout
  },
  setup() {
    const gameStarted = ref(false)
    const showTutorial = ref(false)
    const showSettings = ref(false)
    const showStats = ref(false)

    const startGame = (mode: string) => {
      gameStarted.value = true
    }

    return {
      gameStarted,
      showTutorial,
      showSettings,
      showStats,
      startGame
    }
  }
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}
</style> 