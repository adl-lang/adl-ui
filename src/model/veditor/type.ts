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

  // Check whether the current state can produce a T. Return
  // a list of errors.
  validate(state: S): string[];

  // If valid, construct a value of type T representing the current
  // value
  valueFromState(state: S): T;

  // Returns a copy of the state, updated to reflect the given event
  update(state: S, event: E): S;

  // Render the editor's current state as a UI.
  render(state: S, onUpdate: UpdateFn<E>): R;
}

export type UpdateFn<E> = (e: E) => void;

// An opaque value editor, where the internal implementation types
// need not be known. 
export type OVEditor<T,R> = IVEditor<T,unknown,unknown,R>;
