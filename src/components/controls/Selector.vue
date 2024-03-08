<script setup lang=ts>
import { computed } from 'vue'

// for color manipulation
import { lighten, shade } from 'polished'
import { Selector } from '@/controls'

import MappingsIndicator from '../MappingsIndicator.vue'

// vue
const props = defineProps({
  selector: {
    type: Object as () => Selector,
    required: true,
  },
})

const basisStyle = computed(() => {
  const color = props.selector.spec.color
  return {
    backgroundColor: color, 
    boxShadow: `0 0 2rem -0.5rem ${color}`,
    borderColor: color,
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
  return shade(0.3, props.selector.spec.color)
})

const optionColor = computed(() => {
  return lighten(0.1, props.selector.spec.color)
})

function selectOption(e: TouchEvent | MouseEvent, index: number) {
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
          @touchstart="selectOption($event, index)"
          @mousedown="selectOption($event, index)"
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
  margin-top: -0.5rem;
  user-select: none;
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
