import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../contexts/ThemeContext';

export default function CodeEditor({ language, value, onChange, readOnly }) {
  const { theme } = useTheme();
  const editorRef = useRef(null);

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  return (
    <div className="code-editor-wrapper rounded-xl overflow-hidden border border-[var(--border)]" style={{ height: '100%', minHeight: '400px' }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme={editorTheme}
        onMount={handleMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 12 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          readOnly: readOnly || false,
          bracketPairColorization: { enabled: true },
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
