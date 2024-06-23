<script setup lang=ts>
import { computed } from 'vue'

// for color manipulation
import { PresetButton } from '@/controls'

import MappingsIndicator from '../MappingsIndicator.vue'

import Menu from '@/components/Menu.vue'

import { 
  menu, menuActionHandler, 
  textInputTitle, textInputPlaceholder, textInputHandler, 
  confirmTitle, confirmMessage, confirmHandler, 
  fileInputTitle, fileInputDescription, fileInputHandler, type MenuItemSpec 
} from '@/menu-globals'

// vue
const props = defineProps({
  presetButton: {
    type: Object as () => PresetButton,
    required: true,
  },
})

const basisStyle = computed(() => {
  const spec = props.presetButton.spec
  return {
    backgroundColor: spec.color,
    boxShadow: `0 0 2rem -0.5rem ${spec.color}`,
    borderColor: spec.color,
  }
})

function openMenu(_e: Event) {
  const presetNames = props.presetButton.getNames()
  const items = [
    {
      name: 'save',
      submenu: {
        name: 'Saving preset as ...', 
        description: 'Overwrite a setting or save the current mappings as a new file',
        items: [
          ...presetNames.map(name => ({
            name: name,
            action: {
              type: 'save-as', 
              name
            }, 
            color: '#f88',
          })),
          ...Array.from({length: 8}, (_, i) => i).filter(i => !presetNames.includes(`${i}`)).map(i => ({
            name: `${i}`,
            action: {
              type: 'save-as',
              name: `${i}`
            },
          })),
          {
            name: 'individual name', 
            action: {
              type: 'save-as-prompt'
            },
            color: '#8f8',
          },
        ],
      },
    },
  ] as MenuItemSpec[]
  if(presetNames.length > 0) {
    items.push({
      name: 'load',
      submenu: {
        name: 'Load saved mapping', 
        description: 'Load a saved mapping. This will override the currently active mapping', 
        items: presetNames.map(name => ({
          name, 
          action: {
            type: 'load', 
            name
          }
        }))
      }
    })
    items.push({
      name: 'delete',
      submenu: {
        name: 'Delete saved mapping', 
        description: 'Delete a mapping. This cannot be undone and the mapping can\'t be loaded anymore afterwards.', 
        items: presetNames.map(name => ({
          name, 
          action: {
            type: 'delete', 
            name
          }
        }))
      }
    })
  } 

  menu.value = {
    name: `${props.presetButton.spec.name}`,
    description: 'save, load and remove presets', 
    items
  };
  menuActionHandler.value = handleMenuAction
}


function handleMenuAction(action: any) {
  if(action.type == 'save-as-prompt') {
    textInputTitle.value = 'Enter the name for the new mapping'
    textInputPlaceholder.value = 'new mapping name'
    textInputHandler.value = (newPresetName) => {
      props.presetButton.save(newPresetName)
      textInputHandler.value = null
      menu.value = null
    }
  } else if(action.type == 'save-as') {
    props.presetButton.save(action.name)
    menu.value = null
  } else if(action.type == 'load') {
    props.presetButton.load(action.name)
    menu.value = null
  } else if(action.type == 'delete') {
    props.presetButton.delete(action.name)
    menu.value = null
  } 
}

</script>

<template>
  <div
    class="basis"
    :style=basisStyle
    :tabindex="props.presetButton.tabIndex()"
    @click="openMenu"
    >
  </div>
  <div class="centered-label" >
    {{ props.presetButton.spec.name }}
  </div>
  <MappingsIndicator :mappings="props.presetButton.mappings"/>
  <Menu 
    v-if="menu" 
    :menu="menu" 
    @back="menu = null"
    @action="handleMenuAction" />
</template>

<style scoped>
@import './control-styles.css';

</style>
