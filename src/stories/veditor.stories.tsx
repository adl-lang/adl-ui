import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import * as adlrt  from "../adl-gen/runtime/adl";

import {RESOLVER} from "../adl-gen/resolver";
import {createVEditor, Factory, StructEditorProps, FieldEditorProps, UnimplementedEditorProps} from "../lib/veditor/adlfactory";
import {  Rendered,  VEditor } from '../lib/veditor/type';
import { typeExprToStringUnscoped } from '../adl-gen/runtime/utils';
import { texprName, texprPerson, texprHierarchy } from '../adl-gen/examples';

storiesOf("VEditors", module)
  .add("String", () => {
    const veditor = createVEditor(adlrt.texprString(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Word16", () => {
    const veditor = createVEditor(adlrt.texprWord16(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Word16 (disabled)", () => {
    const veditor = createVEditor(adlrt.texprWord16(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor, true, 13);
  })
  .add("Bool", () => {
    const veditor = createVEditor(adlrt.texprBool(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Json", () => {
    const veditor = createVEditor(adlrt.texprJson(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Name", () => {
    const veditor = createVEditor(texprName(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  }) 
  .add("Person", () => {
    const veditor = createVEditor(texprPerson(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  }) 
  .add("Hierarchy", () => {
    const veditor = createVEditor(texprHierarchy(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  }) 

function renderVEditorStory<T>(veditor: VEditor<T>, disabled?: boolean,  initial?: T): JSX.Element {
  const [state,setState] = useState<unknown>(() => initial === undefined ? veditor.initialState : veditor.stateFromValue(initial));
  const errs = veditor.validate(state);
  const elements = veditor.render(state, disabled || false, e => setState((s:unknown) => veditor.update(s,e)));
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

const VEDITOR_FACTORY: Factory = {
  getCustomVEditor : () => null,
  getCustomField : () => null,
  renderFieldEditor,
  renderStructEditor,
  renderUnimplementedEditor,
};

function renderFieldEditor(props: FieldEditorProps): Rendered {
  const {fieldfns, disabled, state, onUpdate} = props;
  const errlabel = fieldfns.validate(state);
  const beside = (
    <Row>
      <StyledInput value={state} onChange={(s) => onUpdate(s.currentTarget.value)} disabled={disabled}/>
      {errlabel && <StyledError>{errlabel}</StyledError>}
    </Row>
    );
  return {beside};         
}


function renderStructEditor(props: StructEditorProps): Rendered {
  const rows = props.fields.map(fd => {
    const label = props.disabled? fd.label : <b>{fd.label}</b>;
    const rendered = fd.veditor.render(fd.state, props.disabled, fd.onUpdate);
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
  const below = (
    <StructContent>
      <tbody>{rows}</tbody>
    </StructContent>
  );
  return {below};
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


function renderUnimplementedEditor(props: UnimplementedEditorProps): Rendered {
  return {
    beside: <div>unimplemented veditor for {typeExprToStringUnscoped(props.typeExpr)}</div>,
    below: undefined,
    }
}
