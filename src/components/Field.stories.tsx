import React from 'react';
import { storiesOf } from '@storybook/react';
import { useField } from "./Field";
import {withDatalist} from "../lib/fieldfns/type";
import {STRING_FIELD, NUMBER_FIELD, BOOLEAN_FIELD, intFieldFns} from "../lib/fieldfns/primitive";

storiesOf("Field", module)
  .add("String", () => {
    const field = useField(STRING_FIELD);
    return field.render();
  })
  .add("Number", () => {
    const field = useField(NUMBER_FIELD);
    return field.render();
  })
  .add("Boolean", () => {
    const field = useField(BOOLEAN_FIELD);
    return field.render();
  })
  .add("Boolean (with completions)", () => {
    const field = useField(withDatalist(BOOLEAN_FIELD, ["false", "true"]));
    return field.render();
  })
  .add("Integer (1-5)", () => {
    const field = useField(intFieldFns(1,5));
    return field.render();
  });