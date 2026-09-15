import React, { useState } from 'react'
import { loginPageStyles as ls , toastStyles } from '../assets/dummyStyles'
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'

const STORAGE_KEY = "doctorToken_v1"

const LoginPage = () => {

    const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
    const[formData , setFormData] = useState({
        email: "",
        password: ""
    })
    const[ busy , setBusy] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) =>{
        setFormData((s)=>({
            ...s,
            [e.target.name] : e.target.value
        }));
    }

    // to login 
    const handleLogin = async (e) =>{
        e.preventDefault();
        if(!formData.email || !formData.password){
            toast.error("All Feilds are Required" ,{
                style: toastStyles.errorToast
            });
            return;
        }

        setBusy(true);
        try{
            const res = await fetch(`${API_BASE}/api/doctors/login`,{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData)
            });
            const json = await res.json().catch(() => null);

            if (!res.ok) {
                const errorMessage = json?.message || json?.error || "Login failed";
                console.error("Doctor login failed:", res.status, errorMessage, json);
                toast.error(errorMessage, { duration: 4000 });
                setBusy(false);
                return;
            }

            const token = json?.token || json?.data?.token;
            if (!token) {
                console.error("Doctor login response missing token:", json);
                toast.error("Authentication token missing", { duration: 4000 });
                setBusy(false);
                return;
            }

            const doctorId =
                json?.data?._id ||
                json?.data?.id ||
                json?.doctor?._id ||
                json?.doctor?.id ||
                json?.data?.doctor?._id ||
                json?.data?.doctor?.id;
            if (!doctorId) {
                console.error("Doctor login response missing id:", json);
                toast.error("Doctor ID missing from server response", { duration: 4000 });
                setBusy(false);
                return;
            }

            localStorage.setItem(STORAGE_KEY, token);
            window.dispatchEvent(
                new StorageEvent("storage", { key: STORAGE_KEY, newValue: token }),
            );
            toast.success("Login successful — redirecting...", {
                style: toastStyles.successToast,
            });
            setTimeout(() => {
                navigate(`/doctor-admin/${doctorId}`);
            }, 700);
        }
        catch(err){
            console.error("login error", err);
            toast.error(`Network error during login: ${err?.message || "Unknown error"}`);
        } finally{
            setBusy(false);
        }
    }


  return (
    <div className = {ls.mainContainer}>
        <ToastContainer position = 'top-right' reverseOrder = {false}/>
        <button onClick={() => navigate("/")} className ={ls.backButton}>
            <ArrowLeft className = {ls.backButtonIcon}/>
            Back to Home
        </button>

        <div className = {ls.loginCard}>
            <div className = {ls.logoContainer}>
                <img src = {logo} alt ="logo" className = {ls.logo}/>
            </div>
            <h2 className = {ls.title}>
                Doctor Admin
            </h2>
            <p className = {ls.subtitle}>
                Sign In to manage your profile & schedule
            </p>

            <form onSubmit={handleLogin} className = {ls.form}>
                <input 
                    type="email" 
                    name = "email" 
                    placeholder = "Email Adrress" 
                    value = {formData.email}
                    onChange={handleChange}
                    className = {ls.input}
                    required
                />
                <input 
                    type="password" 
                    name = "password" 
                    placeholder = "password" 
                    value = {formData.password}
                    onChange={handleChange}
                    className  = {ls.input}
                    required
                />

                <button type="submit" disabled={busy} className = {ls.submitButton}>
                    {/* if busy  */}
                    {busy ? "Signing in..." : "Login"}
                </button>
            </form>
        </div>
    </div>
  )
}

export default LoginPage
