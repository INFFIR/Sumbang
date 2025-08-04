import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Pelaporan from "./pages/Pelaporan";
import Footer from "./components/footer";
import Verifikasi from "./pages/Verifikasi";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Detail from "./pages/Detail";
import ManageUser from "./pages/ManageUser";
import Logout from "./pages/Logout";
import ManageContent from "./pages/ManageContent";
import RiwayatLaporan from "./pages/RiwayanLaporan";
import "./App.css";

function App() {
  return (
    <Router>
      <div id="root">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pelaporan" element={<Pelaporan />} />
            <Route path="/verifikasi" element={<Verifikasi />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/manage-user" element={<ManageUser />} />
            <Route path="/manage-content" element={<ManageContent />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/riwayat-laporan/:id" element={<RiwayatLaporan />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
