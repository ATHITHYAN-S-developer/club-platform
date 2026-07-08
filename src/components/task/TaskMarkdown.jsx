import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ className, children }) {
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');
  return (
    <SyntaxHighlighter
      style={oneDark}
      language={lang || 'text'}
      PreTag="div"
      customStyle={{ borderRadius: '10px', fontSize: '0.85rem', margin: '0.75rem 0' }}
    >
      {code}
    </SyntaxHighlighter>
  );
}

function InlineCode({ children }) {
  return (
    <code
      style={{
        background: 'var(--surface-2)',
        color: 'var(--orange)',
        padding: '0.15rem 0.4rem',
        borderRadius: '4px',
        fontSize: '0.85em',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      {children}
    </code>
  );
}

function Link({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>
      {children}
    </a>
  );
}

function Img({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt || ''}
      style={{ maxWidth: '100%', borderRadius: '10px', margin: '1rem 0' }}
      loading="lazy"
    />
  );
}

export default function TaskMarkdown({ content }) {
  if (!content) return null;
  return (
    <div className="task-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          inlineCode: InlineCode,
          a: Link,
          img: Img,
        }}
      />
      <style>{`
        .task-markdown { line-height: 1.7; font-size: 0.93rem; color: var(--text); }
        .task-markdown h1, .task-markdown h2, .task-markdown h3,
        .task-markdown h4, .task-markdown h5, .task-markdown h6 {
          margin: 1.25rem 0 0.6rem; font-weight: 700; line-height: 1.3;
        }
        .task-markdown h1 { font-size: 1.5rem; }
        .task-markdown h2 { font-size: 1.3rem; color: var(--text); }
        .task-markdown h3 { font-size: 1.1rem; }
        .task-markdown p { margin: 0.6rem 0; }
        .task-markdown ul, .task-markdown ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .task-markdown li { margin: 0.25rem 0; }
        .task-markdown blockquote {
          border-left: 3px solid var(--orange);
          padding: 0.5rem 1rem;
          margin: 0.75rem 0;
          background: var(--surface-2);
          border-radius: 0 8px 8px 0;
          color: var(--text-secondary);
        }
        .task-markdown table {
          width: 100%; border-collapse: collapse; margin: 0.75rem 0;
          font-size: 0.88rem;
        }
        .task-markdown th, .task-markdown td {
          padding: 0.5rem 0.75rem; border: 1px solid var(--border);
          text-align: left;
        }
        .task-markdown th { background: var(--surface-2); font-weight: 600; }
        .task-markdown hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }
        .task-markdown input[type="checkbox"] { margin-right: 0.4rem; accent-color: var(--orange); }
      `}</style>
    </div>
  );
}
