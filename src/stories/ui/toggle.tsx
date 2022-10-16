import React from "react";

interface ToggleProps {
  disabled?: boolean,
  checked: boolean,
  onChange: () => void;
}

export function Toggle(props: ToggleProps) {
  return (
    <label>
      <input type="checkbox" disabled={props.disabled} checked={props.checked} onChange={props.onChange}/>
      <span/>
    </label>
  )
}

