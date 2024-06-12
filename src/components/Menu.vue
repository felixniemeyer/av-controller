<script setup lang="ts">
import { ref } from 'vue';

import { type MenuSpec, type MenuItemSpec } from '@/menu-spec';

const props = defineProps({
  menu: {
    type: Object as () => MenuSpec,
    required: true,
  }, 
});

const emit = defineEmits(['back', 'action']);

const activeSubmenu = ref(null as MenuSpec | null);

function handleClick(item: MenuItemSpec) {
  if (item.submenu) {
    activeSubmenu.value = item.submenu;
  } else if (item.action) {
    emit('action', item.action);
  }
}

function goBack() {
  console.log('going back') 
  emit('back');
}

function performAction(action: any) {
  emit('action', action);
}
</script>

<template>
  <Menu 
    v-if=activeSubmenu 
    :menu="activeSubmenu" 
    @back="activeSubmenu = null" 
    @action="performAction" />
  <div v-else class="popup">
    <div class="menu">
      <h3>{{ props.menu.name }}</h3>
      <p class="description">{{ props.menu.description }}</p>
      <button class="menuItem exitButton" @click="goBack">Back</button>
      <button class=menuItem tabindex="0" @click="handleClick(item)" v-for="(item, index) in props.menu.items" :key="index"
                                                                    style="{backgroundColor: item.color}">
          {{ item.name }} 
      </button>
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
}
.menu {
  position: absolute;
  /* center the menu */
  top: 3rem; 
  left: 3rem; 
  right: 3rem;
  bottom: 3rem; 
  box-shadow: 0 0 3rem rgba(0, 0, 0, 1);
  background-color: #333; 
  padding: 2rem;
  box-sizing: border-box;
  border-radius: 1rem; 
  border: 0.5rem solid #444;
  overflow-y: auto;
}
.description {
  color: #bbb;
}
.menuItem {
  display: inline-block;
  width: 10rem; 
  height: 10rem;
  text-align: center;
  vertical-align: middle; 
}
.exitButton {
  background-color: #f88;
}
</style>
