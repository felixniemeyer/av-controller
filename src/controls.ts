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
  GroupSpec,
  TabbedPagesSpec,
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
    return 777 + this.spec.x * 101 + this.spec.y
  }

  addMapping(mapping: Mapping) {
    this.mappings.push(mapping)
  }

  removeMappings() {
    this.mappings = []
  }

  update(_payload: any, _id: ControlId = []) {
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
    if(typeof payload === 'number') {
      this.value = payload
    }
  }
}

