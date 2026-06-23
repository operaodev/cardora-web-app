import { Outlet } from "react-router-dom";
import LayoutMobile from "./mobile/LayoutMobile";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-svh">
      <LayoutMobile />
      <Outlet />
    </div>
  )
}