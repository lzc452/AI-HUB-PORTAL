import { Navigate, Outlet, useLocation } from "react-router-dom";

export function AppsDefaultRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  if (params.has("sortBy")) return <Outlet />;
  params.set("sortBy", "score");
  return <Navigate replace to={`/apps?${params.toString()}${location.hash}`} />;
}

export function DepartmentRedirect() {
  const location = useLocation();
  return <Navigate replace to={`/department-zone${location.search}${location.hash}`} />;
}
