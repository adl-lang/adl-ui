
import {  OVEditor } from '../model/veditor/type';

export interface Rendered {
  // Content to be shown beside a label
  beside?: JSX.Element;

  // Content to be shown indented below the label. 
  below?: JSX.Element;
}

export interface RenderProps {
  disabled: boolean;
};

export type  RenderFn = (props: RenderProps) => Rendered;

export type VEditor<T> = OVEditor<T,RenderFn>;