<script setup lang="ts">
import { ref, onMounted, onBeforeMount, reactive } from 'vue'

import { 
  Messages, 
  PadSpec, 
  FaderSpec,
  SwitchSpec,
  SelectorSpec,
  ConfirmButtonSpec,
  LabelSpec,
  ConfirmSwitchSpec,
  CakeSpec,
  GroupSpec,
type ControlSpecsDict,
} from 'av-controls'

import {
  Control, 
  type ControlsDict, 
  Group,
  Fader,
  Pad,
  Switch,
  Selector,
  ConfirmButton,
  Label,
  ConfirmSwitch,
  Cake,
} from './controls'

import type { ControlId } from 'av-controls/src/messages'

import Gallery from './components/Gallery.vue'

import MIDISignalLogger from './components/MIDISignalLogger.vue'
import ControlComponent from './components/controls/Control.vue'
import LinkedArtworkPrompt from './components/LinkedArtworkPrompt.vue'

import { midiListener } from './midiListener'

import { type MidiSource } from './mappings'
import { Mapping, CCToFaderMapping, KeyToPadMapping } from './mappings'

import Menu from './components/Menu.vue'
import { type MenuSpec } from './menu-spec'

import TextInputPrompt from './components/TextInputPrompt.vue'

let tab = ref(null as Window | null)
let tabOrigin: string

const page = ref<Group>()
let receiverId = ''

const linkedArtwork = ref('')
onBeforeMount(() => {
  // check url param "control"
  const urlParams = new URLSearchParams(window.location.search)
  const visualTabUrl = urlParams.get('control')
  if(visualTabUrl) {
    linkedArtwork.value = visualTabUrl
  }
})

// for dev
onMounted(() => {
  openVisualsTab('http://localhost:5173')
})

const controlledName = ref('')

function openVisualsTab(visualTabUrl: string) {
  console.log('opening tab', visualTabUrl)
  tab.value = window.open(visualTabUrl)
  tabOrigin = new URL(visualTabUrl).origin
  if(tab.value == null) {
    console.error('could not open tab')
    return
  } else {
    const messageHandler = (event: MessageEvent) => {
      if(tab.value && event.origin == tabOrigin) {
        const type = event.data.type
        if(type === Messages.AnnounceReceiver.type) {
          const announcement = event.data as Messages.AnnounceReceiver
          controlledName.value = announcement.name
          controlsLabel.value.spec.name = `controlling ${announcement.name}`
          const controls = createControls(announcement.controlSpecs)
          const pageSpec = new GroupSpec('1', 0, 0, 100, 100, '#000', announcement.controlSpecs, 'page')
          page.value = reactive(new Group(
            pageSpec, 
            controls
          ))
          receiverId = announcement.receiverId
        } else if(type === Messages.MeterMessage.type) {
          const msg = event.data as Messages.MeterMessage
          if(msg.receiverId == receiverId) {
            if(page.value) {
              page.value.update(msg.payload, msg.controlId)
            }
          }
        } else if(type === Messages.TabClosing.type) {
          console.log('tab closed')
        } else {
          console.warn('unknown message type in message', event.data)
        }
      }
    } 
    window.addEventListener('message', messageHandler)
  }
}

function createControls(specs: ControlSpecsDict, idPath: ControlId = []) {
  let controls: ControlsDict = {}
  for(let id in specs) {
    const spec = specs[id]
    let control: Control | undefined
    if(spec.type === 'pad') {
      control = new Pad(spec as PadSpec)
    } else if(spec.type === 'fader') {
      control = new Fader(spec as FaderSpec)
    } else if(spec.type === 'switch') {
      control = new Switch(spec as SwitchSpec)
    } else if(spec.type === 'selector') {
      control = new Selector(spec as SelectorSpec)
    } else if(spec.type === 'confirm-button') {
      control = new ConfirmButton(spec as ConfirmButtonSpec)
    } else if(spec.type === 'confirm-switch') {
      control = new ConfirmSwitch(spec as ConfirmSwitchSpec)
    } else if(spec.type === 'label') {
      control = new Label(spec as LabelSpec)
    } else if(spec.type === 'cake') {
      control = new Cake(spec as CakeSpec)
    } else if(spec.type === 'group') {
      const groupSpec = spec as GroupSpec
      control = new Group(groupSpec, createControls(groupSpec.controlSpecs, idPath.concat(id)))
    } else {
      console.error('unknown control type', spec)
    }
    if(control) {
      const scopedId = idPath.concat(id)
      control.onUpdate = (payload) => {
        sendUpdateToTab(payload, scopedId)
      }
      control.onTouch = () => {
        controllerTouched(scopedId)
      }
      controls[id] = control
    }
  }
  return controls
}

const midiSourceForMapping = ref(null as (null | MidiSource))
const mappingsBySource = {} as {[midiSourceId: string]: Mapping[]}

midiListener.addListener((signal) => {
  const mappings = mappingsBySource[signal.sourceId]
  if(mappings !== undefined) {
    mappings.forEach(mapping => {
      mapping.handleSignal(signal)
    })
  }
})

function getControl(group: Group, controlId: ControlId) {
  if(controlId.length > 1) {
    return getControl(group.controls[controlId[0]] as Group, controlId.slice(1))
  } else {
    return group.controls[controlId[0]]
  }
}

function controllerTouched(controlId: ControlId) {
  if(page.value) {
    const control = getControl(page.value, controlId)
    if(rmMapButton.value.on) {
      for(let midiSourceId in mappingsBySource) {
        control.removeMappings()
        const mappings = mappingsBySource[midiSourceId]
        let removedSome = false
        for(let i = 0; i < mappings.length; i++) {
          if(mappings[i].control == control) {
            mappings.splice(i, 1)
            removedSome = true
          }
        }
        if(removedSome) {
          rmMapButton.value.on = false
        }
      }
    } else if(midiSourceForMapping.value !== null) {
      let c: Mapping | undefined
      if(midiSourceForMapping.value.type == 'cc') {
        if(control instanceof Fader) {
          c = new CCToFaderMapping(control)
        } else {
          console.warn('control change to non-fader not implemented')
        }
      } else if(midiSourceForMapping.value.type == 'key') {
        if(control instanceof Pad) {
          c = new KeyToPadMapping(control)
        } else {
          console.warn('note on to non-pad not implemented')
        }
      }
      if(c) {
        control.addMapping(c)
        const mappings = mappingsBySource[midiSourceForMapping.value.midiSourceId]
        if(mappings === undefined) {
          mappingsBySource[midiSourceForMapping.value.midiSourceId] = [c]
        } else {
          mappings.push(c)
        }
        midiSourceForMapping.value = null
        mapSwitch.value.on = false
      }
    }
  }
}

const exitButton = ref(new ConfirmButton(
  new ConfirmButtonSpec('exit', 0, 0, 10, 100, '#c23')
))
exitButton.value.onUpdate = (confirmed) => {
  if(confirmed) {
    tab.value = null
  }
}

const controlsLabel = ref(new Label(
  new LabelSpec('controls', 10, 0, 30, 100, '#555', 'center')
))

const mapSwitch = ref(new Switch(
  new SwitchSpec('map', 93.333, 0, 6.666, 100, '#2aa', false)
))
mapSwitch.value.onUpdate = (isOn: boolean) => {
  showMidiSignals.value = isOn 
  if(!isOn) {
    midiSourceForMapping.value = null
  }
}

const rmMapButton = ref(new Switch (
  new SwitchSpec('remove mapping', 86.666, 0, 6.666, 100, '#c23', false)
))

// load list of saved mappings names from local storage for current controllable
function getSavedMappings() {
  const savedMappings = localStorage.getItem('savedMappings')

  try {
    console.log('saved mappings', savedMappings)
    const object = savedMappings ? JSON.parse(savedMappings) : {}
    return object[controlledName.value] || {}
  } catch(error: any) {
    console.error('failed to load saved mappings', error) 
  }
}

function saveMapping(name: string) {
  // save mappings to local storage
  let savedMappingsString = localStorage.getItem('savedMappings')
  let savedMappings: any
  if(savedMappingsString == null) {
    savedMappings = {}
  } else {
    savedMappings = JSON.parse(savedMappingsString)
  }
  let mappingsForControllable = savedMappings[controlledName.value]
  if(mappingsForControllable == undefined) {
    mappingsForControllable = savedMappings[controlledName.value] = {}
  }
  mappingsForControllable[name] = mappingsBySource
  localStorage.setItem('savedMappings', JSON.stringify(savedMappings))
}

const menu = ref(null as (null | MenuSpec))
const manageMappingsButton = new Pad(
  new PadSpec('manage mappings', 80, 0, 6.666, 100, '#2a2'),
)
manageMappingsButton.onUpdate = (payload) => {
  if(payload.press) {
    console.log('opening menu')
    const savedMappings = getSavedMappings()
    console.log(savedMappings)
    const mappingNames = Object.keys(savedMappings)
    menu.value = {
      name: 'Manage mappings',
      description: 'Save, load, export, import or delete midi mappings for ' + controlledName.value,
      items: [
        {
          name: 'save',
          action: 'save',
          submenu: {
            name: 'Saving mapping as ...', 
            description: 'Overwrite a setting or save the current mappings as a new file',
            items: [
              {
                name: 'new mapping', 
                action: {
                  type: 'new'
                },
                color: '#8f8',
              },
              ...mappingNames.map(name => ({
                name: name,
                action: {
                  type: 'overwrite', 
                  name
                }, 
                color: '#f88',
              })),
            ],
          },
        },
        {
          name: 'load',
          action: 'load',
          submenu: {
            name: 'Load saved mapping', 
            description: 'Load a saved mapping. This will override the currently active mapping', 
            items: mappingNames.map(name => ({
              name, 
              action: {
                type: 'load', 
                name
              }
            }))
          }
        },
        {
          name: 'export',
          action: 'not implemented yet',
        },
        {
          name: 'import',
          action: 'not implemented yet',
        },
        {
          name: 'delete',
          action: 'delete',
          submenu: {
            name: 'Delete saved mapping', 
            description: 'Delete a mapping. This cannot be undone and the mapping can\'t be loaded anymore afterwards.', 
            items: mappingNames.map(name => ({
              name, 
              action: {
                type: 'delete', 
                name
              }
            }))
          }
        },
      ],
    };
  }
}

const textInputHandler = ref(null as null | ((value: string) => void))
const textInputTitle = ref('')
const textInputPlaceholder = ref('') 

function handleMenuAction(action: any) {
  console.log('menu action', action)
  if(action.type == 'new') {
    console.log('saving mapping') 
    textInputTitle.value = 'Enter the name for the new mapping'
    textInputPlaceholder.value = 'new mapping name'
    textInputHandler.value = (newMappingName) => {
      saveMapping(newMappingName)
      textInputHandler.value = null
      menu.value = null
    }
  } 
}

function closeMenu() {
  console.log('closing menu') 
  textInputHandler.value = null
}

function sendUpdateToTab(payload: any, controlId: ControlId) {
  if(tab.value == null) {
    return
  } else {
    const msg = new Messages.ControlMessage(controlId, payload)
    tab.value.postMessage(msg, '*')
  }
}

const showMidiSignals = ref(false)

function mapMIDIActivity(midiSource: MidiSource) {
  showMidiSignals.value = false
  midiSourceForMapping.value = midiSource
}

</script>

<template>
  <LinkedArtworkPrompt v-if="linkedArtwork" :url="linkedArtwork"
      @confirm="openVisualsTab(linkedArtwork); linkedArtwork = ''"
      @cancel="linkedArtwork = ''"
  />
  <Gallery v-else-if="false && tab == null" @open-visuals-tab='openVisualsTab'/>
  <div v-else class="app">
    <div class="control-header">
      <ControlComponent :control="exitButton" />
      <ControlComponent :control="controlsLabel" />
      <!-- TBD! show info switch -->
      <!-- TBD! bookmark scene -->
      <!-- TBD! PadComponent :pad="saveMappingsButton" /-->
      <ControlComponent :control="manageMappingsButton" />
      <ControlComponent :control="mapSwitch" />
      <ControlComponent :control="rmMapButton" />
    </div>
    <MIDISignalLogger v-if="showMidiSignals" @select="mapMIDIActivity"/>
    <div v-else class="control-area">
      <div v-if="page === undefined" class='wait-screen'>
        <p>Waiting for controls...</p>
        <button @click="tab = null">abort / go back</button>
      </div>
      <ControlComponent v-else :control="page"/> 
    </div>
  </div>
  <Menu 
    v-if="menu" 
    :menu="menu" 
    @back="menu = null"
    @action="handleMenuAction" />
  <TextInputPrompt 
    v-if='textInputHandler'
    :title='textInputTitle'
    :placeholder='textInputPlaceholder'
    @submit='textInputHandler'
    @close='textInputHandler = null'
    />
</template>

<style scoped>
button {
  background-color: #fff3;
  padding: 0.5rem;
  display: inline-block;
  border-radius: 0.5rem;
  border: none; 
  color: #fff; 
  margin-left: 0.5rem; 
}

.control-header {
  position: relative;
  top: 0.5rem; 
  left: 0.5rem;
  width: calc(100% - 1rem);
  height: 4.5rem;
  border-radius: 0.5rem;
  box-sizing: border-box;
  background-color: #fff2;
}

.control-area {
  position: absolute;
  top: 4.5rem;
  left: 0;
  height: calc(100% - 4.5rem);
  width: calc(100%);
  box-sizing: border-box;
}

.wait-screen {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
</style>
