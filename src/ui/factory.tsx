
import React from 'react'
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faArrowUp, faArrowDown, faCirclePlus } from '@fortawesome/free-solid-svg-icons'

import {Factory, StructEditorProps, FieldEditorProps, UnionEditorProps, UnimplementedEditorProps, MaybeEditorProps, VectorEditorProps, CustomContext, VEditorCustomize, FieldCustomize, } from "../model/veditor/adlfactory";
import {FieldFns} from "../model/fields/type";
import { typeExprToStringUnscoped } from '@/adl-gen/runtime/utils';
import { Select } from "./select";
import { Toggle } from "./toggle";
import { CellContent } from '../model/adl-table';
import { createAdlFormState } from './form';
import { AdlForm } from './form';
import { Modal } from './modal';
import { RenderFn, RenderProps, VEditor } from './veditor';

export class UiFactory implements Factory<RenderFn> {
   veditorCustomize: VEditorCustomize<RenderFn>[] = [];
   fieldCustomize: FieldCustomize[] = [];
  
  renderVoidEditor(): RenderFn {
    return () => ({});
  }
  
  renderFieldEditor(props: FieldEditorProps): RenderFn {
    return ({disabled}: RenderProps) => {
      const {fieldfns, state, onUpdate} = props;
      const errlabel = fieldfns.validate(state);
      const beside = (
        <Row>
          <StyledInput value={state} onChange={(s) => onUpdate(s.currentTarget.value)} disabled={disabled}/>
          {errlabel && <StyledError>{errlabel}</StyledError>}
        </Row>
        );
      return {beside};    
    }     
  }
  
  renderStructEditor(props: StructEditorProps<RenderFn>): RenderFn {
    return (rprops: RenderProps) => {
      const rows = props.fields.map(fd => {
        const label = rprops.disabled? fd.label : <b>{fd.label}</b>;
        const rendered = fd.veditor.veditor.render(fd.veditor.state, fd.veditor.onUpdate)(rprops);
        const x = <></>;
        return (
          <React.Fragment key={fd.name}>
            <tr>
              <StructFieldLabel>
                <label>{label}</label>
              </StructFieldLabel>
              {rendered.beside && <StructFieldBeside>{rendered.beside}</StructFieldBeside>}
            </tr>
            {rendered.below && <tr><StructFieldBelow colSpan={2}>{rendered.below}</StructFieldBelow></tr>}
          </React.Fragment>
        );
      });
      const below = (
        <StructContent>
          <tbody>{rows}</tbody>
        </StructContent>
      );
      return {below};
    }
  }
  
  renderUnionEditor(props: UnionEditorProps<RenderFn>): RenderFn {
    return (rprops: RenderProps) => {
      const beside = <Select state={props.selectState}/>;
      if( !props.veditor) {
        return {beside};
      }
      const r = props.veditor.veditor.render(props.veditor.state, props.veditor.onUpdate)(rprops);
      const below = <div>{r.beside}{r.below}</div>;
      return {
        beside,
        below
      }
    }
  }
  
  renderMaybeEditor(props: MaybeEditorProps<RenderFn>): RenderFn {
    return (rprops: RenderProps) => {
      const beside = <Toggle disabled={rprops.disabled} checked={props.isActive} onChange={props.toggleIsActive}/>;
      if (!props.isActive) {
        return {beside};
      }
      const r = props.veditor.veditor.render(props.veditor.state, props.veditor.onUpdate)(rprops);
      const below = <div>{r.beside}{r.below}</div>;
      return {
        beside,
        below
      }
    }
  }
  
  renderVectorEditor<T>(props: VectorEditorProps<T, RenderFn>): RenderFn {
    return (_rprops: RenderProps) => {
      const below = <VectorVeditor {...props}/>;
      return {below}; 
    }
  }
  
  renderUnimplementedEditor(props: UnimplementedEditorProps): RenderFn {
    return (_rprops: RenderProps) => {
      return {
        beside: <div>unimplemented veditor for {typeExprToStringUnscoped(props.typeExpr)}</div>,
        below: undefined,
      }
    }
  }

  addCustomVEditor(vc : VEditorCustomize<RenderFn>) {
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

interface VectorItemFormProps<T> {
  value0: T | undefined,
  veditor: VEditor<T>,
  onApply?(value: T): void;
  onCancel?(): void;
}

function VectorItemForm(props: VectorItemFormProps<unknown>) : JSX.Element {
  const formState = createAdlFormState({
    value0: props.value0,
    veditor: props.veditor,
  });

  return (
    <AdlForm
      state={formState}
      onApply={props.onApply}
      onCancel={props.onCancel}
    />
  );
}

function VectorVeditor<T>(props: VectorEditorProps<T,RenderFn>) {

    interface ModalState {
      value0: T | undefined;
      onApply: (value: T) => void;
  };

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
    setModalState({
      value0: undefined,
      onApply: (t:T) => {
        props.splice(i+1, 0, [t]);
        setModalState(undefined);
    }})
  }

  function editItem(i: number) {
    setModalState({
      value0: props.values[i],
      onApply: (t:T) => {
        props.splice(i, 1, [t]);
        setModalState(undefined);
    }})
  }

  function renderModal() : JSX.Element | undefined {
    if (modalState) {
      return (
        <Modal onClickBackground={() => setModalState(undefined)}>
          <VectorItemForm
            veditor={props.valueVEditor()}
            value0={modalState.value0}
            onApply={v => {
              modalState.onApply(v as T)
            }}
            onCancel={() => setModalState(undefined)}
          />
        </Modal>
      );
    }
  }

  function renderContent(content: CellContent) {
    return content && content.value;
  }

  const headers = props.columns.map((c) => {
    return <TH key={c.id}>{renderContent(c.header)}</TH>;
  });
  const hcontrols = (
    <RowControls>
      <FontAwesomeIcon icon={faCirclePlus} onClick={() => insertItemAfter(props.values.length - 1)}/>
    </RowControls>
  );

  const rows = props.values.map((v,i) => {
    const row = props.columns.map( (c) => {
      return <TD key={c.id}>{renderContent(c.content(v,i))}</TD>;
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

  return (
    <div>
      {renderModal()}
      <Table>
        <THead><TR>{headers}<TH>{hcontrols}</TH></TR></THead>
        <TBody>{rows}</TBody>
      </Table>
    </div>
  );
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


