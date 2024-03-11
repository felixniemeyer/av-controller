import type { ControlSpec } from 'av-controls'
import { computed } from 'vue'

export function makeBasisStyle(spec: ControlSpec) {
  return computed(() => {
    const color = spec.color
    return {
      backgroundColor: color, 
      boxShadow: `0 0 2rem -0.5rem ${color}`,
      borderColor: color,
    }
  })
}

