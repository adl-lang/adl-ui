
import { useSelectState, Select } from "../mui/select";

export default {
  title: 'mui/Select', 
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
