import React from 'react'
import { footerStyles as fs } from '../assets/dummyStyles';
import logo from '../assets/logo.png';
import { Stethoscope, Mail, Phone, MapPin, ArrowRight, Send, Activity, Globe, Users, Video, MessageCircle } from 'lucide-react';
const Footer = () => {

    const currentYear = new Date().getFullYear();
    const quickLinks = [
        { name: "Home", href: "/" },
        { name: "Doctors", href: "/doctors" },
        // { name: "Services", href: "/services" },
        { name: "Contact", href: "/contact" },
        { name: "Appointments", href: "/appointments" },
    ];

    // const services = [
    //     { name: "Blood Pressure Check", href: "/services" },
    //     { name: "Blood Sugar Test", href: "/services" },
    //     { name: "Full Blood Count", href: "/services" },
    //     { name: "X-Ray Scan", href: "/services" },
    //     { name: "Blood Sugar Test", href: "/services" },
    // ];

    const socialLinks = [
        {
            Icon: Globe,
            color: fs.facebookColor,
            name: "Facebook",
            href: "https://www.facebook.com/people/Hexagon-Digital-Services/61567156598660/",
        },
        {
            Icon: Users,
            color: fs.twitterColor,
            name: "Twitter",
            href: "https://www.linkedin.com/company/hexagondigtial-services/",
        },
        {
            Icon: Video,
            color: fs.instagramColor,
            name: "Instagram",
            href: "http://instagram.com/hexagondigitalservices?igsh=MWp2NG1oNTlibWVnZA%3D%3D",
        },
        {
            Icon: MessageCircle,
            color: fs.linkedinColor,
            name: "LinkedIn",
            href: "https://www.linkedin.com/company/hexagondigtial-services/",
        },
        {
            Icon: Globe,
            color: fs.youtubeColor,
            name: "YouTube",
            href: "https://youtube.com/@hexagondigitalservices?si=lxEFYNCP42t6AoDJ",
        },
    ];
    return (
        <footer className = {fs.footerContainer}>
            <div className = {fs.floatingIcon1}>
                <Stethoscope className = {fs.stethoscopeIcon}/>
            </div>
            <div className = {fs.floatingIcon2} style = {{
                // 3 sec delay
                animationDelay: "3s"
            }}>
                <Activity className = {fs.activityIcon}/>
            </div>
            <div className = {fs.mainContent}>
                <div className = {fs.gridContainer}>
                    <div className = {fs.companySection}>
                        <div className = {fs.logoContainer}>
                            <div className = {fs.logoWrapper}>
                                <div className = {fs.logoImageContainer}>
                                    <img 
                                        src={logo} 
                                        alt = "logo" 
                                        className = {fs.logoImage} 
                                    />
                                </div>
                            </div>
                            <div>
                                <h2 className = {fs.companyName}>
                                    MediCare
                                </h2>
                                <p className = {fs.companyTagline}>
                                    Healthcare Solutions
                                </p>
                            </div>
                        </div>
                        <p className = {fs.companyDescription}>
                            Your Trusted partener in healthcare innovations.
                        </p>
                        <div className = {fs.contactContainer}>
                            <div className = {fs.contactItem}>
                                <div className = {fs.contactIconWrapper}>
                                    <Phone className = {fs.contactIcon}/>
                                </div>
                                <span className = {fs.contactText}> +91 1234567890</span>
                            </div>

                            <div className = {fs.contactItem}>
                                <div className = {fs.contactIconWrapper}>
                                    <Mail className = {fs.contactIcon}/>
                                </div>
                                <span className = {fs.contactText}>mail@gmail.com</span>
                            </div>

                            <div className = {fs.contactItem}>
                                <div className = {fs.contactIconWrapper}>
                                    <MapPin className = {fs.contactIcon}/>
                                </div>
                                <span className = {fs.contactText}>kota , India</span>
                            </div>
                        </div>
                    </div>

                    {/* quickLinks */}
                    <div className = {fs.linksSection}>
                        <h3 className = {fs.sectionTitle}>
                            Quick Links
                        </h3>
                        <ul className = {fs.linksList}>
                            {quickLinks.map((link , index) =>(
                                <li key={link.name} className = {fs.linkItem}>
                                    <a href={link.href}
                                    className = {fs.quickLink}
                                    style={{
                                        animationDelay: `${index * 60}ms`,
                                    }}
                                    >
                                        <div className = {fs.quickLinkIconWrapper}>
                                            <ArrowRight className = {fs.quickLinkIcon}/>
                                        </div>
                                        <span>{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Newsletter & Social */}
                    <div className={fs.newsletterSection}>
                    <h3 className={fs.newsletterTitle}>Stay Connected</h3>
                    <p className={fs.newsletterDescription}>
                        Subscribe for health tips, medical updates, and wellness insights delivered
                        to your inbox.
                    </p>

                    {/* Newsletter form */}
                    <div className={fs.newsletterForm}>
                        <div className={fs.mobileNewsletterContainer}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={fs.emailInput}
                            />
                            <button className={fs.mobileSubscribeButton}>
                                <Send className={fs.mobileButtonIcon} />
                                Subscribe
                            </button>
                            </div>

                            {/* Desktop newsletter */}
                            <div className={fs.desktopNewsletterContainer}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className={fs.desktopEmailInput}
                                />
                                <button className={fs.desktopSubscribeButton}>
                                    <Send className={fs.desktopButtonIcon} />
                                    <span className={fs.desktopButtonText}>Subscribe</span>
                                </button>
                            </div>

                            {/* Social icons */}
                            <div className={fs.socialContainer}>
                                {socialLinks.map(({ Icon, color, name, href }, index) => (
                                    <a
                                    key={name}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={fs.socialLink}
                                    style={{ animationDelay: `${index * 120}ms` }}
                                    >
                                    <div className={fs.socialIconBackground} />
                                    <Icon className={`${fs.socialIcon} ${color}`} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className = {fs.bottomSection}>
                    <div className = {fs.copyright}>
                        <span>&copy; {currentYear} MediCare Healthcare</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;
