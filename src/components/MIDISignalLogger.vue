<script setup lang=ts>
import { ref, computed, onMounted } from 'vue'
import { midiListener, MidiSignal, NoteOn, NoteOff, ControlChange, KeyMidiSignal } from '@/midiListener'
import type { MidiSource } from '@/stores/mappings'

const windowSize = 10000
let lastCleanup = 0

const startTime = ref(Date.now())
const endTime = ref(Date.now() + windowSize)
const width = ref(1)

const canvas = ref(null as HTMLCanvasElement | null)

function tryResize() {
  if(canvas.value) {
    width.value = canvas.value.clientWidth
  }
}
window.addEventListener('resize', () => {
  tryResize()
  // get the clientWidth of the canvas
})

const normalizeFactor = computed(() => 1 / (endTime.value - startTime.value) * width.value)

interface Activity {
  on: number
  off: number
}

abstract class MidiSignalRecord {
  public activities: Activity[] = []

  public abstract name: string

  updateEndTime(time: number) {
    if(time > endTime.value) {
      endTime.value = time
    }
    if(startTime.value < time - windowSize) {
      startTime.value = time - windowSize
    }
    if(startTime.value > lastCleanup + windowSize / 2) {
      lastCleanup = startTime.value
      for(const id in recordsStore.value) {
        const control = recordsStore.value[id]
        control.activities = control.activities.filter(activity => activity.off > startTime.value)
      }
    }
  }
}

const touchLenght = 100
class ControllerSignalRecord extends MidiSignalRecord {
  constructor(
    public name: string,
  ) {
    super()
  }

  touch() {
    const time = Date.now()
    const recentActivity = this.activities[this.activities.length - 1]
    if(recentActivity && time - recentActivity.off < touchLenght) {
      recentActivity.off = time
    } else {
      this.activities.push({
        on: time,
        off: time + touchLenght
      })
    }
    this.updateEndTime(time + touchLenght)
  }
}

class KeySignalRecord extends MidiSignalRecord {
  private pressed: number | undefined

  constructor(
    public name: string
  ) {
    super()
  }

  on() {
    this.pressed = Date.now()
  }

  off() {
    const time = Date.now()
    this.activities.push({
      on: this.pressed ?? startTime.value,
      off: time
    })
    this.pressed = undefined
    this.updateEndTime(time)
  }
}

const recordsStore = ref({} as {[key: string]: MidiSignalRecord})

onMounted(() => {
  midiListener.addListener(onMIDIMessage)
  startTime.value = Date.now()
  tryResize()
})

function getOrCreateKeySignalRecord(s: KeyMidiSignal) {
  let control = recordsStore.value[s.sourceId()] as KeySignalRecord | undefined
  if(!control) {
    control = new KeySignalRecord(`Note ${s.key}, Channel ${s.channel}`)
    recordsStore.value[s.sourceId()] = control
  }
  return control
}

function onMIDIMessage(s: MidiSignal) {
  if(s instanceof NoteOn) {
    getOrCreateKeySignalRecord(s).on()
  } else if(s instanceof NoteOff) {
    getOrCreateKeySignalRecord(s).off()
  } else if(s instanceof ControlChange) {
    let control = recordsStore.value[s.sourceId()] as ControllerSignalRecord | undefined
    if(!control) {
      control = new ControllerSignalRecord(`CC ${s.cc}, Channel ${s.channel}`)
      recordsStore.value[s.sourceId()] = control
    }
    control.touch()
  }
}

const emit = defineEmits(['select', 'cancel'])

const selected = ref(null as number | null)

function tap(record: MidiSignalRecord, sourceId: string, i: number) {
  if(selected.value === i) {
    const midiSource: MidiSource = {
      id: sourceId,
      type: record instanceof KeySignalRecord ? 'key' : 'cc'
    }
    emit('select', midiSource)
  } else {
    selected.value = i
  }
}

const lineHeight = 35
const lines = computed(() => Object.keys(recordsStore.value).length)

function laneY(i: number, offset: number) {
  let shift = 0
  if(selected.value !== null && i > selected.value) {
    shift = 1
  }
  return (i + shift) * lineHeight + laneHeight(i) * offset
}

function laneHeight(i: number) {
  return i === selected.value ? lineHeight * 2 : lineHeight
}

</script>

<template>
  <div class=panel width='100%'>
    <div class="button cancel" @click="emit('cancel')">cancel</div>
  </div>
  <svg class=canvas ref=canvas width="100%" :height="lineHeight * (lines + (selected !== null ? 1 : 0))">
    <rect v-for="record, id, i in recordsStore" :key="id" class='lane-background' :class='{selected: i==selected}' :y="laneY(i, 0)" :width="width" :height="laneHeight(i)" @click="tap(record, String(id), i)" />
    <g v-for="control, id, i in recordsStore" :key="id">
      <rect class='lane-activity' v-for="activity, j in control.activities" :key="j" :x="normalizeFactor * (activity.on - startTime)" :y="laneY(i, 0.2)" :width="normalizeFactor * (activity.off - activity.on)" :height="0.6 * laneHeight(i)" />
      <text class='lane-label' :x="10" :y="laneY(i, 0.45)">{{ control.name }}</text>
    </g>
  </svg>
</template>

<style scoped>

.panel {
  margin-bottom: 1rem;
  position: relative;
  width: 100%;
  height: 10rem;
}

.lane-background {
  fill: #222;
  rx: 5;
  ry: 5;
  cursor: pointer;
}

.lane-background:nth-child(even) {
  fill: #333;
}

.lane-background:hover {
  fill: #777;
}

.lane-background.selected {
  fill: #b50;
}

.lane-label {
  fill: #fff;
  text-anchor: left;
  baseline-shift: -50%;
  pointer-events: none;
}

.lane-activity {
  fill: #8cf;
  pointer-events: none;
  rx: 5;
  ry: 5;
}

.panel .button{
  display: inline-block;
  width: 10rem;
  height: 10rem;
  line-height: 10rem;
  border-radius: 1rem;
  text-align: center;
  background-color: #444;
  font-weight: bold;
  box-shadow: 0 0 2rem #000;
}
</style>
