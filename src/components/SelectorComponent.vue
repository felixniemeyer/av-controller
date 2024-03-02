<script setup lang=ts>
import { computed } from 'vue'

// for color manipulation
import { lighten, shade } from 'polished'
import { Selector } from '@/stores/controls'

import MappingsIndicator from './MappingsIndicator.vue'

// vue
const props = defineProps({
  selector: {
    type: Object as () => Selector,
    required: true,
  },
})

const basisStyle = computed(() => {
  const spec = props.selector.spec
  return {
    backgroundColor: spec.color, 
    boxShadow: `0 0 2rem -0.5rem ${spec.color}`,
    borderColor: spec.color,
  }
})

const sliderStyle = computed(() => {
  const spec = props.selector.spec
  return {
    width: `${spec.width}%`,
    height: `${spec.height}%`,
    top: `${spec.y}%`,
    left: `${spec.x}%`,
  }
})

const selectedColor = computed(() => {
  return shade(0.35, props.selector.spec.color)
})

const optionColor = computed(() => {
  return lighten(0.1, props.selector.spec.color)
})

function selectOption(e: TouchEvent, index: number) {
  props.selector.select(index)
  e.preventDefault()
}

</script>

<template>
  <div class="control" :style=sliderStyle >
    <div
      class="basis selector"
      :style=basisStyle
      >
      <div class="selector-label" >
        {{ props.selector.spec.name }}
      </div>
      <div class=options>
        <div
          v-for="(option, index) in props.selector.spec.options"
          :key="index"
          @touchstart="e => selectOption(e, index)"
          class="option"
          :style="{backgroundColor: index === props.selector.index ? selectedColor : optionColor}"
          >
          <div class="centered-label" >
            {{ option }}
          </div>
        </div>
      </div>
    </div>
    <MappingsIndicator :mappings="props.selector.mappings"/>
  </div>
</template>

<style scoped>
@import './control-styles.css';
.selector {
  display: flex;
  flex-direction: column;
}

.selector-label {
  font-weight: bold;
  text-align: center;
  padding: 0.2rem; 
}

.options {
  flex: 1; 
  display: flex;
  flex-direction: column;
}

.option {
  position: relative;
  flex: 1; 
  padding: 0.2rem; 
  border-radius: 0.5rem;
  text-align: center;
}
</style>
