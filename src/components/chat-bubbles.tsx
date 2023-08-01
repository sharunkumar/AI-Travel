import { CodeBlock } from "~/lib/codeblock";
import { MemoizedReactMarkdown } from "~/lib/markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useEffect, useRef } from "react";

export function AIChatBubble(props: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView();
    }
  }, [ref]);

  return (
    <div ref={ref} className="col-start-1 col-end-8 rounded-lg p-3">
      <div className="flex flex-row items-start">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-solid border-indigo-500 dark:bg-indigo-500">
          AI
        </div>
        <div className="relative ml-3 rounded-xl bg-zinc-900 px-4 py-4 text-sm shadow">
          <MemoizedReactMarkdown
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              code({ node, inline, className, children, ...props }) {
                if (children.length) {
                  if (children[0] == "▍") {
                    return (
                      <span className="mt-1 animate-pulse cursor-default">
                        ▍
                      </span>
                    );
                  }

                  children[0] = (children[0] as string).replace("`▍`", "▍");
                }

                const match = /language-(\w+)/.exec(className || "");

                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ""}
                    value={String(children).replace(/\n$/, "")}
                    {...props}
                  />
                );
              },
            }}
          >
            {props.text}
          </MemoizedReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function UserChatBubble(props: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView();
    }
  }, [ref]);

  return (
    <div ref={ref} className="col-start-6 col-end-13 rounded-lg p-3">
      <div className="flex flex-row-reverse items-start justify-start">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-solid border-indigo-800 dark:bg-indigo-800">
          Me
        </div>
        <div className="relative mr-3 rounded-xl bg-zinc-900 px-4 py-4 text-sm shadow">
          <MemoizedReactMarkdown
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              code({ node, inline, className, children, ...props }) {
                if (children.length) {
                  if (children[0] == "▍") {
                    return (
                      <span className="mt-1 animate-pulse cursor-default">
                        ▍
                      </span>
                    );
                  }

                  children[0] = (children[0] as string).replace("`▍`", "▍");
                }

                const match = /language-(\w+)/.exec(className || "");

                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ""}
                    value={String(children).replace(/\n$/, "")}
                    {...props}
                  />
                );
              },
            }}
          >
            {props.text}
          </MemoizedReactMarkdown>
        </div>
      </div>
    </div>
  );
}
