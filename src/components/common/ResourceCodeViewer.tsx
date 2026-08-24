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
import type { ResourceFileNode } from "@/types";

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
  const copy = async () => {
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
  return <div className="resource-code-viewer">
    <aside className="resource-file-tree" aria-label="资源文件">
      <header><strong>文件</strong><span>{files.length} 个根节点</span></header>
      <Tree<ResourceFileNode> data={files} width="100%" height={430} rowHeight={34} indent={18} openByDefault disableDrag disableDrop disableEdit disableMultiSelection onActivate={(node) => { if (node.data.type === "file") setSelected(node.data); }}>
        {(props) => <FileTreeNode {...props} selectedPath={selected?.path ?? null} />}
      </Tree>
    </aside>
    <section className="resource-code-panel">
      {selected ? <><header><div><FileCode2 size={15} /><strong>{selected.path}</strong><span>{selected.size ? `${selected.size} B` : selected.language}</span></div><button className="portal-button code-copy-button" onClick={copy}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? "已复制" : "复制"}</button></header><div className="code-scroll-region"><SyntaxHighlighter language={selected.language ?? "text"} style={oneDark} showLineNumbers wrapLongLines={false} customStyle={{ margin: 0, minHeight: "430px", borderRadius: 0, background: "#17181c", fontSize: "12px", lineHeight: "1.7" }} codeTagProps={{ style: { fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace" } }}>{selected.content ?? ""}</SyntaxHighlighter></div></> : <div className="code-empty">请选择一个文件查看内容</div>}
    </section>
  </div>;
}

function FileTreeNode({ node, style, dragHandle, selectedPath }: NodeRendererProps<ResourceFileNode> & { selectedPath: string | null }) {
  const Icon = node.isInternal ? (node.isOpen ? FolderOpen : Folder) : languageIcon(node.data);
  return <div ref={dragHandle} style={style} className={`file-tree-node${selectedPath === node.data.path ? " is-selected" : ""}`} role="treeitem" aria-expanded={node.isInternal ? node.isOpen : undefined} onClick={() => { if (node.isInternal) node.toggle(); else node.activate(); }}><span className="file-tree-chevron">{node.isInternal && <ChevronRight size={13} className={node.isOpen ? "is-open" : ""} />}</span><Icon size={15} /><span title={node.data.path}>{node.data.name}</span></div>;
}
