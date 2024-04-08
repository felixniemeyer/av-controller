<script setup lang="ts">
import { defineEmits, ref, onMounted } from 'vue'

const visualTabUrl = ref('')
const urlInputField = ref(null as HTMLInputElement | null)

// vue component emit

const emits = defineEmits(['openVisualsTab'])

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
  emits('openVisualsTab', url)
}

function openVisualsTab() {
  const url = visualTabUrl.value
  emits('openVisualsTab', url)
}

const examples = import.meta.env.DEV ? {
  'localhost:5173': 'http://localhost:5173',
} : {
  'aortic rupture': 'https://gfx.aimparency.org/rupture/',
  'music-box': 'https://gfx.aimparency.org/music-box-song/'
} as Record<string, string>

</script>

<template>
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
</template>

<style scoped>

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

</style>
