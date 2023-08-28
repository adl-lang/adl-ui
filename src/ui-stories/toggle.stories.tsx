
import { useState } from 'react'
import { Toggle } from '../ui/toggle';

export default {
  title: 'ui/Toggle', 
  component: Toggle,
};


export const Default = () =>  {
  const [checked,setChecked] = useState<boolean>(false);
  return <Toggle checked={checked} onChange={() => setChecked(v => !v)}/>;
}

