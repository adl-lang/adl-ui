import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';

import * as adlrt  from "../adl-gen/runtime/adl";

import {texprHierarchy, texprPerson} from "../adl-gen/examples";
import {RESOLVER} from "../adl-gen/resolver";
import {createVEditor, CustomContext, Factory, VField} from "../lib/veditor/adlfactory";
import { UVEditor, VEditor } from '../lib/veditor/type';
import { FieldFns } from '../lib/fields/type';

storiesOf("VEditors", module)
  .add("String", () => {
    const veditor = createVEditor(adlrt.texprString(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditor(veditor);
  }) 

function renderVEditor<T>(veditor: VEditor<T, unknown, unknown>, initial?: T): JSX.Element {
  const [state,setState] = useState(() => initial === undefined ? veditor.initialState : veditor.stateFromValue(initial));
  const elements = veditor.render(state, true, setState);
  return (
    <div>
      {elements.beside}
      {elements.below}
    </div>
  );
}

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

  unimplementedVEditor(type: string): UVEditor {
    return {
      initialState: null,
      stateFromValue: () => null,
      validate: () => null,
      valueFromState: () => null,
      update: () => {},
      render: () => ({
        beside: <div>unimplemented veditor for ${type}</div>,
        below: undefined,
      })
    };
  }

  voidVEditor(): UVEditor {
    return this.unimplementedVEditor("void");
  }

  fieldVEditor(ff: FieldFns<unknown>): UVEditor {
    return this.unimplementedVEditor("field");
  }

  structVEditor(resolver: adlrt.DeclResolver, fields: VField[]): UVEditor {
    return this.unimplementedVEditor("struct");
  }

  unionVEditor(resolver: adlrt.DeclResolver, fields: VField[]): UVEditor {
    return this.unimplementedVEditor("union");
  }

  nullableVEditor(resolver: adlrt.DeclResolver, underlying: UVEditor): UVEditor {
    return this.unimplementedVEditor("nullable");
  }

  vectorVEditor(resolver: adlrt.DeclResolver, underlying:  UVEditor):  UVEditor {
    return this.unimplementedVEditor("vector");
  }
}

const VEDITOR_FACTORY = new VeditorFactory();