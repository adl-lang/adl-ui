import React from "react";
import styled from 'styled-components';
import { isJsonParseException } from '../../adl-gen/runtime/json';
import { AdlFormProps, Mode } from '../../lib/form';
import { Button } from "./button";
import { Toggle } from "./toggle";

export const AdlForm = (props: AdlFormProps<unknown>) => {

  const state = props.state;

  function onToggleMode() {
    switch (state.mode) {
      case Mode.VE:
        // Update the rawstate if we can, before switching to raw mode
        // tslint:disable-next-line:no-shadowed-variable
        const errors = state.veditor.validate(state.veditorState);
        if (errors.length === 0 && state.jsonBinding) {
          const value = state.veditor.valueFromState(state.veditorState);
          const rawState = JSON.stringify(state.jsonBinding.toJson(value), null, 2);
          state.setMode(Mode.RAW);
          state.setRawState(rawState);
        } else {
          state.setMode(Mode.RAW);
        }
        break;

      case Mode.RAW:
        // Update the veditor if we can, before switching to VE mode
        const result = parseRawText(state.rawState);
        if (result.kind === "value") {
          const adlState = state.veditor.stateFromValue(result.value);
          state.setMode(Mode.VE);
          state.setVEditorState(adlState);
        } else {
          state.setMode(Mode.VE);
        }
        break;
      default:
    }
  };


  const parseRawText = (
    text: string
  ): { kind: "error"; error: string } | { kind: "value"; value: unknown } => {
    try {
      const jv = JSON.parse(text);
      if (state.jsonBinding) {
        const value = state.jsonBinding.fromJson(jv);
        return { kind: "value", value };
      }
      return { kind: "error", error: "BUG: no allowRaw property" };
    } catch (e) {
      if (e instanceof SyntaxError) {
        return { kind: "error", error: "Json is not well formed" };
      } else if (isJsonParseException(e)) {
        return { kind: "error", error: e.getMessage() };
      } else {
        return { kind: "error", error: "Unknown error" };
      }
    }
  };

  // tslint:disable-next-line: no-any
  const onUpdate = (event: any) => {
    const newVEditorState = state.veditor.update(state.veditorState, event);
    state.setVEditorState(newVEditorState);
    void validateForm(newVEditorState);
  }

  // tslint:disable-next-line: no-any
  const validateForm = async (adlState: any) => {
    if (props.validate && state.mode === Mode.VE) {
      const value = state.veditor.valueFromState(adlState);
      const validationSeq = state.formValidation.validationSeq + 1;
      state.setFormValidation({
          type: "awaiting",
          validationSeq
      });
      console.log("awaiting validation of ", value);
      const error: string | undefined = await props.validate(value);
      console.log("done");
      if (error && error.length > 0) {
        state.setFormValidation({
          type: "error",
          error,
          validationSeq
        });

      } else {
        state.setFormValidation({
          type: "ok",
          validationSeq
        });
      }  
    }
  }

  const onApply = () => {
    let value: unknown = null;
    switch (state.mode) {
      case Mode.VE:
        value = state.veditor.valueFromState(state.veditorState);
        break;
      case Mode.RAW:
        if (state.jsonBinding) {
          value = state.jsonBinding.fromJson(JSON.parse(state.rawState));
        }
        break;
      default:
    }
    if (props.onApply) {
      props.onApply(value);
      state.setValue0(value);
    }
  }

  let errors: string[] = [];
  let renderedEditor: JSX.Element | null = null;

  switch (state.mode) {
    case Mode.VE:
      errors = state.veditor.validate(state.veditorState);
      const rendered = state.veditor.render(
        state.veditorState,
        props.disabled == undefined ? false: props.disabled,
        onUpdate
      );
      renderedEditor = <>
        {rendered.beside}
        {rendered.below}
      </>
      break;
    case Mode.RAW:
      const result = parseRawText(state.rawState);
      const error =
        result.kind === "error" ? (
          <ErrLabel>
            {result.error}
          </ErrLabel>
        ) : null;
      renderedEditor = (
        <div>
            <RawJsonEditor
              disabled={props.disabled}
              value={state.rawState}
              onChange={state.setRawState}
            />
          {error}
        </div>
      );
      if (result.kind === "error") {
        errors = [result.error];
      }
      break;
    default:
  }

  const buttons: JSX.Element[] = [];
  if (props.onApply) {
    buttons.push(
      <Button
        primary
        loading={state.formValidation.type === "awaiting"}
        disabled={errors.length > 0}
        key="Apply"
        onClick={onApply}
      >
        Apply
      </Button>
    );
  }
  if (props.onClose) {
    buttons.push(
      <Button key="Close" onClick={props.onClose}>
        Close
      </Button>
    );
  }
  if (props.onCancel) {
    buttons.push(
      <Button onClick={props.onCancel}>
        Cancel
      </Button>
    );
  }

  let rawToggle: JSX.Element | null = null;
  if (state.jsonBinding) {
    rawToggle = (
      <span>
      <Toggle
        onChange={onToggleMode}
        checked={state.mode === Mode.RAW}
      />
      Edit Raw
      </span>
    );
  }

  let formError: JSX.Element | null = null;
  if (state.formValidation.type === "error") {
    formError = (
      <div style={{ margin: "20px" }}>
        <ErrLabel>
          {state.formValidation.error}
        </ErrLabel>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div style={{ margin: "20px" }}>{renderedEditor}</div>
        {formError}
        <div style={{ margin: "20px" }}>
          {buttons}
          {rawToggle}
        </div>
      </div>
    </div>
  );
}

const ErrLabel = styled.label`
  color: red;
`;

const RawJsonEditor = (props: {
  disabled?: boolean,
  value: string,
  onChange: (s: string) => void
}) =>  {
  return <textarea
    rows={20}
    disabled={props.disabled}
    value={props.value}
    onChange={ev => props.onChange(ev.target.value)}
  >
  </textarea>;
}