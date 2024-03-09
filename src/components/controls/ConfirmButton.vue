<script setup lang=ts>
import { computed } from 'vue'

import { ConfirmButton } from '@/controls'

import MappingsIndicator from '../MappingsIndicator.vue'

// vue
const props = defineProps({
  confirmButton: {
    type: Object as () => ConfirmButton,
    required: true,
  },
})

const posize = computed(() => {
  const spec = props.confirmButton.spec
  return {
    width: `${spec.width}%`,
    height: `${spec.height}%`,
    top: `${spec.y}%`,
    left: `${spec.x}%`,
  }
})

const basisStyle = computed(() => {
  const confirmButton = props.confirmButton
  const spec = confirmButton.spec
  return {
    backgroundColor: spec.color,
    boxShadow: `0 0 2rem -0.5rem ${spec.color}`,
    borderColor: spec.color,
  }
})

function press(e: Event) {
  props.confirmButton.press();
  const target = e.currentTarget as HTMLDivElement
  target.focus()
  e.preventDefault()
}


</script>

<template>
  <div class="control" :style=posize >
    <div
      class="basis"
      :style=basisStyle
      :tabindex="props.confirmButton.tabIndex()"
      @touchstart="press"
      @mousedown="press"
      @keydown.enter="press"
      @keydown.space="press"
      @blur="props.confirmButton.cancel"
      >
    </div>
    <div class="centered-label" >
      {{ props.confirmButton.awaitingConfirmation ? 'confirm' : props.confirmButton.spec.name }}
    </div>
    <MappingsIndicator :mappings="props.confirmButton.mappings"/>
  </div>
</template>

<style scoped>
@import './control-styles.css';

</style>
