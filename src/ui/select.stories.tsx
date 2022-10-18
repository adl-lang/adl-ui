
import { storiesOf } from '@storybook/react';
import React from 'react'
import { useSelectState } from "../model/select";
import { Select } from './select';

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
