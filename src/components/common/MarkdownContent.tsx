import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils";

export function MarkdownContent({ markdown, className }: { markdown: string; className?: string }) {
  return <div className={cn("markdown-content", className)}><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{markdown}</ReactMarkdown></div>;
}
