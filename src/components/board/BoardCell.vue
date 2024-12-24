<template>
  <div 
    class="board-cell"
    :class="{ 
      'can-move': canMove && !value,
      'has-piece': value
    }"
    @click="$emit('click')"
  >
    <Piece v-if="value" :color="value" />
  </div>
</template>

<script lang="ts">
import { Piece } from './index'

export default {
  name: 'BoardCell',
  components: { Piece },
  props: {
    value: {
      type: String,
      default: null
    },
    canMove: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.board-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.can-move:hover {
  background: rgba(255,255,255,0.1);
}
</style> 