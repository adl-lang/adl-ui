
import { storiesOf } from '@storybook/react';
import React, { useState } from 'react'
import { Toggle } from './toggle';


storiesOf("Components", module)
  .add("Basic Toggle", () =>  {
    const [checked,setChecked] = useState<boolean>(false);
    return <Toggle checked={checked} onChange={() => setChecked(v => !v)}/>;
  })

