<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

import { useMappingsStore, type MidiSource } from './stores/mappings'

import type { ControlId } from 'av-controls/src/messages'
import MIDISignalLogger from './components/MIDISignalLogger.vue'
import ControlComponent from './components/controls/Control.vue'


const mappingsStore = useMappingsStore()

let tab = ref(null as Window | null)
let tabOrigin: string

const visualTabUrl = ref('')
const urlInputField = ref(null as HTMLInputElement | null)

onMounted(() => {
  urlInputField.value?.focus()
})

function confirmOnEnter(e: KeyboardEvent, url?: string) {
  if(e.key === 'Enter' || e.key === ' ') {
    if(url) {
      openExample(url)
    } else {
      openVisualsTab()
    }
    e.stopPropagation()
    e.preventDefault()
  }
}

function openExample(url: string) {
  visualTabUrl.value = url
  openVisualsTab()
}

const page = ref<Group>()
let receiverId = ''

function openVisualsTab() {
  tab.value = window.open(visualTabUrl.value)
  tabOrigin = new URL(visualTabUrl.value).origin
  if(tab.value == null) {
    console.error('could not open tab')
    return
  } else {
    const messageHandler = (event: MessageEvent) => {
      if(tab.value && event.origin == tabOrigin) {
        const type = event.data.type
        if(type === Messages.AnnounceReceiver.type) {
          const announcement = event.data as Messages.AnnounceReceiver
          controlsLabel.value.spec.name = `controlling ${announcement.name}`
          const controls = createControls(announcement.controlSpecs)
          page.value = new Group(
            new GroupSpec('1', 0, 0, 100, 100, '#000', announcement.controlSpecs, 'page'), 
            controls
          )
          receiverId = announcement.receiverId
        } else if(type === Messages.MeterMessage.type) {
          const msg = event.data as Messages.MeterMessage
          if(msg.receiverId == receiverId) {
            if(page.value) {
              page.value.update(msg.payload, msg.controlId)
            }
          }
        } else {
          console.log('unknown message type', type)
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
    let control 
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
      control.onTouch = mappingsStore.maybeMapTo
      controls[id] = control
    }
  }
  return controls
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
  new LabelSpec('controls', 10, 0, 70, 100, '#555', 'center')
))

const mapSwitch = ref(new Switch(
  new SwitchSpec('map', 90, 0, 10, 100, '#2aa', false)
))
mapSwitch.value.onUpdate = (isOn: boolean) => {
  showMidiSignals.value = isOn 
}

const rmMapButton = ref(new Switch (
  new SwitchSpec('remove mapping', 80, 0, 10, 100, '#c23', false)
))
rmMapButton.value.onUpdate = (isOn: boolean) => {
  mappingsStore.removeMapping = isOn
  console.log('remove mapping', mappingsStore.removeMapping)
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
  mappingsStore.midiSourceForMapping = midiSource
}

const examples = {
  'music-box': import.meta.env.DEV ? 'http://localhost:5173' :  'https://gfx.aimparency.org/music-box-song/'
}

</script>

<template>
  <div class='tab-opener' v-if="tab == null" >
    <div>
      <h1>av control</h1>
      <p>
        Open a new tab with a av-control receiving webapp
      </p>
      <input type="text" ref='urlInputField' v-model="visualTabUrl" @keydown=confirmOnEnter placeholder="URL"/>
      <button @click="openVisualsTab">open</button>
      <div class=examples >
        <div v-for="(url, name) in examples" 
          class=exwrap 
          @click="openExample(url)" 
          @keydown="confirmOnEnter($event, url)"
          tabindex="0" >
          <div class=example>
            {{ name }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="app">
    <div class="control-header">
      <ControlComponent :control="exitButton" />
      <ControlComponent :control="controlsLabel" />
      <!-- TBD! show info switch -->
      <!-- TBD! bookmark scene -->
      <!-- TBD! PadComponent :pad="saveMappingsButton" /-->
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
</template>

<style scoped>

.tab-opener {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
}

.tab-opener div {
  text-align: center;
  & p {
    margin: 0.5rem; 
  }
}

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

.exwrap {
  display: inline-block;
  margin: 0.5rem; 
  width: 2rem; 
  height: 20rem;
  background-color: #fff3;
  cursor: pointer;
  border-radius: 0.5rem;
}

.exwrap:hover {
  background-color: #fff6;
}

.example {
  width: 2rem; 
  height: 2rem; 
  overflow: visible;
  white-space: nowrap;
  position: relative;
  display: inline-block;
  transform-origin: 50% 50%;
  transform: rotate(90deg);
  pointer-events: none;
  line-height: 2rem;
  padding: 0 0.5rem;
}

.wait-screen {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

</style>
