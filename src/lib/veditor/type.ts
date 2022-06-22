// An abstract value editor
//
//    T: the type of value being edited
//    S: the type of state required for editing
//    E: the type of events

export interface IVEditor<T, S, E> {
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
  render(state: S, disabled: boolean, onUpdate: UpdateFn<E>): Rendered;
}

export interface Rendered {
  // Content to be shown beside a label
  beside?: JSX.Element;

  // Content to be shown indented below the label. 
  below?: JSX.Element;
}

export type UpdateFn<E> = (e: E) => void;

export type VEditor<T> = IVEditor<T, unknown, unknown>;
export type UVEditor = VEditor<unknown>;
