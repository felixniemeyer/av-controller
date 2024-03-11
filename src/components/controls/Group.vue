<script setup lang=ts>
import { computed } from 'vue'
import ControlComponent from './Control.vue'

import { Group } from '@/controls'
import { makeBasisStyle } from './common'

// vue
const props = defineProps({
  group: {
    type: Object as () => Group,
    required: true,
  },
})

const controls = computed(() => props.group.controls)
const type = computed(() => props.group.spec.style)
const color = computed(() => props.group.spec.color)

const basisStyle = makeBasisStyle(props.group.spec) 

</script>

<template>
  <div v-if="type == 'framed'" class="basis framed any" :style="basisStyle" >
    <div class="header">
      {{ props.group.spec.name }}
    </div>
    <div class="content any">
      <template v-for="control, i in controls" :key="i">
        <ControlComponent :control="control"/>
      </template>
    </div>
  </div>
  <div v-else :class="type">
    <template v-for="control, i in controls" :key="i">
      <ControlComponent :control="control"/>
    </template>
  </div>
</template>

<style scoped>
@import './control-styles.css';
.any {
  cursor: default; 
}

.page {
  position: absolute;
  margin: 0.5rem; 
  width: calc(100% - 1rem);
  height: calc(100% - 1rem);
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
