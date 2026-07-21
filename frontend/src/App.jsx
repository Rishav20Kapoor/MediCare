import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Navbar from "./components/Navbar";
import Doctors from './pages/Doctors';
import DoctorDetails from './pages/DoctorDetails';
import Login from './pages/Login';
import DHome from './pages/DHome';
import List from './doctor/List';
import EditProfile from './doctor/EditProfile';
import Appointment from './pages/Appointment';
import VerifyPaymentPage from '../VerifyPaymentPage';


const App = () => {
  return (
    <div>


      <Routes>
        <Route path ="/" element={<Home />} />
        <Route path ="/doctors" element={<Doctors />} />
        <Route path ="/doctors/:id" element={<DoctorDetails/>} />
        <Route path ="/appointments" element={<Appointment/>} />


        {/* Doctors */}
        <Route path ="/doctor-admin/login" element={<Login/>} />
        <Route path ="/doctor-admin/:id" element={<DHome/>} />
        <Route path ="/doctor-admin/:id/appointments" element={<List/>} />
        <Route path ="/doctor-admin/:id/profile/edit" element={<EditProfile/>} />

        {/* For the payment verification */}
        <Route path="/appointment/success" element={<VerifyPaymentPage/>}/>
        <Route path="/appointment/cancel" element={<VerifyPaymentPage/>}/>

      </Routes>
    </div>
    
  )
}

export default App
