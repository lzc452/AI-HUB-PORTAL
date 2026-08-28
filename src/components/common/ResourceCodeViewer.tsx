import { Check, ChevronRight, Clipboard, FileCode2, FileJson2, FileText, Folder, FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { Tree, type NodeRendererProps } from "react-arborist";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { copy, interpolate } from "@/apis/static-data";
import type { ResourceFileNode } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);

function findFirstFile(nodes: ResourceFileNode[]): ResourceFileNode | null {
  for (const node of nodes) {
    if (node.type === "file") return node;
    const child = node.children ? findFirstFile(node.children) : null;
    if (child) return child;
  }
  return null;
}

function languageIcon(node: ResourceFileNode) {
  if (node.type === "directory") return Folder;
  if (node.language === "json") return FileJson2;
  if (node.language === "markdown") return FileText;
  return FileCode2;
}

export function ResourceCodeViewer({ files }: { files: ResourceFileNode[] }) {
  const initialFile = useMemo(() => findFirstFile(files), [files]);
  const [selected, setSelected] = useState<ResourceFileNode | null>(initialFile);
  const [copied, setCopied] = useState(false);
  const copyContent = async () => {
    if (!selected?.content) return;
    try {
      await navigator.clipboard.writeText(selected.content);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = selected.content;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return <div data-testid="resource-code-viewer" className="grid grid-cols-[250px_minmax(0,1fr)] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 max-md:grid-cols-1">
    <aside className="min-w-0 border-r border-zinc-700 bg-zinc-800 max-md:border-r-0 max-md:border-b" aria-label={copy.codeViewer.resourceFiles} data-testid="resource-file-tree">
      <header className="flex h-12 items-center justify-between gap-3 border-b border-zinc-700 px-3 text-xs"><strong>{copy.codeViewer.files}</strong><span className="text-[10px] text-zinc-400">{interpolate(copy.codeViewer.rootNodes, { count: files.length })}</span></header>
      <div className="max-md:!h-[230px] max-md:max-h-[230px] max-md:overflow-hidden"><Tree<ResourceFileNode> data={files} width="100%" height={430} rowHeight={34} indent={18} openByDefault disableDrag disableDrop disableEdit disableMultiSelection onActivate={(node) => { if (node.data.type === "file") setSelected(node.data); }}>
        {(props) => <FileTreeNode {...props} selectedPath={selected?.path ?? null} />}
      </Tree></div>
    </aside>
    <section className="min-w-0" data-testid="resource-code-panel">
      {selected ? <><header className="flex h-12 items-center justify-between gap-3 border-b border-zinc-700 px-3 text-xs"><div className="flex min-w-0 items-center gap-2"><FileCode2 size={15} /><strong className="truncate">{selected.path}</strong><span className="text-[10px] text-zinc-400">{selected.size ? `${selected.size} B` : selected.language}</span></div><Button variant="outline" size="sm" className="h-8 shrink-0 border-zinc-600 bg-zinc-800 px-2.5 text-[11px] text-zinc-200 hover:bg-zinc-700 hover:text-white" onClick={copyContent}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? copy.codeViewer.copied : copy.codeViewer.copy}</Button></header><div className="max-h-[430px] max-w-full overflow-auto max-md:max-h-[390px]"><SyntaxHighlighter language={selected.language ?? "text"} style={oneDark} showLineNumbers wrapLongLines={false} customStyle={{ margin: 0, minHeight: "430px", borderRadius: 0, background: "#17181c", fontSize: "12px", lineHeight: "1.7" }} codeTagProps={{ style: { fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace" } }}>{selected.content ?? ""}</SyntaxHighlighter></div></> : <div className="grid min-h-[430px] place-items-center text-xs text-zinc-400">{copy.codeViewer.selectFile}</div>}
    </section>
  </div>;
}

function FileTreeNode({ node, style, dragHandle, selectedPath }: NodeRendererProps<ResourceFileNode> & { selectedPath: string | null }) {
  const Icon = node.isInternal ? (node.isOpen ? FolderOpen : Folder) : languageIcon(node.data);
  return <div ref={dragHandle} style={style} className={cn("flex w-full select-none items-center gap-1.5 px-2 pr-2 text-xs text-zinc-300 hover:bg-zinc-700", selectedPath === node.data.path && "bg-zinc-700 text-white")} role="treeitem" aria-expanded={node.isInternal ? node.isOpen : undefined} onClick={() => { if (node.isInternal) node.toggle(); else node.activate(); }}><span className="grid size-[13px] place-items-center">{node.isInternal && <ChevronRight size={13} className={cn("transition-transform duration-150", node.isOpen && "rotate-90")} />}</span><Icon size={15} /><span className="min-w-0 truncate" title={node.data.path}>{node.data.name}</span></div>;
}
