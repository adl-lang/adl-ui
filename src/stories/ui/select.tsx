import styled  from 'styled-components';
import React from 'react'
import { SelectState } from '../../lib/select';

interface SelectProps {
  state: SelectState,
}

export function Select(props: SelectProps) {
  const state = props.state;

  const current = state.current == null ? "???" : state.choices[state.current];
  
  const NO_CHOICE = "???";
  const labels = [
    NO_CHOICE,
    ...state.choices
  ]
    
  function onChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    if (ev.target.value === NO_CHOICE) {
      props.state.onChoice(null);
    } else {
      props.state.onChoice(state.choices.findIndex(c => c === ev.target.value ));
    }
  }
  
  const Select = current  == NO_CHOICE ? NoChoiceStyledSelect : StyledSelect;
    
  return (
    <Select value={current} onChange={onChange}>
      {labels.map( l => <Option key={l}>{l}</Option> )}
    </Select>
  );
}

const StyledSelect = styled.select`
  font-size: 14px;
  font-family: sans-serif;
  border: none;
  background-color: white;
`;

const NoChoiceStyledSelect = styled(StyledSelect)`
color: #b71c1c;
`

const Option = styled.option`
  color: black;
`
