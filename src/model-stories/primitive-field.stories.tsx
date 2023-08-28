import styled from 'styled-components';

import { TypedFieldState, useTypedFieldState } from "../model/fields/hooks";
import {STRING_FIELD, NUMBER_FIELD, BOOLEAN_FIELD, intFieldFns, NON_EMPTY_STRING_FIELD, JSON_FIELD} from "../model/fields/primitive";

export default {
  title: 'model/Fields', 
};

export const String = () => {
    const fs = useTypedFieldState(STRING_FIELD);
    return renderTypedField(fs);
  }

export const Number = () => {
    const fs = useTypedFieldState(NUMBER_FIELD);
    return renderTypedField(fs);
  }

export const Boolean = () => {
    const fs = useTypedFieldState(BOOLEAN_FIELD);
    return renderTypedField(fs);
  }

export const IntegerLimited = () => {
    const fs = useTypedFieldState(intFieldFns(1,5));
    return renderTypedField(fs);
  }
IntegerLimited.storyName = 'Integer (1-5)';

export const Json = () => {
    const fs = useTypedFieldState(JSON_FIELD);
    return renderTypedTextArea(fs);
  }

export const SimpleForm = () => {
    const name = useTypedFieldState(NON_EMPTY_STRING_FIELD);
    const age = useTypedFieldState(intFieldFns(1,120));

    let message = "content ok";
    if (!name.isValid()) {
      message = "Name: " + name.validationError();
    } else if (!age.isValid()) {
      message = "Age: " + age.validationError();
    }
    return (
      <div>
        <div>
          <div>Name</div>
          <div>{renderRawTypedField(name)}</div>
        </div>
        <div>
          <div>Age</div>
          <div>{renderRawTypedField(age)}</div>
        </div>
        <p>{message}</p>
      </div>
    );
  }

/** Render a typed field with any validation error */
function renderTypedField<T>(fs: TypedFieldState<T>) {
  const validationError =  fs.validationError();
  const errlabel = validationError !== "" ? <StyledError>{validationError}</StyledError> : null;
  return (
  <div>
    <StyledInput value={fs.text} onChange={ev => fs.setText(ev.target.value)}/>
    {errlabel}
  </div>
  );
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
/** Render a raw typed field */
function renderRawTypedField<T>(fs: TypedFieldState<T>) {
  return  <StyledInput value={fs.text} onChange={ev => fs.setText(ev.target.value)}/>;
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
