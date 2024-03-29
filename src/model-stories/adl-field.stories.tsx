import styled from 'styled-components';

import { TypedFieldState, useTypedFieldState } from "../model/fields/hooks";
import {createAdlField} from "../model/fields/adl";
import {texprHierarchy, texprPerson} from "@/adl-gen/examples";
import {RESOLVER} from "@/adl-gen/resolver";

export default {
  title: 'model/Fields', 
};

export const JsonPerson = () => {
  const f = createAdlField(texprPerson(), RESOLVER);
  const fs = useTypedFieldState(f);
  return renderTypedTextArea(fs);
}

export const JsonHiearchy = () => {
  const f = createAdlField(texprHierarchy(), RESOLVER);
  const fs = useTypedFieldState(f);
  return renderTypedTextArea(fs);
}

 
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
border-radius: 4px;
`;
  
const StyledError = styled.div`
padding-left: calc(2* 8px);
color: #b71c1c;
`;

const StyledTextArea = styled.textarea`
padding: 8px;
border: 1px solid #000;
border-radius: 4px;
`;
