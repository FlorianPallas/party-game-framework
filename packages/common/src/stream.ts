import { Observable, Observer, map } from "rxjs";

export class Stream<TIn, TOut = TIn> {
  constructor(
    private channels: { input: Observable<TIn>; output: Observer<TOut> }
  ) {}

  get input() {
    return this.channels.input;
  }

  get output() {
    return this.channels.output;
  }

  map<UIn, UOut = UIn>(mappers: {
    input: (data: TIn) => UIn;
    output: (data: UOut) => TOut;
  }) {
    return new Stream<UIn, UOut>({
      input: this.channels.input.pipe(map(mappers.input)),
      output: {
        ...this.channels.output,
        next: (value) => this.channels.output.next(mappers.output(value)),
      },
    });
  }
}
