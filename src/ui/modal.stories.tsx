
import { storiesOf } from '@storybook/react';
import React, { useState } from 'react'
import { Modal } from './modal';
import { Button } from './button';

export default {
  title: 'Modal', 
  component: Modal,
};


export const ModalDemo = () =>  {
  const [active,setActive] = useState<boolean>(false);

  const modal = active && (
    <Modal onClickBackground={() => setActive(false)}>
      <div>Modal</div>
    </Modal>
  );

  return (
    <div>
      {modal}
      <Button onClick={() => setActive(true)}>Show Modal</Button>
    </div>
  );
}

