<script setup lang=ts>
import { computed, ref, type Ref } from 'vue'

// for color manipulation
import { shade } from 'polished'
import { Switch } from '@/controls'

import MappingsIndicator from '../MappingsIndicator.vue'

// vue
const props = defineProps({
  switch: {
    type: Object as () => Switch,
    required: true,
  },
})

const color = computed(() => {
  const spec = props.switch.spec
  if (props.switch.on) {
    return shade(0.35, spec.color)
  } else {
    return spec.color
  }
})

const basisStyle = computed(() => {
  const spec = props.switch.spec
  return {
    backgroundColor: color.value,
    boxShadow: `0 0 3rem -2rem ${spec.color}`,
    borderColor: spec.color,
  }
})

const control = ref(null) as Ref<HTMLDivElement | null>
function press(e: Event) {
  props.switch.touchDown()
  e.preventDefault()
  control.value!.focus()
}

</script>

<template>
  <div
    ref="control" :tabindex=props.switch.tabIndex()
    class="basis" 
    :style=basisStyle
    @touchstart="press"
    @click="press"
    @keydown.enter="press"
    @keydown.space="press"
    >
  </div>
  <div class="centered-label" >
    {{ props.switch.spec.name }}
  </div>
  <MappingsIndicator :mappings="props.switch.mappings"/>
</template>

<style scoped>
@import './control-styles.css';
</style>
