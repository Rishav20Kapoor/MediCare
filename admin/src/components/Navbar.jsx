import React, {useState, useRef , useEffect , useCallback , useLayoutEffect } from 'react';
import { navbarStyles as ns } from '../assets/dummyStyles';
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";
import logoImg from "../assets/logo.png";
import {Home , UserPlus , Users , Calendar , Grid , PlusSquare , List , X , Menu} from "lucide-react";
import { useAuth , useClerk , useUser } from "@clerk/clerk-react";


const Navbar = () => {
    // define state
    const[open , setOpen] = useState(false);
    const navInnerRef = useRef(null);
    const indicatorRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // clerk
    const clerk = useClerk();
    const {getToken , isLoaded: authLoaded} = useAuth();
    const {isSignedIn , user , isLoaded: userLoaded} = useUser();



    // sliding active indicator ///// /////         /////

const moveIndicator = useCallback(() => {
    const container = navInnerRef.current;
    const ind = indicatorRef.current;
    if (!container || !ind) return;

    const active = container.querySelector(".nav-item.active");
    if (!active) {
      ind.style.opacity = "0";
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    const left = activeRect.left - containerRect.left + container.scrollLeft;
    const width = activeRect.width;

    ind.style.transform = `translateX(${left}px)`;
    ind.style.width = `${width}px`;
    ind.style.opacity = "1";
  }, []);

  // it will be moving in 0.12 sec   moving in x axis 
  useLayoutEffect(() => {
    moveIndicator();
    const t = setTimeout(() => {
      moveIndicator();
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname, moveIndicator]);

  useEffect(() => {
    const container = navInnerRef.current;
    if (!container) return;

    const onScroll = () => {
      moveIndicator();
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      moveIndicator();
    });
    ro.observe(container);
    if (container.parentElement) ro.observe(container.parentElement);

    window.addEventListener("resize", moveIndicator);

    moveIndicator();

    return () => {
      container.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", moveIndicator);
    };
  }, [moveIndicator]);

  // it will  toggle the mobile menu  when we click the escape button it collapse(close)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);


  ///  when user is signed in , dfetch a token and save in the local storage

  useEffect(() =>{
    let mounted = true;
    const storeToken = async() =>{
        if(!authLoaded || !userLoaded) return;
        if(!isSignedIn){  // if user deosnt signed in
            try {
                localStorage.removeItem("clerk_token")
            } 
            catch (e) {
                // ignore any error  
            }
            return;
        }

        try {
            if(getToken){
                const token = await getToken();
                if(!mounted) return;
                if(token){
                    try {
                        localStorage.setItem("clerk_token" , token);
                    } catch (e) {
                        console.warn("Failed to write clerk token in local Storage" ,e);
                    }
                }
            }
        } 
        catch (err) {
            console.warn("Could not retrieve Clerk token" , err);
        }
    }
    storeToken();
    return() =>{
        mounted = false;
    }
  } , [isSignedIn , authLoaded , userLoaded , getToken]);  // do this for the isSignedIn or authloaded or userloaded or gettoeken 


  // to open clerk signin
const handleOpenSignIn = async () =>{
    if(!clerk || typeof clerk.openSignIn !== "function"){
        console.warn("Clerk is not available");
        return;
    }

    try {
        await clerk.openSignIn({
            redirectUrl: "/h",
            redirectUrlComplete: "/h",
        });
    } catch (err) {
        console.error("Sign In Failed", err);
    }
}

// to signout

const handleSignOut = async () =>{
    if(!clerk || typeof clerk.signOut !== "function"){
        console.warn("clerk is not available");
        return;
    }
    try {
        await clerk.signOut();
    }
    catch (err) {
        console.error("Sign Out Failed" , err);
    }
    finally{
        try {
            localStorage.removeItem("clerk_token");  // local storage get empty when we loged out 
        } 
        catch (e) {
            // ignore
        }
        navigate("/");
    }
};

    return (
        <header className = {ns.header}>
            <nav className = {ns.navContainer}>
                <div className = {ns.flexContainer}>
                    <div className = {ns.logoContainer}>
                        <img src = {logoImg} alt = "logo" className = {ns.logoImage}/>

                        <Link to = "/">
                            <div className = {ns.logoLink}>MediCare</div> 
                            <div className = {ns.logoSubtext}> Healthcare Solutions</div>
                        </Link>
                    </div>

                    {/* center Navigation */}
                    <div className = {ns.centerNavContainer}>
                        <div className= {ns.glowEffect}>
                            <div className ={ns.centerNavInner}>
                                <div ref={navInnerRef} tabIndex = {0} className = {ns.centerNavScrollContainer}
                                style = {{
                                    WebkitOverflowScrolling: "touch"
                                }}>
                                    <CenterNavItem
                                        to="/h"
                                        label="Dashboard"
                                        icon={<Home size={16} />}
                                    />
                                    <CenterNavItem
                                        to="/add"
                                        label="Add Doctor"
                                        icon={<UserPlus size={16} />}
                                    />
                                    <CenterNavItem
                                        to="/list"
                                        label="List Doctors"
                                        icon={<Users size={16} />}
                                    />
                                    <CenterNavItem
                                        to="/appointments"
                                        label="Appointments"
                                        icon={<Calendar size={16} />}
                                    />
                                  
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* right side */}
                    <div className = {ns.rightContainer}>
                        {/* auth */}
                        {isSignedIn ? (
                            <button onClick = {handleSignOut} className = {ns.signOutButton + " " + ns.cursorPointer}>
                                Sign Out
                            </button>
                        ) :(
                            <div className = "hidden lg:flex item-center gap-2">
                                <button onClick = { handleOpenSignIn }
                                className = {ns.loginButton + " " + ns.cursorPointer}
                                >
                                    Login
                                </button>
                                
                            </div>
                        )}

                        {/* mobile toggle */}

                        <button onClick = {() => setOpen((v) => !v)} className = {ns.mobileMenuButton}>
                            {open ? < X siz={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>

                {/* mobile navigatin menu */}

                {open &&  (
                    <div className = {ns.mobileOverlay} onClick = {() => setOpen(false)} />
                )}

                {open && (
                    <div className = {ns.mobileMenuContainer} id = "mobile-menu">
                        <div className = {ns.mobileMenuInner}>
                            <MobileItem
                                to="/h"
                                label="Dashboard"
                                icon={<Home size={16} />}
                                onClick={() => setOpen(false)}
                            />

                            <MobileItem
                                to="/add"
                                label="Add Doctor"
                                icon={<UserPlus size={16} />}
                                onClick={() => setOpen(false)}
                            />
                            <MobileItem
                                to="/list"
                                label="List Doctors"
                                icon={<Users size={16} />}
                                onClick={() => setOpen(false)}
                            />
                            <MobileItem
                                to="/appointments"
                                label="Appointments"
                                icon={<Calendar size={16} />}
                                onClick={() => setOpen(false)}
                            />

                            <div className = {ns.mobileAuthContainer}>
                                {isSignedIn ? (
                                    <button onClick={() =>{
                                        handleSignOut();
                                        setOpen(false);
                                    }} className = {ns.mobileSignOutButton}>
                                        Sign Out
                                    </button>
                                ) : (
                                    <div className = "space-y-2">
                                        <button onClick = {() =>{
                                            handleOpenSignIn();
                                            setOpen(false);
                                        }} className = {ns.mobileLoginButton + " " + ns.cursorPointer}
                                        >
                                            Login
                                        </button>

                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                )} 

            </nav>

        </header>
    );
};

export default Navbar


function CenterNavItem({to , icon , label}){
    return(
        <NavLink 
            to = {to}  
            className = {({isActive}) =>
                `nav-item ${ isActive ? "active" : ""} ${ns.centerNavItemBase} ${
                    isActive ? ns.centerNavItemActive : ns.centerNavItemInactive
                }`
            }
        >
            <span>{icon}</span>
            <span className = "font-medium">{label}</span>
        </NavLink>
    );
}

function MobileItem ({to , icon , label , onClick}){
    return(
        <NavLink 
            to={to} 
            onClick={onClick} 
            className = {({isActive}) =>
                `${ns.mobileItemBase} ${
                    isActive ? ns.mobileItemActive : ns.mobileItemInactive
                }`
            }
        >
            {icon}
            <span className = "font-medium text-sm"> {label} </span>
        </NavLink>
    );
}
