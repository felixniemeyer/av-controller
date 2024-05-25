<script setup lang="ts">
import { computed } from 'vue';
import { type Entry } from './Gallery.vue'

const props = defineProps<{
  entry: Entry
}>()

const emits = defineEmits(['openTab'])

function confirmOnEnter(e: KeyboardEvent) {
  if(e.key === 'Enter' || e.key === ' ') {
    emits('openTab')
    e.stopPropagation()
    e.preventDefault()
  }
}

// computed
const linkName = computed(() => {
  return new URL(props.entry.artist.profileUrl!).hostname
})

const nftLinkName = computed(() => {
  return new URL(props.entry.artwork.nftUrl!).hostname
})

</script>

<template>
  <div class="entry">
    <div class="page info">
      <h2>
        {{ props.entry.artwork.title }}
      </h2>
      <p> 
        by {{ props.entry.artist.alias }}
        <template v-if="props.entry.artist.profileUrl">
          (
          <a v-if="props.entry.artist.profileUrl" :href="props.entry.artist.profileUrl">
            {{ linkName }}
          </a>
          )
        </template>
      </p>
      <h3 v-if="props.entry.artwork.subtitle">
        {{ props.entry.artwork.subtitle }}
      </h3>
      <p v-if="props.entry.artwork.description">
        {{ props.entry.artwork.description }}
      </p>
      <p v-if="props.entry.artwork.nftUrl">
        NFTs on 
        <a :href="props.entry.artwork.nftUrl">
          {{ nftLinkName }}
        </a>
      </p>
    </div>
    <div 
      tabindex=0 
      @keydown=confirmOnEnter 
      @click="emits('openTab')"
      class="page screenshot">
      <img v-if="props.entry.screenshotUrl" :src="props.entry.screenshotUrl" />
    </div>
  </div>
</template>


<style scoped>

.entry {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 1rem;
}

.page {
  margin: 1rem; 
}

.info {
  width: calc(50% - 2rem);
  text-align: right;
}

.screenshot {
  text-align: left;
  max-width: 40%;
  min-width: 4rem; 
  min-height: 4rem;
  cursor: pointer;
}

.screenshot:focus {
  outline: 1px solid #fff8;
}
.screenshot img {
  max-width: 100%;
  max-height: 100%;
  pointer-events: none;
}

</style>
