
import { storiesOf } from '@storybook/react';
import React, { useState } from 'react'

storiesOf("Components", module)
  .add("Basic Toggle", () =>  {
    const [checked,setChecked] = useState<boolean>(false);
    return <Toggle checked={checked} onChange={() => setChecked(v => !v)}/>;
  })

interface ToggleProps {
  disabled?: boolean,
  checked: boolean,
  onChange: () => void;
}

export function Toggle(props: ToggleProps) {
  return (
    <label>
      <input type="checkbox" disabled={props.disabled} checked={props.checked} onChange={props.onChange}/>
      <span/>
    </label>
  )
}

