import Editor from '@monaco-editor/react';

interface CodeEditorPanelProps {
  title: string;
  language: 'html' | 'css' | 'json';
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

export default function CodeEditorPanel({
  title,
  language,
  value,
  onChange,
  hint = 'Ctrl+Space for autocomplete'
}: CodeEditorPanelProps) {
  return (
    <div className="h-full border-3 border-black rounded-2xl overflow-hidden flex flex-col">
      <div className="bg-gray-100 px-6 py-4 border-b-2 border-black flex items-center justify-between flex-shrink-0">
        <span className="text-base font-bold">{title}</span>
        <span className="text-sm text-gray-600 font-medium">{hint}</span>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage={language}
          value={value}
          onChange={(value) => onChange(value || '')}
          theme="vs-light"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
}
