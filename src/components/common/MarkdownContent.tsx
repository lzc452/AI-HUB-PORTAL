import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils";

export function MarkdownContent({ markdown, className }: { markdown: string; className?: string }) {
  return <div className={cn("prose prose-neutral max-w-none break-words text-[15px] leading-relaxed prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:underline prose-a:underline-offset-4 prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-xs prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-zinc-900 prose-table:text-[13px]", className)}><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{markdown}</ReactMarkdown></div>;
}
