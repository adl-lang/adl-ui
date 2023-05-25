
import { useSelectState } from "./select";
import { Select } from './select';

export default {
  title: 'Select', 
  component: Select,
};

export const BasicSelect = () =>  {
  const state = useSelectState(
    0,
    [
      "value1",
      "value2",
      "value3",
    ],
  );
  return <Select state={state}/>;
}
