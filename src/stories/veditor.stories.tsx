import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';

import * as adlrt  from "../adl-gen/runtime/adl";
import * as adlast from "../adl-gen/sys/adlast";

import {RESOLVER} from "../adl-gen/resolver";
import {createVEditor, CustomContext, Factory, VField} from "../lib/veditor/adlfactory";
import { IVEditor, Rendered, UpdateFn, UVEditor, VEditor } from '../lib/veditor/type';
import { FieldFns } from '../lib/fields/type';
import { typeExprToStringUnscoped } from '../adl-gen/runtime/utils';
import { texprName, texprPerson } from '../adl-gen/examples';
import { createJsonBinding } from '../adl-gen/runtime/json';
import { DeclResolver } from '../adl-gen/runtime/adl';

storiesOf("VEditors", module)
  .add("String", () => {
    const veditor = createVEditor(adlrt.texprString(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  })
  .add("Word16", () => {
    const veditor = createVEditor(adlrt.texprWord16(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  })
  .add("Word16 (disabled)", () => {
    const veditor = createVEditor(adlrt.texprWord16(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor, true, 13);
  })
  .add("Bool", () => {
    const veditor = createVEditor(adlrt.texprBool(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  })
  .add("Json", () => {
    const veditor = createVEditor(adlrt.texprJson(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  })
  .add("Name", () => {
    const veditor = createVEditor(texprName(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  }) 
  .add("Person", () => {
    const veditor = createVEditor(texprPerson(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  }) 

function renderVEditor<T>(veditor: VEditor<T>, disabled?: boolean,  initial?: T): JSX.Element {
  const [state,setState] = useState(() => initial === undefined ? veditor.initialState : veditor.stateFromValue(initial));
  const errs = veditor.validate(state);
  const elements = veditor.render(state, disabled || false, e => setState(s => veditor.update(s,e)));
  console.log(errs);
  return (
    <Content>
      <Row><HeaderLabel>Value:</HeaderLabel>{elements.beside}</Row>
      {elements.below}
      <hr/>
      {errs.length === 0 
         ? <Valid>Value:<br/><br/>{JSON.stringify(veditor.valueFromState(state), null, 2)}</Valid>
         : <Errors>Errors:<br/><br/>{errs}</Errors>
      }
    </Content>
  );
}

const Content = styled.div`
  font-size: 14px;
  font-family: sans-serif;
`;

const Row = styled.div`
display: flex;
flex-direction: row;
align-items: center;
`;

const HeaderLabel = styled.div`
margin-right: 10px;
font-weight: bold;
`;

const Valid = styled.pre`
 color: green;
`;

const Errors = styled.pre`
  color: red;
`;

const StyledInput = styled.input`
padding: 8px;
border: 1px solid #000;
font-size: 14px;
font-family: sans-serif;
border-radius: 4px;
`;
  
const StyledError = styled.div`
padding-left: calc(2* 8px);
font-family: sans-serif;
font-size: 14px;
color: #b71c1c;
`;

class VeditorFactory implements Factory {

  getCustomVEditor(ctx: CustomContext) {
    return null;
  }

  getCustomField(ctx: CustomContext) {
    return null;
  }

  voidVEditor(): UVEditor {
    return this.unimplementedVEditor(adlrt.texprVoid().value);
  }

  renderFieldEditor(ff: FieldFns<unknown>,disabled: boolean, state: string, onUpdate: UpdateFn<string>): Rendered {
      const errlabel = ff.validate(state);
      const beside = (
        <Row>
          <StyledInput value={state} onChange={(s) => onUpdate(s.currentTarget.value)} disabled={disabled}/>
          {errlabel && <StyledError>{errlabel}</StyledError>}
        </Row>
        );
      return {beside};         
      }

  structVEditor(typeExpr: adlast.TypeExpr, resolver: adlrt.DeclResolver, fields: VField[]): UVEditor {
    return structVEditor(resolver, fields);
  }

  unionVEditor(typeExpr: adlast.TypeExpr, resolver: adlrt.DeclResolver, fields: VField[]): UVEditor {
    return this.unimplementedVEditor(typeExpr);
  }

  nullableVEditor(typeExpr: adlast.TypeExpr, resolver: adlrt.DeclResolver, underlying: UVEditor): UVEditor {
    return this.unimplementedVEditor(typeExpr);
  }

  vectorVEditor(typeExpr: adlast.TypeExpr, esolver: adlrt.DeclResolver, underlying:  UVEditor):  UVEditor {
    return this.unimplementedVEditor(typeExpr);
  }

  unimplementedVEditor(typeExpr: adlast.TypeExpr): UVEditor {
    return {
      initialState: null,
      stateFromValue: () => null,
      validate: () => null,
      valueFromState: () => null,
      update: () => {},
      render: () => ({
        beside: <div>unimplemented veditor for {typeExprToStringUnscoped(typeExpr)}</div>,
        below: undefined,
      })
    };
  }
}

const VEDITOR_FACTORY = new VeditorFactory();

interface StructFieldStates {
  [key: string]: unknown;
}
interface StructState {
  fieldStates: StructFieldStates;
}
interface StructFieldEvent {
  kind: "field";
  field: string;
  fieldEvent: unknown;
}
type StructEvent = StructFieldEvent;

interface StructFieldDetails {
  name: string;
  label: string;
  veditor: UVEditor;
}

function structVEditor(
  declResolver: DeclResolver,
  fields: VField[],
): IVEditor<unknown, StructState, StructEvent> {

  const fieldDetails = fields.map(f => {
    const field = f.field;
    const veditor = f.veditor;
    const jsonBinding = createJsonBinding<unknown>(declResolver, { value: field.adlTree.typeExpr });

    return {
      name: field.astField.name,
      default: field.astField.default,
      jsonBinding,
      label: fieldLabel(field.astField.name),
      veditor,
    };
  });

  const veditorsByName = {};
  const initialState = { fieldStates: {} };

  // It's unclear what the initialState for an empty struct
  // editor should be... either every field empty, or
  // with default values filled in for those fields that have
  // defaults specified. the flag below set's this behaviour, though
  // we may want to change initialState to be a function that takes
  // this as a parameter.
  const USE_DEFAULTS_FOR_STRUCT_FIELDS = true;

  for (const fd of fieldDetails) {
    veditorsByName[fd.name] = fd.veditor;
    if (USE_DEFAULTS_FOR_STRUCT_FIELDS && fd.default.kind === "just") {
      initialState.fieldStates[fd.name] = fd.veditor.stateFromValue(
        fd.jsonBinding.fromJsonE(fd.default.value)
      );
    } else {
      initialState.fieldStates[fd.name] = fd.veditor.initialState;
    }
  }

  function stateFromValue(value: {}) {
    const state = {
      fieldStates: {},
      activeGroups: []
    };
    for (const fd of fieldDetails) {
      state.fieldStates[fd.name] = fd.veditor.stateFromValue(value[fd.name]);
    }
    return state;
  }

  function validate(state: StructState) {
    let errors: string[] = [];
    for (const fd of fieldDetails) {
      errors = errors.concat(fd.veditor.validate(state.fieldStates[fd.name]).map(err => fd.name + ": " + err));
    }
    return errors;
  }

  function valueFromState(state: StructState) {
    const value = {};
    for (const fd of fieldDetails) {
      value[fd.name] = fd.veditor.valueFromState(state.fieldStates[fd.name]);
    }
    return value;
  }

  function update(state: StructState, event: StructEvent): StructState {
    if (event.kind === "field") {
      const newFieldStates = {
        ...state.fieldStates
      };
      const newfs = veditorsByName[event.field].update(
        state.fieldStates[event.field],
        event.fieldEvent
      );
      newFieldStates[event.field] = newfs;
      const newState =  {
        fieldStates: newFieldStates,
      };
      return newState;
    } else {
      return state;
    }
  }

  function render(
    state: StructState,
    canEdit: boolean,
    onUpdate: UpdateFn<StructEvent>
  ): Rendered {
    const below = (
      <StructTable
        fieldDetails={fieldDetails}
        onUpdate={onUpdate}
        canEdit={canEdit}
        state={state}
      />
    );
    return {below}
  }

  return {
    initialState,
    stateFromValue,
    validate,
    valueFromState,
    update,
    render
  };
}

interface StructTableProps {
  fieldDetails: StructFieldDetails[];
  canEdit: boolean;
  state: StructState;
  onUpdate(ev: StructFieldEvent): void;
}

interface FieldUpdateMap {
  [key: string]: (v: unknown) => void;
}

function StructTable(props: StructTableProps): JSX.Element {
  const onFieldUpdateMap: FieldUpdateMap = {};
  for (const fd of props.fieldDetails) {
    onFieldUpdateMap[fd.name] = event => {
      props.onUpdate({ kind: "field", field: fd.name, fieldEvent: event });
    };
  }
  const rows = props.fieldDetails.map(fd => {
    const onFieldUpdate = onFieldUpdateMap[fd.name];
    const label = props.canEdit ? fd.label : <b>{fd.label}</b>;
    const rendered = fd.veditor.render(props.state.fieldStates[fd.name], props.canEdit, onFieldUpdate);
    return (
      <>
      <tr key={fd.name}>
        <StructFieldLabel>
          <label>{label}</label>
        </StructFieldLabel>
        {rendered.beside && <StructFieldBeside>{rendered.beside}</StructFieldBeside>}
      </tr>
      {rendered.below && <StructFieldBelow colSpan={2}>{rendered.below}</StructFieldBelow>}
      </>
    );
  });
  return (
    <StructContent>
      <tbody>{rows}</tbody>
    </StructContent>
  );
}

const StructContent = styled.table`
  border-collapse: collapse;
  border-style: hidden;
`;

const StructFieldLabel = styled.td`
  padding: 5px;
`;

const StructFieldBeside = styled.td`
  padding: 5px;
`;

const StructFieldBelow = styled.td`
  padding-left: 50px;
`;

// Convert snake/camel case to human readable spaced name
export function fieldLabel(name: string): string {
  return (
    name
      // insert a space before all caps
      .replace(/([A-Z])/g, " $1")
      // uppercase the first character
      .replace(/^./, function(str) {
        return str.toUpperCase();
      })
      // replace _ with space
      .replace(/_/g, " ")
  );
}
