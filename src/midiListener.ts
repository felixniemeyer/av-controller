export abstract class MidiSignal {
  public abstract sourceId: string
}

export abstract class KeyMidiSignal extends MidiSignal {
  abstract channel: number
  abstract key: number
}

export class NoteOn implements MidiSignal {
  public sourceId
  constructor(
    public channel: number,
    public key: number,
    public velocity: number
  ) {
    this.sourceId = `key-${channel}-${key}`
  }
}

export class NoteOff implements MidiSignal {
  public sourceId
  constructor(
    public channel: number,
    public key: number
  ) {
    this.sourceId = `key-${this.channel}-${this.key}`
  }
}

export class ControlChange implements MidiSignal{
  public sourceId
  constructor(
    public channel: number,
    public cc: number,
    public value: number
  ) {
    this.sourceId = `cc-${this.channel}-${this.cc}`
  }
}

type Listener = (signal: MidiSignal) => void

class MidiListener {
  listeners: Listener[] = []

  constructor() {
    window.addEventListener('load', () => {
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(
          (midiAccess) => { // success
            console.log('MIDI Access success')
            const inputs = midiAccess.inputs.values();

            for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
              input.value.onmidimessage = this.handle.bind(this)
            }
          },
          () => { // failure
            console.error('MIDI Access failure')
          }
        )
      } else {
        console.error('Web MIDI API is not supported in this browser.');
      }
    })
  }

  handle (rawSignal: any) {
    const signal = this.interpret(rawSignal)
    if(signal) {
      for (const listener of this.listeners) {
        listener(signal)
      }
    }
  }

  interpret(rawSignal: any): MidiSignal | null {
    const data = rawSignal.data

    const code = data[0] >> 4
    const channel = data[0] & 0b00001111
    const key = data[1]

    if(code === 0b1000) { // note off
      return new NoteOff(channel, key)
    } else if(code === 0b1001) { // note on
      return new NoteOn(channel, key, data[2])
    } else if(code === 0b1011) { // control
      return new ControlChange(channel, key, data[2])
    } else {
      return null
    }
  }

  addListener(listener: Listener) {
    this.listeners.push(listener)
  }
}

export const midiListener = new MidiListener() // singleton
