<script setup lang=ts>
import { computed } from 'vue'
import { Fader } from '@/controls'

import MappingsIndicator from '../MappingsIndicator.vue'

// for color manipulation
import { shade } from 'polished'

// vue
const props = defineProps({
  fader: {
    type: Object as () => Fader,
    required: true,
  },
})

const currentValue = computed(() => props.fader.value)

const formattedValue = computed(() => {
  return currentValue.value.toFixed(props.fader.spec.decimalPlaces)
})

const normalizedValue = computed(() => {
  const spec = props.fader.spec
  return (currentValue.value - spec.min) / (spec.max - spec.min)
})

const posize = computed(() => {
  const spec = props.fader.spec
  return {
    width: `${spec.width}%`,
    height: `${spec.height}%`,
    top: `${spec.y}%`,
    left: `${spec.x}%`,
  }
})

const backgroundStyle = computed(() => {
  const color = props.fader.spec.color
  return {
    backgroundColor: shade(0.35, color),
    borderColor: color,
    boxShadow: `0 0 3rem -2rem ${color}`
  }
})

const meterStyle = computed(() => {
  return {
    height: `${(normalizedValue.value ?? 0.5) * 100}%`,
    backgroundColor: props.fader.spec.color
  }
})

let rect = null
let touchId: null | number = null

function touchstart(e: TouchEvent) {
  e.preventDefault()
  const touch = e.changedTouches[0]
  const div = e.currentTarget as HTMLDivElement
  rect = div.getBoundingClientRect()
  touchId = touch.identifier
  updateValueY(touch.clientY)
}

function touchmove(e: TouchEvent) {
  e.preventDefault()
  if(touchId !== null) {
    for (const touch of e.changedTouches) {
      if (touch.identifier == touchId) {
        updateValueY(touch.clientY)
      }
    }
  }
}

function updateValueY(touchY: number) : void  {
  const y = touchY - rect!.top
  const v = y / rect!.height
  const clamped = Math.max(0, Math.min(1, v))
  props.fader.setNormValue(clamped)
}

</script>

<template>
  <div class="control" :style=posize >
    <div
      class="basis slider-basis"
      :style=backgroundStyle
      @touchstart="touchstart"
      @touchmove="touchmove"
      >
      <div class="meter" :style=meterStyle>
      </div>
    </div>
    <MappingsIndicator :mappings="props.fader.mappings"/>
    <div class="label-top">
      {{ props.fader.spec.name }}
    </div>
    <div class="label-bottom">
      {{ formattedValue }}
    </div>
  </div>
</template>

<style scoped>
@import './control-styles.css';

.slider-basis{
  position: absolute;
  width: calc(100% - 1rem);
  height: calc(100% - 1rem);
  margin: 0.5rem;
  border: none; 
  border-radius: 0.5rem;
  border-left: 0.5rem solid #000;
  overflow: hidden;
  cursor: pointer;
}

.meter {
  position: absolute;
  width: 100%;
  pointer-events: none;
  border-bottom-right-radius: 0.5rem;
}

</style>
