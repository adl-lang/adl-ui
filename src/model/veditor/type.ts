// An abstract value editor
//
//    T: the type of value being edited
//    S: the type of state required for editing
//    E: the type of events
//    R: the result of the rendering operation

export interface IVEditor<T, S, E, R> {
  // The state for an empty editor
  initialState: S;

  // Construct the state for an editor with current value T
  stateFromValue(value: T): S;

  // If valid, construct a value of type T representing the current
  // value. Otherwise, return the errors.
  valueFromState(state: S): Validated<T>;

  // Returns a copy of the state, updated to reflect the given event
  update(state: S, event: E): S;

  // Render the editor's current state as a UI.
  render(state: S, onUpdate: UpdateFn<E>): R;
}

export type  Validated<T>
  = {
    isValid: false,
    errors: string[],
    // TODO
    // partialVal: Partial<T>
  }
  | {isValid: true, value: T}
  ;

export type UpdateFn<E> = (e: E) => void;

// An opaque value editor, where the internal implementation types
// need not be known. 
export type OVEditor<T,R> = IVEditor<T,unknown,unknown,R>;


export function valid<T>(value: T): Validated<T> {
  return {isValid: true, value};
}

export function invalid<T>(errors: string[]): Validated<T> {
  return {isValid: false, errors};
}

export function mapValidated<A,B>(fn: (a:A) => B, vv: Validated<A>): Validated<B> {
  if (!vv.isValid) {
    return vv;
  }
  return valid(fn(vv.value));
}