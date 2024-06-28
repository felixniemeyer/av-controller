import type { ControlId } from 'av-controls/src/messages'

import { 
  ControlSpec, 
  FaderSpec,
  PadSpec,
  SwitchSpec,
  SelectorSpec,
  ConfirmSwitchSpec,
  LabelSpec,
  ConfirmButtonSpec,
  CakeSpec,
  PresetButtonSpec, 
  GroupSpec,
  TabbedPagesSpec,
  LetterboxSpec,
} from 'av-controls'
import type { Mapping } from './mappings'

type OnUpdateCallback = (payload: any) => void
type OnTouchCallback = () => void

export abstract class Control {
  public abstract spec: ControlSpec

  public mappings: Mapping[] = []

  public onUpdate: OnUpdateCallback = () => {}
  public onTouch: OnTouchCallback = () => {}

  constructor(
  ) { }

  tabIndex() {
    return 0
  }

  addMapping(mapping: Mapping) {
    this.mappings.push(mapping)
  }

  removeMappings() {
    this.mappings = []
  }

  update(_payload: any, _id: ControlId = []) {
  }

  getState() : any {
    return undefined
  }

  setState(_state: any) {
  }
}
export type ControlsDict = {[id: string]: Control}

export class Group extends Control {
  constructor(
    public spec: GroupSpec,
    public controls: ControlsDict,
  ) {
    super()
  }

  update(payload: any, id: ControlId) {
    if(id.length > 0) {
      this.controls[id[0]].update(payload)
    } else {
      // updates are for the group itself
    }
  }
}

export class TabbedPages extends Control {
  public activePage: string

  constructor(
    public spec: TabbedPagesSpec,
    public pages: {[pageName: string]: ControlsDict}, 
  ) {
    super()
    this.activePage = Object.keys(pages)[0]
  }

  update(payload: any, id: ControlId) {
    if(id.length > 1) {
      const page = this.pages[id[0]]
      page[id[1]].update(payload, id.slice(2))
    } else if (id.length === 1){
      // update for the page (?)
    } else {
      // updates are for the group itself
    }
  }
}

export class Fader extends Control {
  value: number

  constructor(
    public spec: FaderSpec,
	) {
    super()
    this.value = spec.initialValue
  }

  setValue(value: number) {
    this.value = value
    this.onUpdate(value)
  }

  setNormValue(normValue: number) {
    const mapped = normValue * (this.spec.max - this.spec.min) + this.spec.min
    this.setValue(mapped)
  }

  getNormValue() {
    return (this.value - this.spec.min) / (this.spec.max - this.spec.min)
  }

  getState() {
    return this.value
  }

  setState(state: number) {
    this.setValue(state)
  }
}

type PadEvent = {press: true, velocity: number} | {press: false}

export class Pad extends Control {
  pressed: boolean = false

  constructor(
    public spec: PadSpec,
  ) {
    super()
  }

  press(v: number) {
    this.pressed = true
    this.onUpdate({press: true, velocity: v} as PadEvent)
  }

  release() {
    this.pressed = false
    this.onUpdate({press: false} as PadEvent)
  }
}

export class Switch extends Control {
  on: boolean

  constructor(
    public spec: SwitchSpec,
  ) {
    super()
    this.on = spec.initiallyOn
  }

  toggle() {
    this.on = !this.on
    this.onUpdate(this.on)
  }

  getState() {
    return this.on
  }

  setState(state: boolean) {
    this.on = state
  }
}

export class Selector extends Control {
  index: number

  constructor(
    public spec: SelectorSpec,
  ) {
    super()
    this.index = spec.initialIndex
  }

  select(value: number) {
    this.index = value
    this.onUpdate(value)
  }

  increment() {
    this.index = (this.index + 1) % this.spec.options.length
  }

  decrement() {
    this.index = (this.index - 1 + this.spec.options.length) % this.spec.options.length
  }

  getState() {
    return this.index
  }

  setState(state: number) {
    this.select(state)
  }
}

export class ConfirmButton extends Control {
  awaitingConfirmation: boolean = false

  constructor(
    public spec: ConfirmButtonSpec,
  ) {
    super()
  }

  private defuseTimer? : number
  press() {
    if(this.defuseTimer !== undefined) {
      clearTimeout(this.defuseTimer)
      this.defuseTimer = undefined
    }
    if(this.awaitingConfirmation) {
      this.onUpdate(true)
      this.awaitingConfirmation = false
    } else {
      this.awaitingConfirmation = true
      this.onUpdate(false)
      this.defuseTimer = setTimeout(() => {
        this.awaitingConfirmation = false
      }, 4000)
    }
  }

  cancel() {
    this.awaitingConfirmation = false
  }
}

export class ConfirmSwitch extends Control {
  awaitingConfirmation: boolean = false
  on: boolean 

  constructor(
    public spec: ConfirmSwitchSpec,
  ) {
    super()
    this.on = spec.initiallyOn
  }

  private defuseTimer? : number
  press() {
    if(this.defuseTimer !== undefined) {
      clearTimeout(this.defuseTimer)
      this.defuseTimer = undefined
    }
    if(this.awaitingConfirmation) {
      this.awaitingConfirmation = false
      this.on = !this.on
      this.onUpdate(this.on)
    } else {
      this.awaitingConfirmation = true
      this.defuseTimer = setTimeout(() => {
        this.awaitingConfirmation = false
      }, 4000)
    }
  }

  cancel() {
    this.awaitingConfirmation = false
  }
}

export class Label extends Control {
  constructor(
    public spec: LabelSpec,
  ) {
    super()
  }
}

export class Cake extends Control {
  value: number

  constructor(
    public spec: CakeSpec,
	) {
    super()
    this.value = spec.initialValue
  }

  update(payload: number) {
    this.value = payload
  }
}

type Preset = any
type Stencil = any

export class PresetButton extends Control {
  private presets: {[id: string]: any} = {}

  private lastPresetLoaded: string | undefined

  constructor(
    public spec: PresetButtonSpec,
    private gatherPreset: (stencil: Stencil) => Preset,
    private applyPreset: (preset: Preset) => Stencil,
  ) {
    super()
  }
  
  update(payload: any) {
    if(payload.action == 'next') {
      this.nextPresetInRow()
    } else if(payload.action == 'random') {
      this.randomPreset()
    }
  }

  save(id: string) {
    const preset = this.gatherPreset(this.spec.stencil)
    this.presets[id] = preset
  }

  load(id: string) {
    const preset = this.presets[id]
    console.log('shall load', id)
    if(preset !== undefined) {
      this.applyPreset(preset)
      this.lastPresetLoaded = id
    }
  }

  exportAll() {
    const blob = new Blob([JSON.stringify(this.presets)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const filename = this.spec.name.replace(' ', '-')
    a.download = `${filename}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  importAll(file: File) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const presets = JSON.parse(event.target!.result as string)
      for(const id in presets) {
        this.presets[id] = presets[id]
      }
    }
    reader.readAsText(file)
  }

  delete(id: string) {
    delete this.presets[id]
  }

  nextPresetInRow() {
    const presetIds = Object.keys(this.presets)
    if(presetIds.length > 0) {
      let i = 0
      if(this.lastPresetLoaded !== undefined) {
        i = (presetIds.indexOf(this.lastPresetLoaded) + 1) % presetIds.length
      } 
      const nextPresetId = presetIds[i]
      this.load(nextPresetId)
    }
  }

  randomPreset() {
    const presetIds = Object.keys(this.presets)
    if(presetIds.length > 0) {
      let i 
      if(this.lastPresetLoaded !== undefined) { 
        // don't "switch" to the same id
        i = Math.floor(Math.random() * (presetIds.length - 1))
        console.log('chose i from', presetIds.length - 1)
        const prevIndex = presetIds.indexOf(this.lastPresetLoaded)
        if(i >= prevIndex) {
          i += 1 
        }
      } else {
        i = Math.floor(Math.random() * presetIds.length)
      }
      const nextPresetId = presetIds[i]
      this.load(nextPresetId)
    }
  }

  getNames() {
    return Object.keys(this.presets)
  }
}

export class Letterbox extends Control {

  constructor(
    public spec: LetterboxSpec, 
  ) {
    super()
  }

  send(message: string) {
    this.onUpdate(message)
  }
}
