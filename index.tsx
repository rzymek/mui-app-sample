import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5', // Indigo 600
    },
    secondary: {
      main: '#db2777', // Pink 600
    },
    background: {
      default: '#f3f4f6',
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);