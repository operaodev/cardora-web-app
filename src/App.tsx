import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "@/layouts/Layout";
import Home from "@/pages/Home";
import AuthLayout from "@/layouts/AuthLayout";
import Signup from "./pages/Singup";
import Login from "./pages/Login";
import Guest from "./pages/Guest";
import UpgradeGuest from "./pages/UpgradeGuest";
import Marketplace from "./pages/Marketplace";
import Inventory from "./pages/Inventory";
import Wishlist from "./pages/Wishlist";
import ProductPage from "./pages/ProductPage";
import { NotFound } from "./pages/NotFound";
import BundlePage from "./pages/BundlePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/guest" element={<Guest />} />
          <Route path="/guest/verify" element={<UpgradeGuest />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ProductPage />} />
          <Route path="/inventory/me" element={<Inventory />} />
           <Route path="/bundle/me" element={<BundlePage />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
