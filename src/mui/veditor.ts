
import {  OVEditor } from '../model/veditor/type';

export interface Rendered {
  // The rendered element
  element(): JSX.Element;
  
  // The the components of the rendered element suitable for insertion
  // into a grid
  gridElement(): RenderedGridItem;
}

export interface RenderedGridItem {
  beside?: JSX.Element, // goes beside the grid label
  below?: GridRow[],    // the rows to be nested below the grid label
}

export type GridRow = WideGridRow | LabelledGridRow;

export type WideGridRow = { kind: 'wide', element: JSX.Element}; 

export interface LabelledGridRow {
  kind: 'labelled',
  label: string,
  element: RenderedGridItem;
};

export interface RenderProps {
  disabled: boolean;
};

export type  RenderFn = (props: RenderProps) => Rendered;

export type VEditor<T> = OVEditor<T,RenderFn>;