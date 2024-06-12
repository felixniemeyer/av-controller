<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
    default: 'Enter text here...',
  }
});


// focus on mounted
const inputRef = ref(null as HTMLInputElement | null)
onMounted(() => {
  console.log(inputRef); 
  inputRef.value!.focus()
}) 

const emit = defineEmits(['close', 'submit']);

const inputText = ref('');

function handleClose() {
  emit('close');
}

function handleSubmit() {
  emit('submit', inputText.value);
}
</script>

<template>
  <div class="popup">
    <div class="popup-content"
      @keydown.esc='handleClose'
      >
      <h3>{{ props.title }}</h3>
      <input 
        v-model="inputText" 
        ref='inputRef'
        :placeholder="props.placeholder" 
        @keydown.enter='handleSubmit'
        class="textInput" 
        type="text"
      />
      <div class="buttons">
        <button class="button" @click="handleClose">Close</button>
        <button class="button" @click="handleSubmit">Submit</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-content {
  box-shadow: 0 0 3rem rgba(0, 0, 0, 1);
  background-color: #333; 
  padding: 2rem;
  border: 0.5rem solid #444;
  border-radius: 1rem;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.2);
  width: 300px;
  max-width: 100%;
  text-align: center;
}

.textInput {
  width: 100%;
  padding: 0.5rem;
  margin: 1rem 0;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}

.button {
  padding: 0.5rem 1rem;
}

</style>
