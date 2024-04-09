<script setup lang="ts">
import { defineEmits, ref, onMounted } from 'vue'

import GalleryEntryComponent from './GalleryEntry.vue'

const visualTabUrl = ref('')
const urlInputField = ref(null as HTMLInputElement | null)

// vue component emit

const emits = defineEmits(['openVisualsTab'])

onMounted(() => {
  urlInputField.value?.focus()
})

function confirmOnEnter(e: KeyboardEvent, url?: string) {
  if(e.key === 'Enter' || e.key === ' ') {
    openVisualsTab()
  }
}

function openExample(url: string) {
  emits('openVisualsTab', url)
}

function openVisualsTab() {
  const url = visualTabUrl.value
  emits('openVisualsTab', url)
}

export interface Entry {
  artist: {
    alias: string
    profileUrl?: string
  }, 
  artwork: {
    title: string
    subtitle?: string
    description?: string
    url: string
    nftUrl?: string
  }
  screenshotUrl: string
}

const forceProd = false
const entries = (!forceProd && import.meta.env.DEV) ? [5173, 5174, 5175, 3000, 8000, 8080].map(port =>
  ({
    artist: {
      alias: 'myself', 
    }, 
    artwork: {
      title: `localhost:${port}`, 
      url: `http://localhost:${port}`,
    }, 
    screenshotUrl: './localhost.svg',
  })
) : [
  {
    artist: {
      alias: 'fairlix', 
      profileUrl: 'https://linktr.ee/fairlix', 
    },
    artwork: {
      title: 'music box', 
      description: 'Balls in a square make sounds when colliding with the walls. Controls allow to change musical elements like the chord progression and bass pattern.', 
      url: 'https://gfx.aimparency.org/music-box-nft/',
      nftUrl: 'https://collector.sh/fairlix/musicbox',
    },
    screenshotUrl: './musicbox.png',
  },
  {
    artist: {
      alias: 'fairlix',
      profileUrl: 'https://linktr.ee/fairlix', 
    },
    artwork: {
      title: 'aortic rupture', 
      subtitle: 'raymarching extruded ant particle paths', 
      description: 'The white structure in the foreground is the "pheromone map" of ant particles. Using blur and log a 2D distance map is created from that, which is extruded and twisted into the 3D object (aorta) in the background.', 
      url: 'https://gfx.aimparency.org/rupture/',
    },
    screenshotUrl: './rupture.png',
  },
  {
    artist: {
      alias: 'fairlix', 
      profileUrl: 'https://linktr.ee/fairlix', 
    },
    artwork: {
      title: 'spacies', 
      subtitle: 'cities in space',
      description: 'generative 3d objects and colorful shaders', 
      url: 'https://gfx.aimparency.org/rupture/spacies-av-controlled/',
      nftUrl: 'https://opensea.io/collection/spacies', 
    },
    screenshotUrl: './spacies.png',
  },
] as Entry[]

</script>

<template>
  <div>
    <h1>av controller gallery</h1>
    
    <p> 
      Enter any URL of a web page with an artwork that exposes 
      <a href='https://github.com/felixniemeyer/av-controls' target="_blank">av controls</a>
      manually: 
    </p>
    <input type="text" ref='urlInputField' v-model="visualTabUrl" @keydown=confirmOnEnter placeholder="URL"/>
    <button @click="openVisualsTab">open in separate tab</button>
    <p>
      Or click a screenshot to open the artwork in a separate tab. <br>
    </p>
    <p>
      The gallery tab will then display the controls. 
    </p>
    <div class=examples >
      <GalleryEntryComponent
         v-for="entry in entries" 
         :entry="entry"
         @openTab="openExample(entry.artwork.url)" 
         />
    </div>
  </div>
</template>

<style scoped>

</style>
