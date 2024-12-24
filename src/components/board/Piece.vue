<template>
  <div class="piece" :class="[color, { 'animate-place': shouldAnimate }]">
    <div class="piece-inner">
      <div class="piece-highlight"></div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Piece',
  props: {
    color: {
      type: String,
      required: true,
      validator: (value: string) => ['black', 'white'].includes(value)
    }
  },
  data() {
    return {
      shouldAnimate: true
    }
  },
  mounted() {
    setTimeout(() => {
      this.shouldAnimate = false
    }, 500)
  }
}
</script>

<style scoped>
.piece {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.piece-inner {
  width: 90%;
  height: 90%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.piece.black .piece-inner {
  background: var(--piece-black);
  box-shadow: 
    inset -2px -2px 4px rgba(255,255,255,0.1),
    inset 2px 2px 4px rgba(0,0,0,0.5),
    0 4px 8px rgba(0,0,0,0.3);
}

.piece.white .piece-inner {
  background: var(--piece-white);
  box-shadow: 
    inset -2px -2px 4px rgba(0,0,0,0.1),
    inset 2px 2px 4px rgba(255,255,255,0.5),
    0 4px 8px rgba(0,0,0,0.1);
}

.piece-highlight {
  position: absolute;
  top: 15%;
  left: 15%;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
}

.animate-place {
  animation: placePiece 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes placePiece {
  0% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 