<script setup lang=ts>

import { computed } from 'vue'

import {
  Control, 
  Group,
  TabbedPages, 
  Pad,
  Fader,
  Switch,
  Selector,
  ConfirmButton,
  Label,
  ConfirmSwitch,
  Cake,
} from '@/controls'

import GroupComponent from './Group.vue'
import FaderComponent from './Fader.vue'
import PadComponent from './Pad.vue'
import SwitchComponent from './Switch.vue'
import SelectorComponent from './Selector.vue'
import ConfirmButtonComponent from './ConfirmButton.vue'
import LabelComponent from './Label.vue'
import ConfirmSwitchComponent from './ConfirmSwitch.vue'
import CakeComponent from './Cake.vue'
import TabbedPagesComponent from './TabbedPages.vue'

const props = defineProps({
  control: {
    type: Object as () => Control,
    required: true,
  },
})

const type = computed(() => props.control.spec.type)

const posize = computed(() => {
  const spec = props.control.spec
  return {
    width: `${spec.width}%`,
    height: `${spec.height}%`,
    top: `${spec.y}%`,
    left: `${spec.x}%`,
  }
})

const showlabels = false 
</script>

<template>
  <div class="control" :style="posize">
    <div v-if='showlabels' class=typelabel>{{ type }}</div>
    <GroupComponent v-if="type === 'group'" :group="control as Group"/>
    <PadComponent v-else-if="type === 'pad'" :pad="control as Pad"/>
    <FaderComponent v-else-if="type === 'fader'" :fader="control as Fader"/>
    <SwitchComponent v-else-if="type === 'switch'" :switch="control as Switch"/>
    <SelectorComponent v-else-if="type === 'selector'" :selector="control as Selector"/>
    <ConfirmButtonComponent v-else-if="type === 'confirm-button'" :confirmButton="control as ConfirmButton"/>
    <LabelComponent v-else-if="type === 'label'" :label="control as Label"/>
    <ConfirmSwitchComponent v-else-if="type === 'confirm-switch'" :confirmSwitch="control as ConfirmSwitch"/>
    <CakeComponent v-else-if="type === 'cake'" :cake="control as Cake"/>
    <TabbedPagesComponent v-else-if="type === 'tabbed-pages'" :tabbedPages="control as TabbedPages"/>
    <div v-else>Unknown control type: {{ type }}</div>
  </div>
</template>

<style scoped>
.control {
  position: absolute;
  user-select: none;
}
.typelabel {
  position: absolute;
  left: 1rem; 
  top: 1rem;
  z-index: 100;
  background-color: #0008;
  color: #f88; 
}
</style>
