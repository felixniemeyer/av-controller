<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close', 'fileUploaded']);

const fileInputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (fileInputRef.value) {
    fileInputRef.value.focus();
  }
});

const selectedFile = ref<File | null>(null);

function handleClose() {
  emit('close');
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    emit('fileUploaded', selectedFile.value);
  }
}
</script>

<template>
  <div class="popup">
    <div class="popup-content" @keydown.esc="handleClose">
      <h3>{{ props.title }}</h3>
      <input 
        ref="fileInputRef" 
        type="file" 
        @change="handleFileUpload" 
        class="fileInput"
      />
      <div class="buttons">
        <button class="button" @click="handleClose">Close</button>
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

.fileInput {
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
