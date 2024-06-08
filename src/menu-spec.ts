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
