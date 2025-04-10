import {RESOLVER} from "@/adl-gen/resolver";
import {createVEditor } from "../model/veditor/adlfactory";

import * as adlex from '@/adl-gen/examples';
import * as adlrt  from "@/adl-gen/runtime/adl";

import { UiFactory } from "../mui/factory";
import { AdlFormState, useAdlFormState } from '../mui/form';
import { AdlForm } from '../mui/form';
import { createJsonBinding } from '@/adl-gen/runtime/json';
import { customizedHierarchyVector, customizedPersonVector } from './veditor.stories';

export default {
  title: 'mui/Forms',
};

export const PersonEmpty = () => {
  const veditor = createVEditor(adlex.texprPerson(), RESOLVER, new UiFactory());
  const state = useAdlFormState({
    veditor
  })
  return renderFormStory(state, false);
}

export const PersonInitialized = () => {
  const veditor = createVEditor(adlex.texprPerson(), RESOLVER, new UiFactory());
  const state = useAdlFormState({
    veditor,
    value0: {
      name: {first: "Mike", last: "Mechanic"},
      age: 21,
      gender: {kind:"male"},
      role: "boss"
    }
  })
  return renderFormStory(state, false);
}

export const PersonWithRawMode = () => {
  const veditor = createVEditor(adlex.texprPerson(), RESOLVER, new UiFactory());
  const jsonBinding = createJsonBinding(RESOLVER, adlex.texprPerson());
  const state = useAdlFormState({
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
}

export const  VectorPerson = () => {

  const factory = new UiFactory();
  factory.addCustomVEditor(customizedPersonVector(factory)); 
  const veditor = createVEditor(adlrt.texprVector(adlex.texprPerson()), RESOLVER, factory);
  const state = useAdlFormState({
    veditor
  })
  return renderFormStory(state, false);
}

export const Hierararchy = () => {
  const factory = new UiFactory();
  factory.addCustomVEditor(customizedHierarchyVector(factory)); 
  const veditor = createVEditor(adlex.texprHierarchy(), RESOLVER, factory);
  const jsonBinding = createJsonBinding(RESOLVER, adlex.texprHierarchy());
  const state = useAdlFormState({
    veditor,
    jsonBinding,
    value0: {
      leader: {
        name: {first: "Mike", last: "Mechanic"},
        age: 21,
        gender: {kind:"male"},
        role: "boss"
      },
      underlings: [
        {
          leader: {
            name: {first: "Dave", last: "Electrician"},
            age: 42,
            gender: {kind:"male"},
            role: "doer"
          },
          underlings: [
          ]
        }
      ]
    }
  })
  return renderFormStory(state, false);
}

function renderFormStory<T>(state: AdlFormState<T>, disabled: boolean): JSX.Element {
  return AdlForm({
    state,
    disabled,
    onCancel: () => console.log("onCancel"),
    onApply: (v:T) => console.log("onApply", v),
  });
}