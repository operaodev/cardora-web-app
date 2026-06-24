import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "@/layouts/Layout";
import Home from "@/pages/Home";
import AuthLayout from "@/layouts/AuthLayout";
import Signup from "./pages/Singup";
import Login from "./pages/Login";
import Guest from "./pages/Guest";
import UpgradeGuest from "./pages/UpgradeGuest";

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
