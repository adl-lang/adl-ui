import { useState } from 'react'
import * as adlrt  from "@/adl-gen/runtime/adl";
import * as adlsys from "@/adl-gen/sys/types";

import {RESOLVER} from "@/adl-gen/resolver";
import {createVEditor, genericVectorVEditor, CustomContext, Factory, VEditorCustomize } from "../model/veditor/adlfactory";
import {Column, cellContent} from "../model/adl-table";
import { RenderFn, VEditor } from '../mui/veditor';
import { typeExprsEqual } from '@/adl-gen/runtime/utils';
import * as aa from '@/adl-gen/adlator';
import { UiFactory } from "../mui/factory";
import { Box, styled } from '@mui/material';

export default {
  title: 'mui/Adlator',
  includeStories: /^[A-Z]/,    // Stories are exports with upper case names
};


  
export const Step1 = () => {
  // Customize the displayed table to include derived columns
  const texpr = adlrt.texprVector(aa.texprStep1());
  const factory = new UiFactory();
  const initial: aa.Step1[] = [
    aa.makeStep1({value: aa.makePerson({name: aa.makeName({first:"Bart", last:"Simpson"}), age: 12, role: 'underlying', gender: {kind:'male'}})}),
    aa.makeStep1({value: aa.makePerson({name: aa.makeName({first:"Lisa", last:"Simpson"}), age: 14, role: 'boss', gender: {kind:'female'}})}),
  ];
  const veditor = createVEditor(texpr, RESOLVER, factory);
  return renderVEditorStory(veditor, false, initial);
}

export const Step2 = () => {
  // Customize the displayed table to include derived columns
  const texpr = adlrt.texprVector(aa.texprStep2());
  const factory = new UiFactory();
  const initial: aa.Step2[] = [
    aa.makeStep2({name: aa.makeName({first:"Bart", last:"Simpson"}), age: 12, role: 'underlying', gender: {kind:'male'}}),
  ];
  const veditor = createVEditor(texpr, RESOLVER, factory);
  return renderVEditorStory(veditor, false, initial);
}

export const Step3 = () => {
  // Customize the displayed table to include derived columns
  const texpr = adlrt.texprVector(aa.texprStep3());
  const factory = new UiFactory();
  const initial: aa.Step3[] = [
    aa.makeStep3({name: aa.makeName({first:"Bart", last:"Simpson"}), age: 12, role: 'underlying', gender: {kind:'male'}}),
  ];
  const veditor = createVEditor(texpr, RESOLVER, factory);
  return renderVEditorStory(veditor, false, initial);
}

export const Step4 = () => {
  // Customize the displayed table to include derived columns
  const texpr = adlrt.texprVector(aa.texprStep4());
  const factory = new UiFactory();
  const initial: aa.Step4[] = [
    aa.makeStep4({name: aa.makeName({first:"Bart", last:"Simpson"}), age: 12, role: 'underlying', gender: 'male'}),
  ];
  const veditor = createVEditor(texpr, RESOLVER, factory);
  return renderVEditorStory(veditor, false, initial);
}


function renderVEditorStory<T>(veditor: VEditor<T>, disabled?: boolean,  initial?: T): JSX.Element {
  const [state,setState] = useState<unknown>(() => initial === undefined ? veditor.initialState : veditor.stateFromValue(initial));
  const vv = veditor.valueFromState(state);
  const rprops = {disabled: !!disabled};
  const renderv = veditor.render(state, e => setState((s:unknown) => veditor.update(s,e)))(rprops);
  return (
    <div>
      {renderv.element()}
      <Box sx={{height:"20px"}}/>
      <hr/>
      {vv.isValid 
         ? <Valid>Typescript value:<br/><br/>{JSON.stringify(vv.value)}</Valid>
         : <Errors>Errors:<br/><br/>{vv.errors.join("\n")}</Errors>
      }
    </div>
  );
}



const Valid = styled('pre')({
  color: 'green'
});

const Errors = styled('pre')({
  color: '#b71c1c'
});

