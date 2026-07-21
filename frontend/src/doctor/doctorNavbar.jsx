import React, { useMemo, useState } from 'react'
import { navbarStylesDr as nd } from '../assets/dummyStyles'
import logo from '../assets/logo.png'
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { Calendar, Edit , Home, LogOut, Menu, X } from 'lucide-react';


const DoctorNavbar = () => {
    const [open, setOpen] = useState(false);
    const params = useParams();
    const location = useLocation();
    
    // use params first else extract from the pathname 
    const doctorId = useMemo(() => {
    if (params?.id) return params.id;
    const m = location.pathname.match(/\/doctor-admin\/([^/]+)/);
    if (m) return m[1];
    return null;
  }, [params, location.pathname]);

  const basePath = doctorId
    ? `/doctor-admin/${doctorId}`
    : "/doctor-admin/login";

  const navItems = [
    { name: "Dashboard", to: `${basePath}`, Icon: Home },
    { name: "Appointments", to: `${basePath}/appointments`, Icon: Calendar },
    { name: "Edit Profile", to: `${basePath}/profile/edit`, Icon: Edit },
  ]
  return (
    <>
        <nav className = {nd.navContainer}>
            <div className = {nd.leftBrand}>
                <div className = {nd.logoContainer}>
                    <img src={logo} alt="logo" className = {nd.logoImage}/>
                </div>
                <div className = {nd.brandTextContainer}>
                    <div className = {nd.brandTitle}> MedTek </div>
                    <div className = {nd.brandSubtitle}>
                        Healthcare Solutions
                    </div>
                </div>
            </div>

            {/* desktop navigation */}
            <div className = {nd.desktopMenu}>
                <div className = {nd.desktopMenuItems}>
                    {navItems.map(({name , to , Icon}) =>(
                        <NavLink
                            key={to}
                            to={to}
                            end={to === basePath}
                            className={({ isActive }) =>
                                `${nd.baseLink} ${isActive ? nd.activeLink : nd.inactiveLink}`
                            }
                            onClick={() => setOpen(false)}
                        >
                            <span className = {nd.linkContent}>
                                <Icon size={16} className = {nd.linkIcon}/>
                                <span className = {nd.linkText}> {name} </span>
                            </span>

                        </NavLink>
                    ))}
                </div>
                <div className = {nd.rightActions}>
                    <button onClick={() => {
                        window.location.href = '/doctor-admin/login'
                    }} className = {nd.logoutButtonDesktop}>

                        <LogOut size={16}/>
                        <span>LogOut</span>
                    </button>

                    {/* toggle */}

                    <button 
                        onClick={() => setOpen((s) => !s)} 
                        className = {nd.hamburgerButtonMd}
                    >
                        {open 
                        ? <X size={20} />
                        : <Menu size={20}/>
                        }
                    </button>

                    <button 
                        onClick={() => setOpen((s) => !s)} 
                        className = {nd.hamburgerButtonLg}
                    >
                        {open 
                        ? <X size={20} />
                        : <Menu size={20}/>
                        }
                    </button>

                </div>
            </div>
        </nav>
        <div className= {nd.mobileMenuContainer(open)}>
            <div className = {nd.mobileMenuContent}>
                {navItems.map(({name , to , Icon}) =>(
                    <NavLink 
                        key={to} 
                        to={to} 
                        end={to === basePath}
                        className = {({isActive})=>
                            `${nd.mobileBaseLink} ${
                                isActive
                                    ? nd.mobileActiveLink
                                    : nd.mobileInactiveLink
                            }`
                        } onClick={() => setOpen(false)}
                    >
                        <Icon size={18} className ="text-emerald-400"/>
                        <span>{name}</span>
                    </NavLink>
                ))}     
                <button
                    onClick={()=>{
                        setOpen(false);
                        window.location.href ="/doctor-admin/login";
                    }}
                    className = {nd.mobileLogoutButton}
                >
                    <div className = {nd.mobileLogoutContent}>
                        <LogOut size={16}/>
                        LogOut
                    </div>
                </button>
            </div>
        </div>

        <div className = {nd.spacer}> </div>
    </>
  );
};

export default DoctorNavbar
