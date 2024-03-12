<script setup lang=ts>
import { computed } from 'vue'

// for color manipulation
import { shade, transparentize } from 'polished'
import { Cake } from '@/controls'

// vue
const props = defineProps({
  cake: {
    type: Object as () => Cake,
    required: true,
  },
})

const darkenedColor = computed(() => {
  return shade(0.35, props.cake.spec.color)
})

const percentage = computed(() => {
  return (props.cake.value - props.cake.spec.min) / (props.cake.spec.max - props.cake.spec.min)
})

const arcPoint = computed(() => {
  const angle = 2 * Math.PI * (percentage.value - 0.25)
  const x = 50 + 50 * Math.cos(angle)
  const y = 50 + 50 * Math.sin(angle)
  return `${x},${y}`
})

const largeArc = computed(() => {
  return percentage.value > 0.5 ? 1 : 0
})

const containerStyle = computed(() => {
  return {
    backgroundColor: transparentize(0.8, props.cake.spec.color),
  }
})

</script>

<template>
  <!-- arc filled radially according to percentage -->
  <div class="container" :style="containerStyle">
    <svg class="schematic" viewBox="0 0 100 100">
      <!-- Circle -->
      <circle cx="50" cy="50" r="50" :fill="darkenedColor" />
      <!-- Pie Slice -->
      <!-- path d="M100,100 L100,20 A80,80 0 0,1 180,100 Z" :fill="props.cake.spec.color" /-->
      <path :d="`M50,50 L50,0 A50,50 0 ${largeArc},1 ${arcPoint} Z`" :fill="props.cake.spec.color" />
    </svg>
    <div class='label-top'>{{ props.cake.spec.name }}</div>
    <div class='label-bottom'>{{ props.cake.value.toFixed(props.cake.spec.decimalPlaces) }}</div>
  </div>
</template>

<style scoped>
@import './meter-styles.css';

.container {
  position: absolute;
  left: 0.5rem; 
  top: 0.5rem;
  width: calc(100% - 1rem); /* Set the desired width of the container */
  height: calc(100% - 1rem); /* Set the desired height of the container */
  border-radius: 0.5rem; /* Make the container a circle */
  display: flex;
  justify-content: center; /* Horizontally center the content */
  align-items: center; /* Vertically center the content */
}

.schematic {
  max-width: 100%;
  max-height: 100%;
}

</style>
