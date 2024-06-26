<script setup lang=ts>
import { computed, ref } from 'vue'

// for color manipulation
import { Letterbox } from '@/controls'

import MappingsIndicator from '../MappingsIndicator.vue'

// vue
const props = defineProps({
  letterbox: {
    type: Object as () => Letterbox,
    required: true,
  },
})

const basisStyle = computed(() => {
  const spec = props.letterbox.spec
  return {
    backgroundColor: spec.color,
    boxShadow: `0 0 2rem -0.5rem ${spec.color}`,
    borderColor: spec.color,
  }
})

const inputRef = ref<HTMLInputElement | null>(null)
const lastLetter = ref<string>('A')

function onUpdate() {
  const v = inputRef.value!.value
  props.letterbox.send(v)
  lastLetter.value = v.slice(-1)
  inputRef.value!.value = ''
}

</script>

<template>
  <div
    class="basis"
    :style=basisStyle
    :tabindex="0"
    >
    <div class="container" >
      <input 
        ref="inputRef"
        type="text"
        @input="onUpdate"
      />
      <div class="lastletter">
        {{ lastLetter }}
      </div>
    </div>
  </div>
  <div class="label-top" >
    {{ props.letterbox.spec.name }}
  </div>
  <MappingsIndicator :mappings="props.letterbox.mappings"/>
</template>

<style scoped>
@import './control-styles.css';

.basis {
  cursor: default;


  & .container{
    position: relative;
    margin-top: 1.1rem; 
    height: calc(100% - 1.1rem);
    text-align: center;
    width: calc(100%);
    font-size: 2rem; 
    overflow: hidden;

    & input {
      position: absolute;
      top: 0; 
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #0008; 
      border: none; 
      outline: none;
      color: white;
      font-size: 2rem;
      text-align: center;
      box-sizing: border-box;
      margin: 0;
      caret-color: transparent;
      &:focus {
        border: 0.5rem solid white; 
      }
    }

    & .lastletter {
      position: absolute; 
      color: #fff8; 
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      vertical-align: middle;
      font-size: 7rem;
      text-align: center;
      font-weight: bold;
      pointer-events: none;
    }
  }
}
</style>
