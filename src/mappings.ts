import { Control, Fader, Pad } from './controls'
import { ControlChange, NoteOn, MidiSignal, NoteOff} from '@/midiListener'

export interface MidiSource {
  midiSourceId: string,
  type: 'key' | 'cc'
}

export abstract class Mapping {
  public abstract control: Control
  abstract handleSignal(signal: MidiSignal) : void
}

export class CCToFaderMapping extends Mapping {
  constructor(
    public control: Fader,
  ) {
    super()
  }
  handleSignal(signal: MidiSignal) {
    if(signal instanceof ControlChange) {
      this.control.setNormValue(signal.value / 127)
    }
  }
}

export class KeyToPadMapping extends Mapping {
  constructor(
    public control: Pad,
  ) {
    super()
  }
  handleSignal(signal: MidiSignal) {
    if(signal instanceof NoteOn) {
      this.control.press(signal.velocity / 127)
    } else if (signal instanceof NoteOff) {
      this.control.release()
    }
  }
}
