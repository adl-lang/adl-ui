import React, { useEffect, useState } from "react";
import { VEditor } from "./veditor/type";
import { JsonBinding } from "../adl-gen/runtime/json";

// A form for entry of an arbirary ADL value . It is provided with an initial value and its
// ADL type. The onApply() callback is made when the user presses the apply button on validated
// input.

export interface AdlFormProps<T> {
  state: AdlFormState<T>,
  onCancel?(): void;
  onClose?(): void;
  onApply?(value: T): void;
  disabled?: boolean;
  validate?(value: T): Promise<string | undefined>;
}

export interface AdlFormState<T> {
  value0:  T | undefined;
  veditor: VEditor<T>, 
  jsonBinding: JsonBinding<T> | undefined,

  veditorState: unknown;
  rawState: string;
  mode: Mode;
  pristine: boolean;
  formValidation: FormValidation;

  setValue0(value: T | undefined): void;
  setMode(mode:Mode): void,
  setVEditorState(state:unknown): void;
  setRawState(state: unknown): void;
  setFormValidation(formValidation: FormValidation): void;
}

export enum Mode {
  VE, // Edit with the generated ADL VEditor
  RAW // Edit with a (validated) json multiline text field
}

interface AwaitingValidation {
  type: "awaiting";
  validationSeq: number;
}

interface FormError {
  type: "error";
  error: string;
  validationSeq: number;
}

interface FormValidated {
  type: "ok";
  validationSeq: number;
}

type FormValidation = AwaitingValidation | FormError | FormValidated;


export function createAdlFormState<T>(params: {
    value0?: T, 
    veditor: VEditor<T>, 
    jsonBinding?: JsonBinding<T>,
  }): AdlFormState<T> {

  const [value0, _setValue0] = useState<T|undefined>(params.value0);
  const [pristine, setPristine] = useState<boolean>(true);
  const [veditorState, _setVEditorState] = useState<unknown>(() => makeVeditorState(params.value0));
  const [rawState, _setRawState] = useState<string>(() => makeRawState(params.value0));
  const [mode, setMode] = useState<Mode>(Mode.VE);
  const [formValidation, _setFormValidation] = useState<FormValidation>({type: "ok",validationSeq: 0});

  function makeVeditorState(v: T | undefined): unknown {
    return v === undefined
    ? params.veditor.initialState
    : params.veditor.stateFromValue(v);
  }

  function makeRawState(v: T | undefined): string {
    return params.jsonBinding && v != undefined ? JSON.stringify(params.jsonBinding.toJson(v), null, 2) : ""
  }

  function setValue0(v: T | undefined) {
    _setValue0(v);
    _setVEditorState(makeVeditorState(v));
    _setRawState(makeRawState(v));
    setPristine(true);
  } 

  function setVEditorState(state: unknown) {
    _setVEditorState(state);
    setPristine(false);
  } 

  function setRawState(state: string) {
    _setRawState(state);
    setPristine(false);
  }

  function setFormValidation(f: FormValidation) {
    if (f.validationSeq >= formValidation.validationSeq) {
      _setFormValidation(f);
    }
  }

  return {
    veditor: params.veditor,
    jsonBinding: params.jsonBinding,
    value0,
    setValue0,
    veditorState,
    setVEditorState,
    rawState,
    setRawState,
    pristine,
    mode,
    setMode,
    formValidation,
    setFormValidation
  };
}
