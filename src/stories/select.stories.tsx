
import { storiesOf } from '@storybook/react';
import React from 'react'
import { useSelectState } from "../lib/select";
import { Select } from './ui/select';

storiesOf("Components", module)
  .add("Basic Select", () =>  {
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
