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

storiesOf("VEditors", module)
  .add("String", () => {
    const veditor = createVEditor(adlrt.texprString(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  })
  .add("Word16", () => {
    const veditor = createVEditor(adlrt.texprWord16(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  })
  .add("Bool", () => {
    const veditor = createVEditor(adlrt.texprBool(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  })
  .add("Json", () => {
    const veditor = createVEditor(adlrt.texprJson(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  }) 

function renderVEditor<T>(veditor: VEditor<T>, initial?: T): JSX.Element {
  const [state,setState] = useState(() => initial === undefined ? veditor.initialState : veditor.stateFromValue(initial));
  const elements = veditor.render(state, true, setState);
  return (
    <Content>
      <Row><HeaderLabel>Value:</HeaderLabel>{elements.beside}</Row>
      {elements.below}
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

const StyledTextArea = styled.textarea`
padding: 8px;
border: 1px solid #000;
font-size: 14px;
font-family: sans-serif;
border-radius: 4px;
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

  fieldVEditor<T>(typeExpr: adlast.TypeExpr, ff: FieldFns<T>): UVEditor {
    const initialState = "";

    function validate(t: string): string[] {
      const err = ff.validate(t);
      return err === undefined ? [] : [err];
    }

    function render(state: string, canEdit: boolean, onUpdate: UpdateFn<string>): Rendered {
      const errlabel = ff.validate(state);
      const beside = (
        <Row>
          <StyledInput value={state} onChange={(s) => onUpdate(s.currentTarget.value)}/>
          {errlabel && <StyledError>{errlabel}</StyledError>}
        </Row>
        );
      return {beside};         
    }

    const veditor: IVEditor<T,string,string> = {
      initialState: "",
      stateFromValue: ff.toText,
      validate,
      valueFromState: ff.fromText,
      update: (s) => s,
      render
    };

    return veditor;
  }

  structVEditor(typeExpr: adlast.TypeExpr, resolver: adlrt.DeclResolver, fields: VField[]): UVEditor {
    return this.unimplementedVEditor(typeExpr);
  }

  unionVEditor(typeExpr: adlast.TypeExpr, resolver: adlrt.DeclResolver, fields: VField[]): UVEditor {
    return this.unimplementedVEditor(typeExpr);
  }

  nullableVEditor(typeExpr: adlast.TypeExpr, resolver: adlrt.DeclResolver, underlying: UVEditor): UVEditor {
    return this.unimplementedVEditor(typeExpr);
  }

  vectorVEditor(typeExpr: adlast.TypeExpr, resolver: adlrt.DeclResolver, underlying:  UVEditor):  UVEditor {
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