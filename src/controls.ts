import { Mapping } from './stores/mappings'

import { 
  ControlSpec, 
  GroupSpec, 
  FaderSpec,
  PadSpec,
  SwitchSpec,
  SelectorSpec,
  ConfirmSwitchSpec,
  LabelSpec,
  ConfirmButtonSpec,
  CakeSpec,
} from 'av-controls'

type OnUpdateCallback = (payload: any) => void
type OnTouchCallback = (c: Control) => void

export abstract class Control {
  public abstract spec: ControlSpec

  public onUpdate: OnUpdateCallback = () => {}
  public onTouch: OnTouchCallback = () => {}
  public mappings: Mapping[] = []

  constructor(
  ) {}

  addMapping(m: Mapping) {
    this.mappings.push(m)
  }

  removeMapping(m: Mapping) {
    this.mappings = this.mappings.filter((mapping) => mapping !== m)
  }

  removeMappingsAndList() {
    const mappings = this.mappings
    this.mappings = []
    return mappings
  }

  tabIndex() {
    return 777 + this.spec.x * 101 + this.spec.y
  }

  update(_payload: any) {
    // implement for meters
  }
}
export type ControlsDict = {[id: string]: Control}

export class Group extends Control {
  constructor(
    public spec: GroupSpec,
  ) {
    super()
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

  drag(value: number) {
    this.onTouch(this)
    this.setValue(value)
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

type KeyEvent = {press: true, value: number} | {press: false}

export class Pad extends Control {
  pressed: boolean = false

  constructor(
    public spec: PadSpec,
  ) {
    super()
  }

  press(v: number) {
    this.onTouch(this)
    this.pressed = true
    this.onUpdate({press: true, value: v} as KeyEvent)
  }

  release() {
    this.pressed = false
    this.onUpdate({press: false} as KeyEvent)
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

  touchDown() {
    this.onTouch(this)
    this.toggle() 
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
    this.onTouch(this)
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

