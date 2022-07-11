
import styled  from 'styled-components';
import { storiesOf } from '@storybook/react';
import React from 'react'
import { useSelectState, SelectState } from "../lib/select";

storiesOf("Selects", module)
  .add("Basic", () =>  {
    const state = useSelectState(
      0,
      [
        "value1",
        "value2",
        "value3",
      ],
    );
    return <Select state={state}/>;
  })

interface SelectProps {
  state: SelectState,
}

export function Select(props: SelectProps) {
  const state = props.state;
  return <SelectContainer>
    <div onClick={state.onClick} >{state.current} ▼</div>
    { state.active && 
      <SelectChoices>
        { state.choices.map( (s,i) => <div onClick={() => state.onChoice(i)}>{s}</div>) }
      </SelectChoices>
    }
  </SelectContainer>;
}

const SelectContainer = styled.div`
  position: relative;
  display: inline-block;
  font-size: 14px;
  font-family: sans-serif;
  cursor: pointer;
`

const SelectChoices = styled.div`
  position: absolute;
  z-index: 1;
  border 1px solid;
  border-radius: 4px;
  padding: 6px;
`;



