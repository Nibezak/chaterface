import { UIMessage } from "ai";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import type { ClassAttributes, HTMLAttributes } from "react"; // Import necessary types

// Define the type for props passed to the custom code component
// Combines standard HTML attributes for <code> with react-markdown specific props
type CodeProps = ClassAttributes<HTMLElement> &
  HTMLAttributes<HTMLElement> & {
    node?: any; // Keep node for potential future use, though not used directly now
    inline?: boolean;
  };


// Define the custom code component
const CodeBlock: Components['code'] = ({ node, inline, className, children, ...props }: CodeProps) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      style={atomDark as any}
      customStyle={{
        borderRadius: "10px",
      }}
      language={match[1]}
      PreTag="div"
      codeTagProps={{
        className: "font-mono text-sm"
      }}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (

    <code className={className} {...props}>
      {children}
    </code>
  );
};


export default function Message({ message }: { message: UIMessage }) {

  const baseClass = "w-max max-w-2xl text-sage-12";
  const userClass = "ml-auto";
  const aiClass = "mr-auto";

  const firstAnnotation = message.annotations?.[0];

  // Check if the first annotation exists, is an object, and has the 'model' property
  const modelName = typeof firstAnnotation === 'object' && firstAnnotation !== null && 'model' in firstAnnotation
    ? firstAnnotation.model
    : null;

  return(
    <div className={`${baseClass} ${message.role === "user" ? userClass : aiClass}`}>
      {modelName && (
        <div className="text-sm text-sage-11 font-mono font-medium mb-1">
          {String(modelName)} 
        </div>
      )}
      <ReactMarkdown
        children={message.content}
        components={{ code: CodeBlock }}
      />
    </div>
    );
}