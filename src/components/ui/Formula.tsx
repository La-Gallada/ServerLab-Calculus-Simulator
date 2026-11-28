import katex from 'katex';
import 'katex/dist/katex.min.css';

export function Formula({ expression, label }: { expression: string; label: string }) {
  return (
    <span
      aria-label={label}
      className="math-formula"
      role="math"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(expression, { throwOnError: false }),
      }}
    />
  );
}
