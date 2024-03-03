import { Mapping } from './stores/mappings'

import { Specs } from 'av-controls'

type OnUpdateCallback = (payload: any) => void
type OnTouchCallback = (c: Control) => void

export abstract class Control {
  public abstract spec: Specs.ControlSpec

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
}

export class Fader extends Control {
  value: number

  constructor(
    public spec: Specs.FaderSpec,
	) {
    super()
    this.value = spec.initialValue
  }

  setValue(value: number) {
    this.onTouch(this)
    this.value = value
    this.onUpdate(value)
  }

  setNormValue(normValue: number) {
    const mapped = normValue * (this.spec.max - this.spec.min) + this.spec.min
    this.setValue(mapped)
  }
}

type KeyEvent = {press: true, value: number} | {press: false}

export class Pad extends Control {
  pressed: boolean = false

  constructor(
    public spec: Specs.PadSpec,
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
    public spec: Specs.SwitchSpec,
  ) {
    super()
    this.on = spec.initiallyOn
  }

  touchDown() {
    this.onTouch(this)
    this.on = !this.on
    this.onUpdate(this.on)
  }
}

export class Selector extends Control {
  index: number

  constructor(
    public spec: Specs.SelectorSpec,
  ) {
    super()
    this.index = spec.initialIndex
  }

  select(value: number) {
    this.onTouch(this)
    this.index = value
    this.onUpdate(value)
  }
}

export class ConfirmButton extends Control {
  awaitingConfirmation: boolean = false

  constructor(
    public spec: Specs.PadSpec,
  ) {
    super()
  }

  press() {
    if(this.awaitingConfirmation) {
      this.onUpdate(true)
      this.awaitingConfirmation = false
    } else {
      this.awaitingConfirmation = true
      this.onUpdate(false)
    }
  }

  cancel() {
    this.awaitingConfirmation = false
  }
}

export class Label extends Control {
  constructor(
    public spec: Specs.LabelSpec,
  ) {
    super()
  }
}
