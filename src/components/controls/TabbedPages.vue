<script setup lang=ts>
import { computed } from 'vue'
import ControlComponent from './Control.vue'

import Area from './Area.vue'

import { TabbedPages } from '@/controls'
import { shade } from 'polished';

// vue
const props = defineProps({
  tabbedPages: {
    type: Object as () => TabbedPages,
    required: true,
  },
})

const controls = computed(() => props.tabbedPages.pages[props.tabbedPages.activePage])
const tabs = computed(() => {
  const tabNames = Object.keys(props.tabbedPages.pages)
  const totalWidth = tabNames.reduce((acc, name) => acc + name.length, 0)
  return tabNames.map(name => ({
    name,
    width: name.length / totalWidth, 
    backgroundColor: props.tabbedPages.activePage == name ? shade(0.5, props.tabbedPages.spec.color) : props.tabbedPages.spec.color
  }))
})

const invLength = computed(() => 100 / tabs.reduce((acc, tab) => acc + tab.width, 0))

const basisStyle = computed(() => {
  const color = props.tabbedPages.spec.color
  return {
    backgroundColor: shade(0.5, color),
    borderColor: color,
  }
})

</script>

<template>
  <div class="basis framed any" :style="basisStyle" >
    <div class="header">
      <div v-for="tab in tabs" 
        :class="{tabButton: true, active: tab.name === props.tabbedPages.activePage}"
        :key="tab.name"  
        @click="props.tabbedPages.activePage = tab.name" 
        :style="{ width: tab.width * 100 + '%', backgroundColor: tab.backgroundColor }">
        {{ tab.name }}
      </div>
    </div>
    <div class="content any">
      <Area :controls=controls />
    </div>
  </div>
</template>

<style scoped>
@import './control-styles.css';
.any {
  cursor: default; 
}

.page {
  position: absolute;
  margin: .5rem; 
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

    & .tabButton {
      display: inline-block;
      cursor: pointer;
      padding: 1rem 0; 
    }
  }
  & .content {
    margin:0; 
    position: relative;
    flex: 1;
  }
}

</style>
