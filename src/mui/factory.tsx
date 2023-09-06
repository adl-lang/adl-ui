
import React from 'react'
import styled from 'styled-components';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

import {Factory, StructEditorProps, FieldEditorProps, UnionEditorProps, UnimplementedEditorProps, MaybeEditorProps, VectorEditorProps, CustomContext, VEditorCustomize, FieldCustomize, } from "../model/veditor/adlfactory";
import {FieldFns} from "../model/fields/type";
import { typeExprToStringUnscoped } from '@/adl-gen/runtime/utils';
import { Select } from "./select";
import { Toggle } from "./toggle";
import { CellContent } from '../model/adl-table';
import { createAdlFormState } from './form';
import { AdlForm } from './form';
import { Modal } from './modal';
import { GridRow, Rendered, RenderFn, RenderProps, VEditor } from './veditor';
import { Box, TextField } from '@mui/material';

export function fieldElement(element:JSX.Element): Rendered {
  return {
    element: () => {return element},
    gridElement: () => {return {beside:element}},
  };    
}

export function wideFieldElement(element:JSX.Element): Rendered {
  return {
    element: () => {return element},
    gridElement: () => {return {below: [{kind:'wide', element}]}},
  };    
}
  
 
export class UiFactory implements Factory<RenderFn> {
   veditorCustomize: VEditorCustomize<RenderFn>[] = [];
   fieldCustomize: FieldCustomize[] = [];
  
  renderVoidEditor(): RenderFn {
    return () => fieldElement(<div/>);
  }
  
  renderFieldEditor(props: FieldEditorProps): RenderFn {
    return ({disabled}: RenderProps) => {
      const {fieldfns, state, onUpdate} = props;
      const errlabel = fieldfns.validate(state);
      const element = (
        <TextField 
          size="small" 
          fullWidth
          error={!!errlabel}
          helperText={errlabel} 
          value={state} 
          onChange={(s) => onUpdate(s.currentTarget.value)} 
          disabled={disabled}
        />
        );
      return fieldElement(element);
    }
  }
  
  renderStructEditor(props: StructEditorProps<RenderFn>): RenderFn {
    return (rprops: RenderProps) => {
      const rows: GridRow[] = props.fields.map(fd => {
        const label = rprops.disabled? fd.label : <b>{fd.label}</b>;
        const rendered = fd.veditor.veditor.render(fd.veditor.state, fd.veditor.onUpdate)(rprops);
        const element = rendered.gridElement();
        return {kind:'labelled', label, element} as GridRow
      });

      return {
        element: () => {
          return <StructGrid>{renderStructRows(0, rows)}</StructGrid>;
        },
        gridElement: () => {
          return {
            below: rows
          }
        }
      }
    }
  }
  
  renderUnionEditor(props: UnionEditorProps<RenderFn>): RenderFn {
    return (rprops: RenderProps) => {
      const select= <Select state={props.selectState}/>;
      const underlying = props.veditor && props.veditor.veditor.render(props.veditor.state, props.veditor.onUpdate)(rprops);
      return {
        element: () => {
          return <div>{select}{underlying?.element()}</div>;
        },
        gridElement: () => {
          const ugrid = underlying?.gridElement();
          const below = !ugrid
            ? []
            : [
              ...wideGridRow(ugrid.beside),
              ...(ugrid.below || [])
            ];
          return {
            beside: select,
            below,
          }
        },
      }
    }
  }
  
  renderMaybeEditor(props: MaybeEditorProps<RenderFn>): RenderFn {
    return (rprops: RenderProps) => {
      const toggle = <Toggle disabled={rprops.disabled} checked={props.isActive} onChange={props.toggleIsActive}/>;
      const underlying = props.veditor.veditor.render(props.veditor.state, props.veditor.onUpdate)(rprops);
      return {
        element: () => {
          return <div>{toggle}{props.isActive && underlying.element()}</div>;
        },
        gridElement: () => {
          const ugrid = underlying.gridElement();
          const below = !props.isActive
            ? []
            : [
              ...wideGridRow(ugrid.beside),
              ...(ugrid.below || [])
            ];
          return {
            beside: toggle,
            below,
          }
        },
      }
    }
  }
  
  renderVectorEditor<T>(props: VectorEditorProps<T, RenderFn>): RenderFn {
    return (_rprops: RenderProps) => wideFieldElement(<VectorVeditor {...props}/>);
  }
  
  renderUnimplementedEditor(props: UnimplementedEditorProps): RenderFn {
    return (_rprops: RenderProps) => wideFieldElement(
      <div>unimplemented veditor for {typeExprToStringUnscoped(props.typeExpr)}</div>,
    )
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
      <AddIcon onClick={() => insertItemAfter(props.values.length - 1)}/>
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
        <EditIcon onClick={() => editItem(i)}/>
        <ArrowUpwardIcon onClick={() => canMoveUp && moveItemUp(i)}/>
        <ArrowDownwardIcon onClick={() => canMoveDown && moveItemDown(i)}/>
        <DeleteIcon onClick={() => deleteItem(i)}/>
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

function wideGridRow(element: JSX.Element | undefined): GridRow[] {
  if (element) {
    return [{kind:'wide', element}];
  }
  return [];
}

function renderStructRows(indent: number, rows: GridRow[]): JSX.Element[] {
  const elements: JSX.Element[] = [];
  const indentElement = indent == 0 ? undefined : <Box sx={{width:`${indent * 30}px`}} />;
  for(const row of rows) {
    if (row.kind === 'wide') {
      elements.push(
        <StructGridWideValue>{indentElement}{row.element}</StructGridWideValue>
      );
    } else if (row.kind === 'labelled') {
      elements.push(
        <>
          <StructGridLabel>{indentElement}{row.label}</StructGridLabel>
          {row.element.beside && <StructGridValue>{row.element.beside}</StructGridValue>}
        </>
      );
      if (row.element.below) {
        elements.push(...renderStructRows(indent+1,row.element.below));
      }
    }
  }
  return elements;
}

const StructGrid = styled.div`
   display: grid;
   grid-template-columns: auto 1fr;
  grid-column-gap: 20px;
`;

const StructGridLabel = styled.div`
   display: flex;
   flex-direction: row;
   grid-column-start: 1;
   grid-column-end: 1;
   align-self: center;
   margin: 10px 0px 10px 0px;
`;

const StructGridValue = styled.div`
   grid-column-start: 2;
   grid-column-end: 2;
   margin-top: 10px;
`;

const StructGridWideValue = styled.div`
   display: flex;
   flex-direction: row;
   grid-column-start: 1;
   grid-column-end: 3;
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
