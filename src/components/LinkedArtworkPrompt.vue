<script setup lang="ts">

const props = defineProps<{
  url: string
}>()

const emits = defineEmits([
  'confirm', 
  'cancel'
])

</script>

<template>
  <div class="prompt">
    <h1>Open Linked Artwork</h1>
    <p>
      You opened a link that contains an artwork that should be opened and controlled. 
      The url of the artwork is <a @click="props.url"> {{ url }} </a>
    </p>
    <p>
      Do you want to proceed? This will open the artwork in a new tab and display the controls in the current tab. 
    </p>
    <button @click="emits('cancel')">Go to Gallery</button>
    <button @click="emits('confirm')">Open Artwork</button>
  </div>
</template>

<style scoped>
/* put prompt into center of screen */
.prompt {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

</style>
