<script setup lang="ts">
import { ref, onMounted } from 'vue'

import FaderComponent from './components/controls/Fader.vue'
import PadComponent from './components/controls/Pad.vue'
import SwitchComponent from './components/controls/Switch.vue'
import SelectorComponent from './components/controls/Selector.vue'
import ConfirmButtonComponent from './components/controls/ConfirmButton.vue'
import LabelComponent from './components/controls/Label.vue'

import * as Controls from './controls'
import { useMappingsStore, type MidiSource } from './stores/mappings'

import MIDISignalLogger from './components/MIDISignalLogger.vue'

import { Messages, Specs } from 'av-controls'

const mappingsStore = useMappingsStore()

let tab = ref(null as Window | null)
let tabOrigin: string

const visualTabUrl = ref('')
const urlInputField = ref(null as HTMLInputElement | null)

onMounted(() => {
  urlInputField.value?.focus()
})

function tabClosed () {
  waitingForControls.value = true
}

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

const waitingForControls = ref(false)

let messageHandler: null | ((event: MessageEvent) => void) = null
function openVisualsTab() {
  tab.value = window.open(visualTabUrl.value)
  tabOrigin = new URL(visualTabUrl.value).origin
  if(tab.value == null) {
    console.error('could not open tab')
    return
  } else {
    waitingForControls.value = true
    if(messageHandler) {
      window.removeEventListener('message', messageHandler)
    }
    messageHandler = (event) => {
      if(tab.value && event.origin == tabOrigin) {
        const type = event.data.type
        if(type === Messages.AnnounceReceiver.type) {
          const msg = event.data as Messages.AnnounceReceiver
          controlsLabel.value.spec.name = `controlling ${msg.name}`
          createControls(msg)
          waitingForControls.value = false
        } else if(type === Messages.TabClosing.type) {
          tabClosed()
        }
      }
    } 
    window.addEventListener('message', messageHandler)
  }
}

const controls = ref([] as Controls.Control[])
function createControls(msg: Messages.AnnounceReceiver) {
  const results = []
  for(let i = 0; i < msg.specs.length; i++) {
    const spec = msg.specs[i]
    let control 
    if(spec.type === 'pad') {
      control = new Controls.Pad(spec as Specs.PadSpec)
    } else if(spec.type === 'fader') {
      control = new Controls.Fader(spec as Specs.FaderSpec)
    } else if(spec.type === 'switch') {
      control = new Controls.Switch(spec as Specs.SwitchSpec)
    } else if(spec.type === 'selector') {
      control = new Controls.Selector(spec as Specs.SelectorSpec)
    } else if(spec.type === 'confirm-button') {
      control = new Controls.ConfirmButton(spec as Specs.ConfirmButtonSpec)
    } else if(spec.type === 'label') {
      control = new Controls.Label(spec as Specs.LabelSpec)
    } else {
      console.error('unknown control type', spec)
    }
    if(control) {
      const index = i
      control.onUpdate = (payload) => {
        sendUpdateToTab(index, payload)
      }
      control.onTouch = mappingsStore.maybeMapTo
      results[i] = control
    }
  }
  controls.value = results
}


const exitButton = ref(new Controls.ConfirmButton(
  new Specs.ConfirmButtonSpec('exit', 0, 0, 10, 100, '#c23')
))
exitButton.value.onUpdate = (confirmed) => {
  if(confirmed) {
    tab.value = null
  }
}

const controlsLabel = ref(new Controls.Label(
  new Specs.LabelSpec('controls', 10, 0, 70, 100, '#555', 'center')
))

const mapSwitch = ref(new Controls.Switch(
  new Specs.SwitchSpec('map', 90, 0, 10, 100, '#2aa', false)
))
mapSwitch.value.onUpdate = (isOn: boolean) => {
  showMidiSignals.value = isOn 
}

const rmMapButton = ref(new Controls.Switch (
  new Specs.SwitchSpec('remove mapping', 80, 0, 10, 100, '#c23', false)
))
rmMapButton.value.onUpdate = (isOn: boolean) => {
  mappingsStore.removeMapping = isOn
  console.log('remove mapping', mappingsStore.removeMapping)
}

function sendUpdateToTab(controlIndex: number, payload: any) {
  if(tab.value == null) {
    return
  } else {
    const msg = new Messages.ControlMessage(controlIndex, payload)
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
      <ConfirmButtonComponent :confirmButton="exitButton" />
      <LabelComponent :label="controlsLabel" />
      <!-- TBD! PadComponent :pad="saveMappingsButton" /-->
      <SwitchComponent :switch="mapSwitch" />
      <SwitchComponent :switch="rmMapButton" />
    </div>
    <MIDISignalLogger v-if="showMidiSignals" @select="mapMIDIActivity"/>
    <div v-else class="control-area">
      <template v-if="waitingForControls">
        <div class='wait-screen'>
          <p>Waiting for controls...</p>
          <button @click="tab = null">abort / go back</button>
        </div>
      </template>
      <template v-else v-for="control, i in controls">
        <PadComponent v-if="control.spec.type === 'pad'" :pad="control as Controls.Pad" :key="i"/>
        <FaderComponent v-if="control.spec.type === 'fader'" :fader="control as Controls.Fader" :key="i"/>
        <SwitchComponent v-if="control.spec.type === 'switch'" :switch="control as Controls.Switch" :key="i"/>
        <SelectorComponent v-if="control.spec.type === 'selector'" :selector="control as Controls.Selector" :key="i"/>
        <ConfirmButtonComponent v-if="control.spec.type === 'confirm-button'" :confirmButton="control as Controls.ConfirmButton" :key="i"/>
        <LabelComponent v-if="control.spec.type === 'label'" :label="control as Controls.Label" :key="i"/>
      </template>
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
  top: 5rem;
  left: 0.5rem;
  height: calc(100% - 5.5rem);
  width: calc(100% - 1rem);
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
