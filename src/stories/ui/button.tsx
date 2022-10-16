import styled  from 'styled-components';
import React from "react";

export interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

export const Button =  (props: ButtonProps) => {
  return <button
    disabled={props.disabled}
    onClick={props.onClick}
  >
  {props.children}
  </button>
}