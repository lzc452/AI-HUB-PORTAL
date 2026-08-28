import { copy } from "@/apis/static-data";
import { Search, X } from "lucide-react";
import { useRef, useState, type FocusEvent, type KeyboardEvent, type TransitionEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";

// 收起时仅显示搜索图标；点击后输入框以图标为锚点向左展开，动画结束后聚焦；
// 回车、再次点击图标或失焦时沿原路径收起。
export function ExpandableSearch({
  value,
  placeholder,
  onChange,
  onClear,
  className,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const collapse = () => {
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleIconClick = () => {
    if (open) collapse();
    else setOpen(true);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    // 焦点移到组件内部（如搜索图标）时由点击逻辑决定，移出组件才收起。
    if (!containerRef.current?.contains(event.relatedTarget as Node)) collapse();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") collapse();
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName === "width" && open) inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        "relative h-9 transition-[width] duration-300 ease-out",
        open ? "w-[min(320px,60vw)] max-md:w-[min(280px,calc(100vw-96px))]" : "w-9",
        className
      )}
    >
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-label={placeholder}
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-y-0 left-0 right-9 h-full rounded-full pl-4 pr-10 text-sm shadow-none transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      {value && open && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={copy.search.clear}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClear}
        >
          <X size={14} />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={open ? copy.search.collapse : copy.search.expand}
        aria-expanded={open}
        className={cn(
          "absolute inset-y-0 right-0 z-10 size-9 rounded-full hover:bg-transparent",
          value && !open ? "text-blue-600 hover:text-blue-700" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={handleIconClick}
      >
        <Search size={17} />
      </Button>
    </div>
  );
}
