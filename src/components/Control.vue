<script setup lang=ts>

import { computed } from 'vue'

import {
  Pad,
  Fader,
  Switch,
  Selector,
  ConfirmButton,
  Label,
  ConfirmSwitch,
  Cake,
} from '@/controls'

import FaderComponent from './controls/Fader.vue'
import PadComponent from './controls/Pad.vue'
import SwitchComponent from './controls/Switch.vue'
import SelectorComponent from './controls/Selector.vue'
import ConfirmButtonComponent from './controls/ConfirmButton.vue'
import LabelComponent from './controls/Label.vue'
import ConfirmSwitchComponent from './controls/ConfirmSwitch.vue'
import CakeComponent from './controls/Cake.vue'

import type { Control } from '@/controls'

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
</script>

<template>
  <div class="control" :style=posize >
    <PadComponent v-if="type === 'pad'" :pad="control as Pad"/>
    <FaderComponent v-if="type === 'fader'" :fader="control as Fader"/>
    <SwitchComponent v-if="type === 'switch'" :switch="control as Switch"/>
    <SelectorComponent v-if="type === 'selector'" :selector="control as Selector"/>
    <ConfirmButtonComponent v-if="type === 'confirm-button'" :confirmButton="control as ConfirmButton"/>
    <LabelComponent v-if="type === 'label'" :label="control as Label"/>
    <ConfirmSwitchComponent v-if="type === 'confirm-switch'" :confirmSwitch="control as ConfirmSwitch"/>
    <CakeComponent v-if="type === 'cake'" :cake="control as Cake"/>
  </div>
</template>

<style scoped>
@import './controls/control-styles.css';
</style>
