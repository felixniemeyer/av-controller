import { 
  MeterSpec, 
  CakeSpec,
} from 'av-controls'

export abstract class Meter {
  public abstract spec: MeterSpec
  abstract update(payload: any) : void
}

export class Cake extends Meter {
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

