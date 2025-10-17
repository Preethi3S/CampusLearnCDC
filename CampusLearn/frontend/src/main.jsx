import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import store from './app/store';
import './index.css';

// Import the Inter font
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Set up the root component with all providers
const Root = () => (
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

// Render the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Root />);

// Log the current environment for debugging
console.log(`Running in ${import.meta.env.MODE} mode`);
