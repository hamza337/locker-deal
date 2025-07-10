import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './pages/auth/login/login';
import RoleSelection from './pages/auth/role/RoleSelection';
import BrandForm from './pages/auth/forms/BrandForm'
import AthleteForm from './pages/auth/forms/AthleteForm'
import Otp from './pages/auth/otp/Otp';
import Layout from './components/layout';
import Dashboard from './pages/dashboard/Dashboard';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<RoleSelection />} />
        <Route path="/signup/athlete" element={<AthleteForm />} />
        <Route path="/signup/brand" element={<BrandForm />} />
        <Route path="/verify-otp" element={<Otp />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
