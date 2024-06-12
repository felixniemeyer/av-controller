<script setup lang=ts>
import { computed } from 'vue'
import ControlComponent from './Control.vue'

import Area from './Area.vue'

import { Group } from '@/controls'
import { shade } from 'polished';

// vue
const props = defineProps({
  group: {
    type: Object as () => Group,
    required: true,
  },
})

const controls = computed(() => props.group.controls)
const type = computed(() => props.group.spec.style)

// const basisStyle = makeBasisStyle(props.group.spec) 
const basisStyle = computed(() => {
  const color = props.group.spec.color
  return {
    backgroundColor: shade(0.5, color),
    borderColor: color,
  }
})

</script>

<template>
  <div v-if="type == 'framed'" class="basis framed any" :style="basisStyle" >
    <div class="header">
      {{ props.group.spec.name }}
    </div>
    <div class="content any">
      <Area :controls=controls />
    </div>
  </div>
  <div v-else :class="type">
    <Area :controls=controls />
  </div>
</template>

<style scoped>
@import './control-styles.css';
.any {
  cursor: default; 
}

.framed {
  display: flex;
  flex-direction: column;

  & .header {
    width: 100%;
    text-align: center;
    user-select: none;
    margin: 1rem 0.5rem;
  }
  & .content {
    position: relative;
    flex: 1; 
    display: flex;
  }
}

</style>
