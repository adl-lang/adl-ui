// A record mapping a value of type T to a text field
export interface FieldFns<T> {

  // Convert a value to the text content
  toText(value: T): string;

  // validate the text content returning null on success
  // or an error message on failure
  validate(text: string): null | string;

  // assuming valid, convert the text content back to a value
  fromText(text: string): T;

  // Returns true if two values are equals
  equals(v1: T, v2: T): boolean;
}

