import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Control, Fader, Pad } from '../controls'
import { midiListener, ControlChange, NoteOn, MidiSignal, KeyMidiSignal, NoteOff} from '@/midiListener'

export abstract class Mapping {
  abstract handleSignal(signal: MidiSignal) : void
}

export class ControllerToFaderMapping extends Mapping {
  constructor(
    public controller: Fader,
  ) {
    super()
    controller.addMapping(this)
  }
  handleSignal(signal: MidiSignal) {
    if(signal instanceof ControlChange) {
      this.controller.setNormValue(signal.value / 127)
    }
  }
}

export class KeyToPadMapping extends Mapping {
  constructor(
    public controller: Pad,
  ) {
    super()
    controller.addMapping(this)
  }
  handleSignal(signal: MidiSignal) {
    if(signal instanceof NoteOn) {
      this.controller.press(signal.velocity / 127)
    } else if (signal instanceof NoteOff) {
      this.controller.release()
    }
  }
}

export interface MidiSource {
  id: string,
  type: 'key' | 'cc'
}

export const useMappingsStore = defineStore('mappings', () => {
  const mappings = ref({} as {[id: string]: Mapping})

  const midiSourceForMapping = ref(undefined as (undefined | MidiSource))
  const removeMapping = ref(false)

  function maybeMapTo(controller: Control) {
    if(removeMapping.value) {
      const removedMappings = controller.removeMappingsAndList()
      // find mapping in mappings and remove it
      for(const sourceId in mappings.value) {
        const mapping = mappings.value[sourceId]
        if(removedMappings.includes(mapping)) {
          delete mappings.value[sourceId]
        }
      }
    } else if(midiSourceForMapping.value !== undefined) {
      let c: Mapping | undefined
      if(midiSourceForMapping.value.type == 'cc') {
        if(controller instanceof Fader) {
          c = new ControllerToFaderMapping(controller)
        } else {
          console.error('control change to non-fader not implemented')
        }
      } else if(midiSourceForMapping.value.type == 'key') {
        if(controller instanceof Pad) {
          c = new KeyToPadMapping(controller)
        } else {
          console.error('note on to non-pad not implemented')
        }
      }
      if(c) {
        mappings.value[midiSourceForMapping.value!.id] = c
        midiSourceForMapping.value = undefined
      }
    }
  }

  midiListener.addListener((signal) => {
    if(signal.sourceId() in mappings.value) {
      mappings.value[signal.sourceId()].handleSignal(signal)
    }
  })

  return {
    mappings,
    midiSourceForMapping,
    removeMapping,
    maybeMapTo
  }
})
