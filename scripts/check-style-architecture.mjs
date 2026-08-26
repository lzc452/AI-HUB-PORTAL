import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "src");
const styles = path.join(src, "styles");
const failures = [];

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});

if (!fs.existsSync(styles)) {
  failures.push("src/styles 目录不存在");
} else {
  const styleFiles = fs.readdirSync(styles).filter((name) => fs.statSync(path.join(styles, name)).isFile());
  if (styleFiles.some((name) => name !== "index.css")) {
    failures.push(`src/styles 只允许 index.css，发现：${styleFiles.filter((name) => name !== "index.css").join(", ")}`);
  }
}

const files = walk(src);
const sourceFiles = files.filter((file) => /\.(tsx?|css)$/.test(file));
const legacyClassPattern = /(?:portal|resource|dashboard|home|hunt|package|docs|department|publish|settings?|comments?|login|system|detail|member|status)-/;
const inlineStyleAllowlist = new Set([
  path.normalize("src/components/common/ResourceCodeViewer.tsx"),
]);

for (const file of sourceFiles) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const content = fs.readFileSync(file, "utf8");

  if (/components\.css|pages\.css/.test(content)) {
    failures.push(`${relative} 仍引用已删除的 components.css/pages.css`);
  }

  if (file.endsWith(".css") && /(^|[^\w])\.[A-Za-z][\w-]*\s*[{,]/m.test(content)) {
    failures.push(`${relative} 包含页面级 class selector，请改用 Tailwind utilities`);
  }

  if (file.endsWith(".tsx") && /\bstyle\s*=/.test(content) && !inlineStyleAllowlist.has(path.normalize(relative))) {
    failures.push(`${relative} 使用了未列入白名单的 JSX style 属性`);
  }

  if (file.endsWith(".tsx")) {
    const classValues = [...content.matchAll(/className\s*=\s*(?:"([^"]*)"|`([^`]*)`)/g)].map((match) => match[1] ?? match[2] ?? "");
    if (classValues.some((value) => legacyClassPattern.test(value))) {
      failures.push(`${relative} 仍包含旧页面/BEM class 前缀`);
    }
  }
}

if (failures.length > 0) {
  console.error("样式架构检查失败：");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("样式架构检查通过：Tailwind-first、shadcn-first 约束有效。");
}
