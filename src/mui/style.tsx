import React from 'react';
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
:root {
  --font: sans-serif;
  --font-size: 14px;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font);
  font-size:  var(--font-size);
}

button {
  font-family: var(--font);
  font-size: var(--font-size);
}

input {
  font-family: var(--font);
  font-size: var(--font-size);
}

select {
  font-family: var(--font);
  font-size: var(--font-size);
}

`;
