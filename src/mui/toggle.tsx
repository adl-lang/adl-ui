import { Switch } from "@mui/material";

interface ToggleProps {
  disabled?: boolean,
  checked: boolean,
  onChange: () => void;
}

export function Toggle(props: ToggleProps) {
  return (
    <Switch {...props} />
  )
}
