<script setup lang="ts">
import { ref } from 'vue'

import GalleryEntryComponent from './GalleryEntry.vue'

const visualTabUrl = ref('')
const urlInputField = ref(null as HTMLInputElement | null)

// vue component emit

const emits = defineEmits(['openVisualsTab'])

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
      title: 'stacks', 
      description: 'Stacked disks. Can turn into flowers and gears.', 
      url: 'https://gfx.aimparency.org/stacks/',
    },
    screenshotUrl: './stacks.jpg',
  },
  {
    artist: {
      alias: 'fairlix', 
      profileUrl: 'https://linktr.ee/fairlix', 
    },
    artwork: {
      title: 'music box', 
      description: 'Balls in a square make sounds when colliding with the walls. Controls allow to change musical elements like the chord progression and bass pattern.', 
      url: 'https://gfx.aimparency.org/music-box-nft/',
    },
    screenshotUrl: './musicbox.jpg',
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
    screenshotUrl: './rupture.jpg',
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
      nftUrl: 'https://gfx.aimparency.org/spacies/', 
    },
    screenshotUrl: './spacies.jpg',
  },
] as Entry[]

</script>

<template>
  <div class="gallery">
    <h1>av controller gallery</h1>
    <p>
    Fill out <a href='https://docs.google.com/forms/d/e/1FAIpQLSdYC4PtUV1GckbhWMo1u11YqGI--s6ncMxrVF87sOIVVP2gqA/viewform'>this form</a> to have your av-controllable artwork added here.
    </p>
    
    <p>
      Click an artwork to open it in a separate tab. <br>
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
    <p>
      Create a controller for your artwork using
      <a href='https://github.com/felixniemeyer/av-controls' target="_blank">av controls</a>.
    </p>
    <p> 
      Open a av-controllable artwork manually:
    </p>
    <p>
    <input type="text" ref='urlInputField' v-model="visualTabUrl" @keydown=confirmOnEnter placeholder="URL"/>
    </p>
    <p>
    <button @click="openVisualsTab">open in separate tab</button>
    </p>
    <div class=footer>
      <p> 
      </p>
    </div>
  </div>
</template>

<style scoped>

.examples {
  margin: 3rem 0rem;
}

.gallery {
  margin: 10rem auto;
  padding: 0.5rem; 
  max-width: 100vh;
  display: block;
  text-align: center;
}

.gallery p {
  margin: 1rem 2rem;
}

.footer {
  padding-top: 10rem; 
}

.footer p {
  margin: 0.5rem; 
}

/* {
  outline: 1px solid red;
} /**/

</style>
