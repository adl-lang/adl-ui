
import React from 'react'
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faArrowUp, faArrowDown, faCirclePlus } from '@fortawesome/free-solid-svg-icons'

import {Factory, StructEditorProps, FieldEditorProps, UnionEditorProps, UnimplementedEditorProps, MaybeEditorProps, VectorEditorProps, CustomContext, VEditorCustomize, FieldCustomize, } from "../../lib/veditor/adlfactory";
import {FieldFns} from "../../lib/fields/type";
import {  Rendered,  VEditor } from '../../lib/veditor/type';
import { typeExprToStringUnscoped } from '../../adl-gen/runtime/utils';
import { Select } from "../ui/select";
import { Toggle } from "../ui/toggle";
import { CellContent } from '../../lib/adl-table';
import { AdlFormState, createAdlFormState } from '../../lib/form';
import { AdlForm } from './form';
import { Modal } from './modal';


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
        <tr key={"1_" + fd.name}>
          <StructFieldLabel>
            <label>{label}</label>
          </StructFieldLabel>
          {rendered.beside && <StructFieldBeside>{rendered.beside}</StructFieldBeside>}
        </tr>
        {rendered.below && <tr key = {"2_" + fd.name}><StructFieldBelow colSpan={2}>{rendered.below}</StructFieldBelow></tr>}
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

    interface ModalState {
        onApply: (value: T) => void;
    };

    const formState = createAdlFormState({
      veditor: props.valueVEditor(),
    });
    const [modalState,setModalState] = React.useState<ModalState| undefined>();

    function deleteItem(i: number) {
      props.splice(i, 1, []);
    }
    
    function moveItemUp(i: number) {
      props.splice(i-1, 2, [props.values[i], props.values[i-1]]);
    }
    
    function moveItemDown(i: number) {
      props.splice(i, 2, [props.values[i+1], props.values[i]]);
    }

    function iconColor(enabled: boolean): string {
      return enabled ? "black" : "lightGrey"
    }

    function insertItemAfter(i: number) {
      formState.setValue0(undefined);
      setModalState({
        onApply: (t:T) => {
          props.splice(i+1, 0, [t]);
          setModalState(undefined);
      }})
    }

    function editItem(i: number) {
      formState.setValue0(props.values[i]);
      setModalState({
        onApply: (t:T) => {
          props.splice(i, 1, [t]);
          setModalState(undefined);
      }})
    }

    function renderModal() : JSX.Element | undefined {
      if (modalState) {
        return (
          <Modal onClickBackground={() => setModalState(undefined)}>
            <AdlForm
            state={formState}
            onApply={v => {
              modalState.onApply(v as T)
            }}
            onCancel={() => setModalState(undefined)}
            />
          </Modal>
        );
      }
    }

    const headers = props.columns.map((c) => {
      return <TH key={c.id}>{this.renderContent(c.header)}</TH>;
    });
    const hcontrols = (
      <RowControls>
        <FontAwesomeIcon icon={faCirclePlus} onClick={() => insertItemAfter(props.values.length - 1)}/>
      </RowControls>
    );
    
    const rows = props.values.map((v,i) => {
      const row = props.columns.map( (c) => {
        return <TD key={c.id}>{this.renderContent(c.content(v,i))}</TD>;
      });
      
      const canMoveUp = i > 0;
      const canMoveDown = i < props.values.length - 1;
      
      const controls = (
        <RowControls>
          <FontAwesomeIcon icon={faEdit} onClick={() => editItem(i)}/>
          <FontAwesomeIcon icon={faArrowUp} color={iconColor(canMoveUp)} onClick={() => canMoveUp && moveItemUp(i)}/>
          <FontAwesomeIcon icon={faArrowDown} color={iconColor(canMoveDown)} onClick={() => canMoveDown && moveItemDown(i)}/>
          <FontAwesomeIcon icon={faTrash} onClick={() => deleteItem(i)}/>
        </RowControls>
      );
      return <TR key={i.toString()}>{row}<TD>{controls}</TD></TR>;
    });

    const modal = renderModal();

    const below = (
      <div>
        {modal}
        <Table>
          <THead><TR>{headers}<TH>{hcontrols}</TH></TR></THead>
          <TBody>{rows}</TBody>
        </Table>
      </div>
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
border-radius: 4px;
`;
  
const StyledError = styled.div`
padding-left: calc(2* 8px);
color: #b71c1c;
`;

const Table = styled.table`
   border: 1px solid;
   border-collapse: collapse;
   text-align: left;
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

const RowControls = styled.div`
   display: flex;
   flex-direction: row;
   gap: 5px;
`



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


