
import React from 'react'
import styled from 'styled-components';

import {Factory, StructEditorProps, FieldEditorProps, UnionEditorProps, UnimplementedEditorProps, MaybeEditorProps, VectorEditorProps, CustomContext, VEditorCustomize, FieldCustomize, } from "../lib/veditor/adlfactory";
import {FieldFns} from "../lib/fields/type";
import {  Rendered,  VEditor } from '../lib/veditor/type';
import { typeExprToStringUnscoped } from '../adl-gen/runtime/utils';
import { Select } from "./select.stories";
import { Toggle } from "./toggle.stories";
import { CellContent } from '../lib/adl-table';


export class UiFactory implements Factory {
   veditorCustomize: VEditorCustomize[] = [];
   fieldCustomize: FieldCustomize[] = [];
  
  renderVoidEditor(): Rendered {
    return {};
  }
  
  renderFieldEditor(props: FieldEditorProps): Rendered {
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
  
  
  renderStructEditor(props: StructEditorProps): Rendered {
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
  
  renderUnionEditor(props: UnionEditorProps): Rendered {
  
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
  
  renderMaybeEditor(props: MaybeEditorProps): Rendered {
  
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
  
  renderVectorEditor<T>(props: VectorEditorProps<T>): Rendered {
    const headers = props.columns.map((c) => {
      return <TH key={c.id}>{this.renderContent(c.header)}</TH>;
    });
    const rows = props.values.map((v,i) => {
      const row = props.columns.map( (c) => {
        return <TD key={c.id}>{this.renderContent(c.content(v,i))}</TD>;
      });
      return <TR key={i.toString()}>{row}</TR>;
    });
    const below = (
      <Table>
        <THead><TR>{headers}</TR></THead>
        <TBody>{rows}</TBody>
      </Table>
    );
    return {below};
  }

  renderContent(content: CellContent) {
    return content && content.value;
  }
  
  renderUnimplementedEditor(props: UnimplementedEditorProps): Rendered {
    return {
      beside: <div>unimplemented veditor for {typeExprToStringUnscoped(props.typeExpr)}</div>,
      below: undefined,
      }
  }

  addCustomVEditor(vc : VEditorCustomize) {
    this.veditorCustomize.push(vc);
  }

  addCustomField(fc : FieldCustomize) {
    this.fieldCustomize.push(fc);
  }
  
  getCustomVEditor(ctx: CustomContext): VEditor<unknown> | null {
    for (const c of this.veditorCustomize) {
      const veditor = c(ctx);
      if (veditor != null) {
        return veditor;
      }
    }
    return null;
  }

  getCustomField(ctx: CustomContext): FieldFns<unknown> | null {
    for (const c of this.fieldCustomize) {
      const field = c(ctx);
      if (field != null) {
        return field;
      }
    }
    return null;
  }

}

const Row = styled.div`
display: flex;
flex-direction: row;
align-items: center;
margin-bottom: 5px;
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


