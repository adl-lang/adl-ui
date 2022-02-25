import React, { useState } from "react";
import styled from 'styled-components';

import { uniqueId } from "../lib/misc";
import { FieldFns } from "../lib/fieldfns/type";

export interface Field<T> {
  text: string;
  setText(s: string): void;

  isModified(): boolean;

  isValid(): boolean;
  value(): T;
  validationError(): string;

  setValue(t :T): void;

  revert(): void;

  render(): JSX.Element;
};

export interface FieldProps {
  disabled?: boolean,
  type?: string;
  autoFocus?: boolean;
  placeholder?: string;
};

export interface FieldState {
  text: string;
  setText(s: string): void;
  initialText: string;
  setInitialText(s: string): void;
  id: string;
}

/**
 * Construct Fieldstate using react hooks
 */

export function useFieldState() : FieldState {
  const [text, setText] = useState<string>("");
  const [initialText, setInitialText] = useState<string>("");
  const [id] = useState<string>(newUniqueId);
  return {text,setText,initialText,setInitialText,id};
}
  
/**
 * Create a field with state stored as react state hooks
 */
export function useField<T>(fieldFns: FieldFns<T>, props0?: FieldProps) : Field<T> {
  const fieldState = useFieldState();
  return createField(fieldFns, fieldState, props0);
}

export function createField<T>(fieldFns: FieldFns<T>, fs: FieldState, props0?: FieldProps) : Field<T> {
  const props = props0 || {};

  function render () {
      const validationError = fieldFns.validate(fs.text);
      const errlabel = validationError && fs.text !== fs.initialText ? <StyledError>{validationError}</StyledError> : null;
      if (fieldFns.rows > 1) {
      return renderTextArea(errlabel);
      } else {
      return renderField(errlabel);
      }
  }

  function renderField(errlabel: JSX.Element | null) {
    const opts = {
      ... props,
      style: { width: fieldFns.width + "em" },
      list: ""
    };
    let datalist: JSX.Element | null = null;
    if (fieldFns.datalist) {
      // tslint:disable-next-line: no-string-literal
      opts.list = fs.id;
      datalist = (
        <datalist id={fs.id}>
          {fieldFns.datalist.map((value, i) => (
            <option key={i} value={value} />
          ))}
        </datalist>
      );
    }
    return (
      <StyledInputDiv>
        <StyledInput
          type={props.type || "text"}
          value={fs.text}
          onChange={ev => fs.setText(ev.target.value)}
          onFocus={(ev: React.FocusEvent<HTMLInputElement>) => {
            if (props.autoFocus) {
              ev.target.select();
            }
          }}
          {...opts}
        />
        {datalist}
        {errlabel}
      </StyledInputDiv>
    );
  }

  function renderTextArea(errlabel: JSX.Element | null) {
    return (
      <div>
        <textarea
          value={fs.text}
          rows={fieldFns.rows}
          onChange={(ev: React.ChangeEvent<HTMLTextAreaElement>) => fs.setText(ev.target.value)}
          style={{ width: fieldFns.width + "em" }}
          disabled={props.disabled}
        />
        {errlabel}
      </div>
    );
  }

  return {
      text: fs.text,
      setText: fs.setText,
      isModified: () => fs.text !== fs.initialText,
      isValid: () => fieldFns.validate(fs.text) === null,
      value: () => fieldFns.fromText(fs.text),
      validationError: () => fieldFns.validate(fs.text) || "",
      setValue: (t) => {
          const s = fieldFns.toText(t);
          fs.setText(s);
          fs.setInitialText(s);
      },
      revert: () => fs.setText(fs.initialText),
      render
  };
}

let idCounter: number = 0;

function newUniqueId(): string {
  idCounter += 1;
  return 'id' + idCounter;
}
  


/**
 * Stores FieldState explicitly and immutably
 */
export class ImmutableFieldState implements FieldState {
  constructor(
    readonly text: string, 
    readonly initialText: string,
    readonly id: string,
    readonly updatefn: (newState: ImmutableFieldState) => void ) {
  }

  setText(s: string) {
    this.updatefn(new ImmutableFieldState(s, this.initialText, this.id, this.updatefn));
  }

  setInitialText(s: string) {
    this.updatefn(new ImmutableFieldState(this.text, s, this.id, this.updatefn));
  }
};

export function createImmutableFieldState(initial: string, updatefn: (newState: ImmutableFieldState) => void): ImmutableFieldState {
  return new ImmutableFieldState(initial, initial, uniqueId(), updatefn);
}

// Need to pull this css out into a theme, and get it to work in a form structure.

const StyledError = styled.div`
  padding-left: calc(2* 8px);
  font-family: sans-serif;
  font-size: 14px;
  color: #b71c1c;
`;

const StyledInputDiv = styled.div`
  margin-bottom: calc(2 * 8px);
`;

const StyledInput = styled.input`
  padding: 8px;
  border: 1px solid #000;
  font-size: 14px;
  font-family: sans-serif;
  border-radius: 4px;
`;
