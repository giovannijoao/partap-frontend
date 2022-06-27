import React from 'react'
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
const ThemeProvider = ({ children }) => {
  return (
    <ChakraProvider>
      <CSSReset />
      {children}
    </ChakraProvider>
  );
}

export default ThemeProvider;
