import React, {useRef, useState, useEffect} from 'react'
import {navbarStyles as ns} from '../assets/dummyStyles'
import {useLocation, Link} from 'react-router-dom'

import {
  useClerk,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/clerk-react';

import {
  User,
  X,
  Menu,
  Key
} from 'lucide-react';

import logo from '../assets/logo.png';





const STORAGE_KEY = "doctorToken_v1";


const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(() => {
        try {
        return Boolean(localStorage.getItem(STORAGE_KEY));
        } catch {
        return false;
        }
    });

  const location = useLocation();
  const navRef = useRef(null);
  const clerk = useClerk();


    /// Hide  and show navbar on scroll 
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // sync the doctor login state
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setIsDoctorLoggedIn(Boolean(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // close the toggle menu for mobile when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);


  const navItems = [
    {label: "Home", href: "/"},
    {label: "Doctors", href: "/doctors"},
    {label: "Appointments", href: "/appointments"},
  ];


  return (
    <>
        <div className = {ns.navbarBorder}></div>

        <nav 
            ref = {navRef}
            className = {`${ns.navbarContainer} ${
                showNavbar ? ns.navbarVisible : ns.navbarHidden
            }`}
        >
            <div className = {ns.contentWrapper}>
                <div className = {ns.flexContainer}>
                    {/* logo */}

                    <Link to = '/' className = {ns.logoLink}>
                        <div className = {ns.logoContainer}>   
                            <div className = {ns.logoImageWrapper}>
                                <img 
                                    src = {logo}
                                    alt = "logo" 
                                    className = {ns.logoImage} 
                                />  

                            </div>
                        </div>

                        <div className = {ns.logoTextContainer}>  
                            <h1 className = {ns.logoTitle}>
                                MediCare
                            </h1>
                            <p className = {ns.logoSubtitle}>
                                Your Health, Our Priority
                            </p>
                        </div>

                    </Link>

                    <div className = {ns.desktopNav}>  
                        <div className = {ns.navItemsContainer}>  
                             {/* upper ke home doctor dashboard wala hai usko reactive banaya hai neeche link ka use krke */}
                            {navItems.map((item) =>{
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link  key ={item.href} to = {item.href} 
                                        className = {`${ns.navItem} ${
                                            isActive 
                                            ? ns.navItemActive
                                            : ns.navItemInactive
                                        }`}
                                    >    
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* right side */}

                    <div className = {ns.rightContainer}> 
                        <SignedOut>
                            <Link to = "/doctor-admin/login" className = {ns.doctorAdminButton}>
                                <User className = {ns.doctorAdminIcon} />
                                <span className = {ns.doctorAdminText}>
                                    Doctor Admin
                                </span>
                            </Link>

                            {/* paitient login */}

                            <button onClick = {()=> clerk.openSignIn()} className = {ns.loginButton}>    
                                <Key className = {ns.loginIcon} />
                                Login
                            </button>
                        </SignedOut>

                        <SignedIn>
                            {/* // after signout it take us to home page */}
                            <UserButton afterSignOutUrl = "/"/>
                        </SignedIn>  
                        
                        {/* button create krdiya hai jbh screen size chota hoga toh jo right side wala toggle ho jayega */}
                        {/* toggle */}

                        <button onClick = {() => setIsOpen(!isOpen)} className = {ns.mobileToggle}>   
                            { isOpen ?(
                                // x aa jayega jbh click hoga (open hoga)
                                <X className = {ns.toggleIcon}/>   
                            ) :(
                                // nhi toh option ayega 
                                <Menu className = {ns.toggleIcon}/>
                            )}
                        </button>

                    </div>
                </div>

                {/* mobile navigation  */}
                {isOpen && (
                    <div className = {ns.mobileMenu}>
                        {navItems.map((item,idx) => {
                            const isActive = location.pathname === item.href;
                            return(
                                <Link key={idx} to = {item.href}
                                    onClick ={() => setIsOpen(false)}
                                    className = {`${ns.mobileMenuItem} ${
                                        isActive
                                        ? ns.mobileMenuItemActive
                                        : ns.mobileMenuItemInactive
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}

                        <SignedOut>
                            <Link to = "/doctor-admin/login" className = {ns.mobileDoctorAdminButton}
                                onClick = {() => setIsOpen(false)}
                            >
                                Doctor Admin
                            </Link>

                            <div className = {ns.mobileLoginContainer}>   
                                <button onClick = { () => {
                                    setIsOpen(false);
                                    clerk.openSignIn();
                                }} className = {ns.mobileLoginButton}>    
                                    Login
                                </button>
                            </div>
                        </SignedOut>
                    </div>
                )}

            </div>

            <style>{ns.animationStyles}</style>
        </nav>
    </>
  );
};

export default Navbar;
