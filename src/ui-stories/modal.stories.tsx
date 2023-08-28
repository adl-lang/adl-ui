
import { useState } from 'react'
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

export default {
  title: 'ui/Modal', 
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

