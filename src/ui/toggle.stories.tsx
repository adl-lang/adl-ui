
import { storiesOf } from '@storybook/react';
import React, { useState } from 'react'
import { Toggle } from './toggle';

export default {
  title: 'Toggle', 
  component: Toggle,
};


export const Default = () =>  {
  const [checked,setChecked] = useState<boolean>(false);
  return <Toggle checked={checked} onChange={() => setChecked(v => !v)}/>;
}

