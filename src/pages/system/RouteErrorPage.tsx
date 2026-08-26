import { CircleAlert, RotateCw } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : "页面加载失败";
  return <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-5 py-12 text-center"><CircleAlert className="size-11 text-destructive" /><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Portal error</span><h1 className="text-3xl font-semibold tracking-[-0.04em]">暂时无法显示页面</h1><p className="max-w-xl text-sm text-muted-foreground">{message}</p><Button className="mt-2" onClick={() => window.location.reload()}><RotateCw size={15} />重新加载</Button></main>;
}
