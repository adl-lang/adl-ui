import React, { useState } from 'react'
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import * as adlrt  from "../adl-gen/runtime/adl";
import * as adlsys from "../adl-gen/sys/types";


import {RESOLVER} from "../adl-gen/resolver";
import {createVEditor, genericVectorVEditor, Factory, StructEditorProps, FieldEditorProps, UnionEditorProps, UnimplementedEditorProps, MaybeEditorProps, VectorEditorProps, CustomContext} from "../lib/veditor/adlfactory";
import {Column, cellContent} from "../lib/adl-table";
import {  Rendered,  VEditor } from '../lib/veditor/type';
import { typeExprToStringUnscoped, typeExprsEqual } from '../adl-gen/runtime/utils';
import * as adlex from '../adl-gen/examples';
import { Select } from "./select.stories";
import { Toggle } from "./toggle.stories";
import { CellContent } from '../lib/adl-table';

storiesOf("VEditors", module)
  .add("String", () => {
    const veditor = createVEditor(adlrt.texprString(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Word16", () => {
    const veditor = createVEditor(adlrt.texprWord16(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Word16 (disabled)", () => {
    const veditor = createVEditor(adlrt.texprWord16(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor, true, 13);
  })
  .add("Bool", () => {
    const veditor = createVEditor(adlrt.texprBool(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Json", () => {
    const veditor = createVEditor(adlrt.texprJson(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Name", () => {
    const veditor = createVEditor(adlex.texprName(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  }) 
  .add("Person", () => {
    const veditor = createVEditor(adlex.texprPerson(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  }) 
  .add("Gender", () => {
    const veditor = createVEditor(adlex.texprGender(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  }) 
  .add("Hierarchy", () => {
    const veditor = createVEditor(adlex.texprHierarchy(), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Maybe<String>", () => {
    const veditor = createVEditor(adlsys.texprMaybe(adlrt.texprString()), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Maybe<Word32>", () => {
    const veditor = createVEditor(adlsys.texprMaybe(adlrt.texprWord32()), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Maybe<Person>", () => {
    const veditor = createVEditor(adlsys.texprMaybe(adlex.texprPerson()), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })   
  .add("Nullable<String>", () => {
    const veditor = createVEditor(adlrt.texprNullable(adlrt.texprString()), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Nullable<Word32>", () => {
    const veditor = createVEditor(adlrt.texprNullable(adlrt.texprWord32()), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Nullable<Person>", () => {
    const veditor = createVEditor(adlrt.texprNullable(adlex.texprPerson()), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor);
  })
  .add("Vector<Name>", () => {
    const initial: adlex.Name[] = [
      {first:"Bart", last:"Simpson"},
      {first:"Lisa", last:"Simpson"},
    ];
    const veditor = createVEditor(adlrt.texprVector(adlex.texprName()), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor, false, initial);
  })   
  .add("Vector<Gender>", () => {
    const initial: adlex.Gender[] = [
       {kind:'male'},
       {kind:'female'},
    ];
    const veditor = createVEditor(adlrt.texprVector(adlex.texprGender()), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor, false, initial);
  })   
  .add("Vector<Person> (default)", () => {
    const initial: adlex.Person[] = [
      {name:{first:"Bart", last:"Simpson"}, age: 12, role: 'underlying', gender: {kind:'male'}},
      {name:{first:"Lisa", last:"Simpson"}, age: 14, role: 'boss', gender: {kind:'female'}},
    ];
    const veditor = createVEditor(adlrt.texprVector(adlex.texprPerson()), RESOLVER, VEDITOR_FACTORY);
    return renderVEditorStory(veditor, false, initial);
  })   
  .add("Vector<Person> (customized)", () => {
    // Customize the displayed table to show the columns we want.
    const texpr = adlrt.texprVector(adlex.texprPerson());
      const factory = {
       ...VEDITOR_FACTORY,
      getCustomVEditor(ctx: CustomContext) {
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
            const valueVEditor = createVEditor(adlex.texprPerson(), RESOLVER, VEDITOR_FACTORY);
            return genericVectorVEditor(factory, columns, valueVEditor);
         }
         return null;
      },
    }
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
         ? <Valid>Value:<br/><br/>{JSON.stringify(veditor.valueFromState(state), null, 2)}</Valid>
         : <Errors>Errors:<br/><br/>{errs.join("\n")}</Errors>
      }
    </Content>
  );
}

const Content = styled.div`
  font-size: 14px;
  font-family: sans-serif;
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
font-size: 14px;
font-family: sans-serif;
border-radius: 4px;
`;
  
const StyledError = styled.div`
padding-left: calc(2* 8px);
font-family: sans-serif;
font-size: 14px;
color: #b71c1c;
`;

const VEDITOR_FACTORY: Factory = {
  getCustomVEditor : () => null,
  getCustomField : () => null,
  renderFieldEditor,
  renderStructEditor,
  renderUnionEditor,
  renderMaybeEditor,
  renderVoidEditor,
  renderVectorEditor,
  renderUnimplementedEditor,
};

function renderVoidEditor(): Rendered {
  return {};
}

function renderFieldEditor(props: FieldEditorProps): Rendered {
  const {fieldfns, disabled, state, onUpdate} = props;
  const errlabel = fieldfns.validate(state);
  const beside = (
    <Row>
      <StyledInput value={state} onChange={(s) => onUpdate(s.currentTarget.value)} disabled={disabled}/>
      {errlabel && <StyledError>{errlabel}</StyledError>}
    </Row>
    );
  return {beside};         
}


function renderStructEditor(props: StructEditorProps): Rendered {
  const rows = props.fields.map(fd => {
    const label = props.disabled? fd.label : <b>{fd.label}</b>;
    const rendered = fd.veditor.veditor.render(fd.veditor.state, props.disabled, fd.veditor.onUpdate);
    return (
      <>
      <tr key={fd.name}>
        <StructFieldLabel>
          <label>{label}</label>
        </StructFieldLabel>
        {rendered.beside && <StructFieldBeside>{rendered.beside}</StructFieldBeside>}
      </tr>
      {rendered.below && <StructFieldBelow colSpan={2}>{rendered.below}</StructFieldBelow>}
      </>
    );
  });
  const below = (
    <StructContent>
      <tbody>{rows}</tbody>
    </StructContent>
  );
  return {below};
}

function renderUnionEditor(props: UnionEditorProps): Rendered {

   const beside = <Select state={props.selectState}/>;
   if( !props.veditor) {
     return {beside};
   }
   const r = props.veditor.veditor.render(props.veditor.state, props.disabled, props.veditor.onUpdate);
   const below = <div>{r.beside}{r.below}</div>;
   return {
    beside,
    below
  }
}

function renderMaybeEditor(props: MaybeEditorProps): Rendered {

  const beside = <Toggle disabled={props.disabled} checked={props.isActive} onChange={props.toggleIsActive}/>;
  if (!props.isActive) {
    return {beside};
  }
  const r = props.veditor.veditor.render(props.veditor.state, props.disabled, props.veditor.onUpdate);
  const below = <div>{r.beside}{r.below}</div>;
  return {
   beside,
   below
 }
}

function renderVectorEditor<T>(props: VectorEditorProps<T>): Rendered {
  const headers = props.columns.map((c) => {
    return <TH>{renderContent(c.header)}</TH>;
  });
  const rows = props.values.map((v,i) => {
    const row = props.columns.map( (c) => {
      return <TD>{renderContent(c.content(v,i))}</TD>;
    });
    return <TR>{row}</TR>;
  });
  const below = (
    <Table>
      <THead><TR>{headers}</TR></THead>
      <TBody>{rows}</TBody>
    </Table>
  );
  return {below};
}

function renderContent(content: CellContent) {
  return content && content.value;
}

const Table = styled.table`
   border: 1px solid;
   border-collapse: collapse;
`;

const THead = styled.thead`
   background: lightgray;
`;

const TBody = styled.tbody``;

const TR = styled.tr`
   border: 1px solid;
`;

const TD = styled.td`
   padding: 8px;
`;

const TH = styled.th`
   padding: 8px;
`;



const StructContent = styled.table`
  border-collapse: collapse;
  border-style: hidden;
`;

const StructFieldLabel = styled.td`
  padding: 5px;
`;

const StructFieldBeside = styled.td`
  padding: 5px;
`;

const StructFieldBelow = styled.td`
  padding-left: 50px;
`;


function renderUnimplementedEditor(props: UnimplementedEditorProps): Rendered {
  return {
    beside: <div>unimplemented veditor for {typeExprToStringUnscoped(props.typeExpr)}</div>,
    below: undefined,
    }
}
