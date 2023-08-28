
import { useState } from 'react'
import { Toggle } from '../mui/toggle';

export default {
  title: 'mui/Toggle', 
  component: Toggle,
};


export const Default = () =>  {
  const [checked,setChecked] = useState<boolean>(false);
  return <Toggle checked={checked} onChange={() => setChecked(v => !v)}/>;
}

