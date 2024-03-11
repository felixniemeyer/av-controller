<script setup lang=ts>
import { computed, onBeforeUnmount, ref } from 'vue'
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

const backgroundStyle = computed(() => {
  const color = props.fader.spec.color
  return {
    backgroundColor: shade(0.3, color),
    borderColor: color,
    boxShadow: `0 0 3rem -2rem ${color}`
  }
})

const meterStyle = computed(() => {
  return {
    height: `${(normalizedValue.value ?? 0.5) * 100}%`,
    bottom: 0, 
    backgroundColor: props.fader.spec.color
  }
})

let rect = null
let touchId: null | number = null

const control = ref<HTMLDivElement | null>(null)

function touchstart(e: TouchEvent) {
  const touch = e.changedTouches[0]
  const div = e.currentTarget as HTMLDivElement
  rect = div.getBoundingClientRect()
  touchId = touch.identifier
  updateValueY(touch.clientY)
  window.addEventListener('touchmove', touchmove)
  window.addEventListener('touchend', endTouchDrag)
  e.preventDefault()
  control.value!.focus()
}

function touchmove(e: TouchEvent) {
  if(touchId !== null) {
    for (const touch of e.changedTouches) {
      if (touch.identifier == touchId) {
        updateValueY(touch.clientY)
      }
    }
  }
}

function endTouchDrag() {
  touchId = null
  window.removeEventListener('touchmove', touchmove)
  window.removeEventListener('touchend', endTouchDrag)
}

function onMousedown(e: MouseEvent) {
  const div = e.currentTarget as HTMLDivElement
  rect = div.getBoundingClientRect()
  updateValueY(e.clientY)
  window.addEventListener('mousemove', mousemove)
  window.addEventListener('mouseup', endMousedown)
  control.value!.focus()
}

function mousemove(e: MouseEvent) {
  updateValueY(e.clientY)
}

function endMousedown() {
  window.removeEventListener('mousemove', mousemove)
  window.removeEventListener('mouseup', endMousedown)
}

onBeforeUnmount(() => {
  endMousedown()
  endTouchDrag()
})

function updateValueY(touchY: number) : void  {
  const y = rect!.bottom- touchY 
  const v = y / rect!.height
  const clamped = Math.max(0, Math.min(1, v))
  props.fader.setNormValue(clamped)
}

function keyPress(e: KeyboardEvent) {
  let v = props.fader.getNormValue()
  if (e.key === 'ArrowUp' || e.key === 'k') {
    v -= 0.05
  } else if (e.key === 'ArrowDown' || e.key === 'j') {
    v += 0.05
  }
  const clamped = Math.max(0, Math.min(1, v))
  props.fader.setNormValue(clamped)
}

</script>

<template>
  <div
    ref="control" :tabindex="props.fader.tabIndex()"
    class="basis fader-basis"
    :style=backgroundStyle
    @touchstart="touchstart"
    @mousedown="onMousedown"
    @keydown="keyPress"
    >
    <div class="meter" :style=meterStyle>
    </div>
  </div>
  <MappingsIndicator :mappings="props.fader.mappings"/>
  <div class="label-top">
    {{ formattedValue }}
  </div>
  <div class="label-bottom">
    {{ props.fader.spec.name }}
  </div>
</template>

<style scoped>
@import './control-styles.css';

.fader-basis{
  border: none; 
  border-left: 0.5rem solid #000;
}

.meter {
  position: absolute;
  width: 100%;
  pointer-events: none;
  border-bottom-right-radius: 0.5rem;
  user-select: none;
}

</style>
