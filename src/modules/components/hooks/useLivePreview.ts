"use client";

/**
 * useLivePreview Hook
 * Generates an iframe srcdoc for live React component preview with Babel JSX transformation
 */

import { useState, useEffect, useRef } from "react";

interface UseLivePreviewResult {
  srcdoc: string;
  error: string | null;
  isLoading: boolean;
}

const DEBOUNCE_MS = 300;

function generateSrcdoc(code: string): string {
  const escapedCode = code
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root {
      width: 100%;
      height: 100%;
      background-color: #0d0f13;
      color: #cbd5e1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #root {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .error-box {
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid #ef4444;
      border-radius: 8px;
      padding: 16px;
      max-width: 100%;
    }
    .error-box h3 { color: #ef4444; font-size: 14px; margin-bottom: 8px; }
    .error-box pre { color: #fca5a5; font-size: 12px; white-space: pre-wrap; font-family: monospace; }
    .empty-state { color: #64748b; font-size: 14px; }
    .loading { color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div id="root"><div class="loading">Loading preview...</div></div>

  <!-- Babel for JSX transformation -->
  <script src="https://unpkg.com/@babel/standalone@7.24.0/babel.min.js"></script>

  <!-- React UMD builds -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <script>
    (function() {
      const root = document.getElementById('root');
      const reactRoot = ReactDOM.createRoot(root);

      function showError(title, message) {
        root.innerHTML = '<div class="error-box"><h3>' + title + '</h3><pre>' + message + '</pre></div>';
      }

      function showEmpty(message) {
        root.innerHTML = '<div class="empty-state">' + message + '</div>';
      }

      // Error Boundary
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }
        static getDerivedStateFromError(error) {
          return { hasError: true, error };
        }
        render() {
          if (this.state.hasError) {
            return React.createElement('div', { className: 'error-box' },
              React.createElement('h3', null, 'Render Error'),
              React.createElement('pre', null, this.state.error?.message || 'Unknown error')
            );
          }
          return this.props.children;
        }
      }

      try {
        const code = \`${escapedCode}\`;

        if (!code || !code.trim()) {
          showEmpty('Enter component code to preview');
          return;
        }

        // Clean up the code for transformation
        let cleanCode = code;

        // Remove import statements
        cleanCode = cleanCode.replace(/^\\s*import\\s+.*?from\\s+['"].*?['"];?\\s*$/gm, '');
        cleanCode = cleanCode.replace(/^\\s*import\\s+['"].*?['"];?\\s*$/gm, '');

        // Transform export default function Name to function Name
        cleanCode = cleanCode.replace(/export\\s+default\\s+function\\s+(\\w+)/g, 'function $1');
        cleanCode = cleanCode.replace(/export\\s+default\\s+function\\s*\\(/g, 'function PreviewComponent(');

        // Transform export function to function
        cleanCode = cleanCode.replace(/export\\s+function\\s+(\\w+)/g, 'function $1');

        // Transform export const to const
        cleanCode = cleanCode.replace(/export\\s+const\\s+(\\w+)/g, 'const $1');

        // Remove trailing export default Name
        cleanCode = cleanCode.replace(/export\\s+default\\s+(\\w+)\\s*;?\\s*$/gm, '');

        // Find component name
        let componentName = null;
        const funcMatch = cleanCode.match(/function\\s+([A-Z][a-zA-Z0-9]*)\\s*\\(/);
        const constMatch = cleanCode.match(/const\\s+([A-Z][a-zA-Z0-9]*)\\s*=/);

        if (funcMatch) {
          componentName = funcMatch[1];
        } else if (constMatch) {
          componentName = constMatch[1];
        }

        if (!componentName) {
          showError('No Component Found', 'Could not find a React component. Make sure your code exports a function component with a PascalCase name.');
          return;
        }

        // Wrap code to return the component
        const wrappedCode = cleanCode + '\\n;' + componentName + ';';

        // Transform JSX with Babel
        const transformed = Babel.transform(wrappedCode, {
          presets: ['react'],
          filename: 'component.jsx'
        }).code;

        // Evaluate the transformed code
        const Component = eval(transformed);

        if (typeof Component !== 'function') {
          showError('Invalid Component', 'Component must be a function. Got: ' + typeof Component);
          return;
        }

        // Render with error boundary
        reactRoot.render(
          React.createElement(ErrorBoundary, null,
            React.createElement(Component)
          )
        );

      } catch (error) {
        showError('Syntax Error', error.message || 'Failed to parse component');
      }
    })();
  </script>
</body>
</html>`;
}

export function useLivePreview(code: string): UseLivePreviewResult {
  const [debouncedCode, setDebouncedCode] = useState(code);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Derive loading state from whether code differs from debounced code
  const isLoading = code !== debouncedCode;

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedCode(code);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code]);

  // Generate srcdoc - errors are handled inside the iframe
  const srcdoc = generateSrcdoc(debouncedCode);

  return { srcdoc, error: null, isLoading };
}
