import { storiesOf } from '@storybook/react';
import {RESOLVER} from "../adl-gen/resolver";
import {createVEditor } from "../lib/veditor/adlfactory";

import * as adlex from '../adl-gen/examples';
import { UiFactory } from "./ui/factory";
import { AdlFormState, createAdlFormState } from '../lib/form';
import { AdlForm } from './ui/form';
import { createJsonBinding } from '../adl-gen/runtime/json';

storiesOf("Forms", module)
.add("Person (empty)", () => {
  const veditor = createVEditor(adlex.texprPerson(), RESOLVER, new UiFactory());
  const state = createAdlFormState({
    veditor
  })
  return renderFormStory(state, false);
})  
.add("Person (initialized)", () => {
  const veditor = createVEditor(adlex.texprPerson(), RESOLVER, new UiFactory());
  const state = createAdlFormState({
    veditor,
    value0: {
      name: {first: "Mike", last: "Mechanic"},
      age: 21,
      gender: {kind:"male"},
      role: "boss"
    }
  })
  return renderFormStory(state, false);
})  
.add("Person (with raw mode)", () => {
  const veditor = createVEditor(adlex.texprPerson(), RESOLVER, new UiFactory());
  const jsonBinding = createJsonBinding(RESOLVER, adlex.texprPerson());
  const state = createAdlFormState({
    veditor,
    jsonBinding,
    value0: {
      name: {first: "Mike", last: "Mechanic"},
      age: 21,
      gender: {kind:"male"},
      role: "boss"
    }
  })
  return renderFormStory(state, false);
})


function renderFormStory<T>(state: AdlFormState<T>, disabled: boolean): JSX.Element {
  return AdlForm({
    state,
    disabled,
    onCancel: () => console.log("onCancel"),
    onApply: v => console.log("onApply", v),
  });
}