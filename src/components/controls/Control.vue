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

import GroupComponent from './Group.vue'
import FaderComponent from './Fader.vue'
import PadComponent from './Pad.vue'
import SwitchComponent from './Switch.vue'
import SelectorComponent from './Selector.vue'
import ConfirmButtonComponent from './ConfirmButton.vue'
import LabelComponent from './Label.vue'
import ConfirmSwitchComponent from './ConfirmSwitch.vue'
import CakeComponent from './Cake.vue'

import type { Control, Group } from '@/controls'

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
  <div class="control" :style="posize">
    <GroupComponent v-if="type === 'group'" :group="control as Group"/>
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
.control {
  position: absolute;
  user-select: none;
}
</style>
