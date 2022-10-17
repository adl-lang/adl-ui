import React, { useState } from 'react'
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import * as adlrt  from "../adl-gen/runtime/adl";
import * as adlsys from "../adl-gen/sys/types";


import {RESOLVER} from "../adl-gen/resolver";
import {createVEditor, genericVectorVEditor, CustomContext, Factory, VEditorCustomize } from "../lib/veditor/adlfactory";
import {Column, cellContent} from "../lib/adl-table";
import { VEditor } from '../lib/veditor/type';
import { typeExprsEqual } from '../adl-gen/runtime/utils';
import * as adlex from '../adl-gen/examples';
import { UiFactory } from "./ui/factory";

storiesOf("VEditors", module)
  .add("String", () => {
    const veditor = createVEditor(adlrt.texprString(), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })
  .add("Word16", () => {
    const veditor = createVEditor(adlrt.texprWord16(), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })
  .add("Word16 (disabled)", () => {
    const veditor = createVEditor(adlrt.texprWord16(), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor, true, 13);
  })
  .add("Bool", () => {
    const veditor = createVEditor(adlrt.texprBool(), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })
  .add("Json", () => {
    const veditor = createVEditor(adlrt.texprJson(), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })
  .add("Name", () => {
    const veditor = createVEditor(adlex.texprName(), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  }) 
  .add("Person", () => {
    const veditor = createVEditor(adlex.texprPerson(), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  }) 
  .add("Article", () => {
    const veditor = createVEditor(adlex.texprArticle(), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  }) 
  .add("Gender", () => {
    const veditor = createVEditor(adlex.texprGender(), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  }) 
  .add("Hierarchy", () => {
    const factory = new UiFactory();
    factory.addCustomVEditor(customizedHierarchyVector(factory)); 
    const veditor = createVEditor(adlex.texprHierarchy(), RESOLVER, factory);
    return renderVEditorStory(veditor);
  })
  .add("Maybe<String>", () => {
    const veditor = createVEditor(adlsys.texprMaybe(adlrt.texprString()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })
  .add("Maybe<Word32>", () => {
    const veditor = createVEditor(adlsys.texprMaybe(adlrt.texprWord32()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })
  .add("Maybe<Person>", () => {
    const veditor = createVEditor(adlsys.texprMaybe(adlex.texprPerson()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })   
  .add("Nullable<String>", () => {
    const veditor = createVEditor(adlrt.texprNullable(adlrt.texprString()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })
  .add("Nullable<Word32>", () => {
    const veditor = createVEditor(adlrt.texprNullable(adlrt.texprWord32()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })
  .add("Nullable<Person>", () => {
    const veditor = createVEditor(adlrt.texprNullable(adlex.texprPerson()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor);
  })
  .add("Vector<Name>", () => {
    const initial: adlex.Name[] = [
      {first:"Bart", last:"Simpson"},
      {first:"Lisa", last:"Simpson"},
    ];
    const veditor = createVEditor(adlrt.texprVector(adlex.texprName()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor, false, initial);
  })   
  .add("Vector<Gender>", () => {
    const initial: adlex.Gender[] = [
       {kind:'male'},
       {kind:'female'},
       {kind:'other', value: 'unspecified'},
    ];
    const veditor = createVEditor(adlrt.texprVector(adlex.texprGender()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor, false, initial);
  })   
  .add("Vector<Article>", () => {
    const initial: adlex.Article[] = [
     'definite',
     'indefinite',
    ];
    const veditor = createVEditor(adlrt.texprVector(adlex.texprArticle()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor, false, initial);
  })   
  .add("Vector<Person> (default)", () => {
    const initial: adlex.Person[] = [
      {name:{first:"Bart", last:"Simpson"}, age: 12, role: 'underlying', gender: {kind:'male'}},
      {name:{first:"Lisa", last:"Simpson"}, age: 14, role: 'boss', gender: {kind:'female'}},
    ];
    const veditor = createVEditor(adlrt.texprVector(adlex.texprPerson()), RESOLVER, new UiFactory());
    return renderVEditorStory(veditor, false, initial);
  })   
  .add("Vector<Person> (customized)", () => {
    // Customize the displayed table to include derived columns
    const texpr = adlrt.texprVector(adlex.texprPerson());
    const factory = new UiFactory();
    factory.addCustomVEditor(customizedPersonVector(factory)); 
    const initial: adlex.Person[] = [
      {name:{first:"Bart", last:"Simpson"}, age: 12, role: 'underlying', gender: {kind:'male'}},
      {name:{first:"Lisa", last:"Simpson"}, age: 14, role: 'boss', gender: {kind:'female'}},
    ];
    const veditor = createVEditor(texpr, RESOLVER, factory);
    return renderVEditorStory(veditor, false, initial);
  })   

function renderVEditorStory<T>(veditor: VEditor<T>, disabled?: boolean,  initial?: T): JSX.Element {
  const [state,setState] = useState<unknown>(() => initial === undefined ? veditor.initialState : veditor.stateFromValue(initial));
  const errs = veditor.validate(state);
  const elements = veditor.render(state, disabled || false, e => setState((s:unknown) => veditor.update(s,e)));
  return (
    <Content>
      <Row><HeaderLabel>Value:</HeaderLabel>{elements.beside}</Row>
      {elements.below}
      <hr/>
      {errs.length === 0 
         ? <Valid>Typescript value:<br/><br/>{JSON.stringify(veditor.valueFromState(state), null, 2)}</Valid>
         : <Errors>Errors:<br/><br/>{errs.join("\n")}</Errors>
      }
    </Content>
  );
}

export function customizedPersonVector(factory: Factory): VEditorCustomize {
  return (ctx: CustomContext) => {
    const texpr = adlrt.texprVector(adlex.texprPerson());
    if (typeExprsEqual(ctx.typeExpr, texpr.value)) {
      let columns: Column<adlex.Person, string>[] = [
        {
            header: cellContent("Name"),
            id: "name",
            content: p => cellContent(p.name.first + " " + p.name.last),
        },
        {
            header: cellContent("Age"),
            id: "age",
            content: p => cellContent(p.age + ""),
        },
        {
            header: cellContent("Role"),
            id: "role",
            content: p => cellContent(p.role),
        },
        {
            header: cellContent("Gender"),
            id: "gender",
            content: p => cellContent(p.gender.kind),
        },
      ];
      const valueVEditor = createVEditor(adlex.texprPerson(), RESOLVER, factory);
      return genericVectorVEditor(factory, columns, () => valueVEditor);
    } else {
      return null;
    }
  }
}
export function customizedHierarchyVector(factory: Factory): VEditorCustomize {
  return (ctx: CustomContext) => {
    const texpr = adlrt.texprVector(adlex.texprHierarchy());
    if (typeExprsEqual(ctx.typeExpr, texpr.value)) {
      let columns: Column<adlex.Hierarchy, string>[] = [
        {
            header: cellContent("Leader"),
            id: "name",
            content: p => cellContent(p.leader.name.first + " " + p.leader.name.last),
        },
        {
            header: cellContent("Num underlings"),
            id: "num",
            content: p => cellContent(p.underlings.length + ""),
        },
      ];
      const valueVEditor = createVEditor(adlex.texprHierarchy(), RESOLVER, factory);
      return genericVectorVEditor(factory, columns, () => valueVEditor);
    } else {
      return null;
    }
  }
}


const Content = styled.div`
`;

const Row = styled.div`
display: flex;
flex-direction: row;
align-items: center;
margin-bottom: 5px;
`;

const HeaderLabel = styled.div`
margin-right: 10px;
font-weight: bold;
`;

const Valid = styled.pre`
 color: green;
`;

const Errors = styled.pre`
color: #b71c1c;
`;

const StyledInput = styled.input`
padding: 8px;
border: 1px solid #000;
border-radius: 4px;
`;
  
const StyledError = styled.div`
padding-left: calc(2* 8px);
color: #b71c1c;
`;

