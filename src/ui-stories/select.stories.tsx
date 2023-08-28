
import { useSelectState, Select } from "../ui/select";

export default {
  title: 'ui/Select', 
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
