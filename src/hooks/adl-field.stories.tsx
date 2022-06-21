import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';

import { TypedFieldState, useTypedFieldState } from "./field";
import {createAdlField} from "../lib/fieldfns/adl";
import {texprHierarchy, texprPerson} from "../adl-gen/examples";
import {RESOLVER} from "../adl-gen/resolver";

storiesOf("Adl Fields", module)
  .add("Person", () => {
    const f = createAdlField(texprPerson(), RESOLVER);
    const fs = useTypedFieldState(f);
    return renderTypedTextArea(fs);
  })
  .add("Hierarchy", () => {
    const f = createAdlField(texprHierarchy(), RESOLVER);
    const fs = useTypedFieldState(f);
    return renderTypedTextArea(fs);
  })
 
/** Render a typed multiline text area */
function renderTypedTextArea<T>(fs: TypedFieldState<T>) {
  const validationError =  fs.validationError();
  const errlabel = validationError !== "" ? <StyledError>{validationError}</StyledError> : null;
  return (
  <div>
    <StyledTextArea rows={10} cols={40} value={fs.text} onChange={ev => fs.setText(ev.target.value)}/>
    {errlabel}
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
