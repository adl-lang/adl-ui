import { styled } from "@mui/material";
import React from "react";

interface ModalProps {
  children?: JSX.Element,
  onClickBackground?: () => void,
};

export function Modal(props: ModalProps) {

  function onClick(ev: React.MouseEvent<HTMLDivElement>) {
    const target = (ev.target as Element);
    if (target.id == MODAL_BACKGROUND_ID) {
      props.onClickBackground && props.onClickBackground();
    }
  }

  return (
    <ModalBackground id={MODAL_BACKGROUND_ID} onClick={onClick}>
      <ModalContent>
        {props.children}
      </ModalContent>
    </ModalBackground>
  )
} 

const MODAL_BACKGROUND_ID = "modal-background";


export const ModalBackground = styled('div')({
  position: 'fixed', /* Stay in place */
  zIndex: '1', /* Sit on top */
  left: '0',
  top: '0',
  width: '100%', /* Full width */
  height: '100%', /* Full height */
  overflow: 'auto', /* Enable scroll if needed */
  backgroundColor: 'rgba(0,0,0,0.4)', /* Black w/ opacity */
});

export const ModalContent = styled('div')({
  backgroundColor: '#fefefe',
  margin: '15% auto', /* 15% from the top and centered */
  padding: '20px',
  border: '1px solid #888',
  borderRadius: '5px',
  width: '80%', /* Could be more or less, depending on screen size */
});