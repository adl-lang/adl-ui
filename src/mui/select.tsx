import MuiSelect, {SelectChangeEvent} from '@mui/material/Select';
import MuiMenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useState } from 'react'

export interface SelectState {
  current: number | null,
  active: boolean,
  choices: string[],
  onClick(): void;
  onChoice(i: number | null): void;
}

export function useSelectState(initial: number, choices: string[],): SelectState {
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState(initial);
  
  function onClick() {
    setActive( v => !v );
  }
  
  function onChoice(i:number) {
     setActive(false);
     setCurrent(i);
  }
  return {
    current,
    choices,
    active,
    onClick,
    onChoice,
  }
}


interface SelectProps {
  state: SelectState,
}

export function Select(props: SelectProps) {
  const state = props.state;

  const current = state.current == null ? "???" : state.choices[state.current] ? state.choices[state.current] : "???";
  
  const NO_CHOICE = "???";
  const labels = [
    NO_CHOICE,
    ...state.choices
  ]
    
  function onChange(ev: SelectChangeEvent) {
    if (ev.target.value === NO_CHOICE) {
      props.state.onChoice(null);
    } else {
      props.state.onChoice(state.choices.findIndex(c => c === ev.target.value ));
    }
  }
  
  return (
    <FormControl error={current==NO_CHOICE}>
      <MuiSelect size="small" value={current} onChange={onChange}>
        {labels.map( l => <MuiMenuItem value={l} key={l}>{l}</MuiMenuItem> )}
      </MuiSelect>
    </FormControl>
  );
}

