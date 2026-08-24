import { CircleAlert, RotateCw } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : "页面加载失败";
  return <main className="portal-page portal-container system-page"><CircleAlert size={42} /><span className="portal-kicker">Portal error</span><h1>暂时无法显示页面</h1><p>{message}</p><button className="portal-button portal-button--primary" onClick={() => window.location.reload()}><RotateCw size={15} />重新加载</button></main>;
}
