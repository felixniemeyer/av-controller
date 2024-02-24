<script setup lang="ts">
import { ref, onMounted } from 'vue'

import FaderComponent from './components/FaderComponent.vue'
import PadComponent from './components/PadComponent.vue'

import { useControlsStore, Pad, Fader } from './stores/controls'
import { useMappingsStore, type MidiSource } from './stores/mappings'

import MIDISignalLogger from './components/MIDISignalLogger.vue'

import { Messages, Specs } from 'av-controls'


const controlsStore = useControlsStore()
const mappingsStore = useMappingsStore()

let tab = ref(null as Window | null)
let tabOrigin: string

const visualTabUrl = ref('')
const urlInputField = ref(null as HTMLInputElement | null)

onMounted(() => {
  urlInputField.value?.focus()
})

function tabClosed () {
  console.log('tab reported closing')
  // tab.value = null
}

function confirmOnEnter(e: KeyboardEvent) {
  if(e.key === 'Enter') {
    openVisualsTab()
    e.stopPropagation()
    e.preventDefault()
  }
}

function openVisualsTab() {
  tab.value = window.open(visualTabUrl.value)
  tabOrigin = new URL(visualTabUrl.value).origin
  if(tab.value == null) {
    console.error('could not open tab')
    return
  } else {
    window.addEventListener('message', (event) => {
      console.log('received message', event.data)

      if(tab.value && event.origin == tabOrigin) {
        console.log('received message from tab', event.data)
        const type = event.data.type
        if(type === Messages.AnnounceReceiver.type) {
          const msg = event.data as Messages.AnnounceReceiver
          createControls(msg)
        } else if(type === Messages.TabClosing.type) {
          tabClosed()
        }
      }
    }) 
  }
}

function createControls(msg: Messages.AnnounceReceiver) {
  const controls = []
  for(let i = 0; i < msg.specs.length; i++) {
    const spec = msg.specs[i]
    let control 
    if(spec.type === 'pad') {
      control = new Pad(spec as Specs.PadSpec)
    } else if(spec.type === 'fader') {
      control = new Fader(spec as Specs.FaderSpec)
    } else {
      console.error('unknown control type', spec)
    }
    if(control) {
      const index = i
      control.onUpdate = (payload) => {
        sendUpdateToTab(index, payload)
      }
      control.onTouch = mappingsStore.maybeMapTo
      controls[i] = control
    }
  }

  // special controls
  const mapButton = new Pad(
    new Specs.PadSpec('map', 90, 80, 10, 20, '#2aa')
  )
  mapButton.onTouch = () => {
    if(mappingsStore.midiSourceForMapping !== undefined) {
      mappingsStore.midiSourceForMapping = undefined
    } else {
      showMidiSignals.value = true
    }
  }
  controls.push(mapButton)

  const rmMapButton = new Pad(
    new Specs.PadSpec('remove mapping', 80, 80, 10, 20, '#c23')
  )
  rmMapButton.onTouch = () => {
    mappingsStore.removeMapping = !mappingsStore.removeMapping
    console.log('remove mapping', mappingsStore.removeMapping)
  }
  controls.push(rmMapButton)

  mapButton.onUpdate = showMidiSignalLogger

  controlsStore.setControls(controls)
}

function sendUpdateToTab(controlIndex: number, payload: any) {
  if(tab.value == null) {
    console.error('tab is null')
    return
  } else {
    const msg = new Messages.ControlMessage(controlIndex, payload)
    tab.value.postMessage(msg, '*')
  }
}

const showMidiSignals = ref(false)

function showMidiSignalLogger() {
  showMidiSignals.value = true
}

function mapMIDIActivity(midiSource: MidiSource) {
  showMidiSignals.value = false
  mappingsStore.midiSourceForMapping = midiSource
}

</script>

<template>
  <div class='tab-opener' v-if="tab == null" >
    <h1>av control</h1>
    <p>
      Open a new tab with a av-control receiving webapp
    </p>
    <input type="text" ref='urlInputField' v-model="visualTabUrl" @keydown=confirmOnEnter placeholder="URL"/>
    <button class='button' @click="openVisualsTab">open</button>
  </div>
  <div v-else class="control-area">
    <template v-if="showMidiSignals">
      <MIDISignalLogger @cancel="showMidiSignals = false" @select="mapMIDIActivity"/>
    </template>
    <template v-else v-for="control, i in controlsStore.controls">
      <PadComponent v-if="control.spec.type === 'pad'" :pad="control as Pad" :key="i"/>
      <FaderComponent v-if="control.spec.type === 'fader'" :fader="control as Fader" :key="i"/>
    </template>
  </div>
</template>

<style scoped>
.tab-opener {
  margin-top: 50vh;
  transform: translateY(-50%);
  text-align: center;
  & p {
    margin: 0.5rem; 
  }
  & input, .button {
    padding: 0.5rem; 
  }
  & button {
    background-color: #fff3;
    display: inline-block;
    border-radius: 0.5rem;
    border: none; 
    color: #fff; 
    margin-left: 0.5rem; 
  }
}

.control-area {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  border: 2rem solid var(--color-background);
  box-sizing: border-box;
}

</style>
