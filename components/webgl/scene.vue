<template>
  <div id="appScene">
    <Info />
  </div>
</template>

<script>
import useWebGL from '@/hooks/use-webgl'

export default {
  components: {
    Info: () => import('@/components/webgl/info')
  },
  mounted() {
    const { canvas } = useWebGL()
    this.$el.appendChild(canvas)
  },
  beforeDestroy() {
    useWebGL().destroy()
  }
}
</script>

<style lang="scss">
#appScene {
  height: 100% !important;
  left: 0;
  // pointer-events: none;
  position: fixed;
  top: 0;
  width: 100% !important;
  // z-index: -1;

  canvas {
    height: 100% !important;
    width: 100% !important;
  }
}
</style>
