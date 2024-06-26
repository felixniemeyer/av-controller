import { ref } from 'vue'

interface MenuSpec {
  name: string
  description: string
  items: MenuItemSpec[]
}

interface MenuItemSpec {
  name: string
  action?: any 
  submenu?: MenuSpec
  color?: string
}

export type { MenuSpec, MenuItemSpec }

export const menu = ref(null as (null | MenuSpec))

export const textInputHandler = ref(null as null | ((value: string) => void))
export const textInputTitle = ref('')
export const textInputPlaceholder = ref('') 

export const fileInputHandler = ref(null as null | ((file: File) => void))
export const fileInputTitle = ref('')
export const fileInputDescription = ref('')

export const confirmHandler = ref(null as null | ((confirmed: boolean) => void))
export const confirmTitle = ref('')
export const confirmMessage = ref('')

export const menuActionHandler = ref(undefined as undefined | ((...args: any[]) => any))

