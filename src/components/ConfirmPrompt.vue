<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['cancel', 'confirm']);

function handleCancel() {
  emit('cancel');
}

function handleConfirm() {
  emit('confirm');
}
</script>

<template>
  <div class="popup">
    <div class="popup-content" @keydown.esc="handleCancel">
      <h3>{{ props.title }}</h3>
      <p>{{ props.description }}</p>
      <div class="buttons">
        <button class="button cancel" @click="handleCancel">Cancel</button>
        <button class="button confirm" @click="handleConfirm">Confirm</button>
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

.buttons {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.button {
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 2rem;
}

.button.cancel {
  background-color: #ff6347; /* Tomato */
}

.button.confirm {
  background-color: #32cd32; /* LimeGreen */
}

.button:hover {
  background-color: #666;
}
</style>
