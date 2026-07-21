import React from 'react'
import { certificationStyles, certificationStyles as cs } from '../assets/dummyStyles'
import C3 from "../assets/C3.png"
import C1 from "../assets/C1.png"
import C2 from "../assets/C2.png"
import C4 from "../assets/C4.svg"
import C5 from "../assets/C5.png"
import C6 from "../assets/C6.png"
import C7 from "../assets/C7.svg"

const Certification = () => {
    // dummy data 
    const certifications = [
        { id: 1, name: "Medical Commission", image: C1, type: "international" },
        { id: 2, name: "Government Approved", image: C2, type: "government" },
        { id: 3, name: "NABH Accredited", image: C3, alt: "NABH Accreditation", type: "healthcare" },
        { id: 4, name: "Medical Council", image: C4, type: "government" },
        { id: 5, name: "Quality Healthcare", image: C5, alt: "Quality Healthcare", type: "healthcare" },
        { id: 6, name: "Paramedical Council", image: C6, alt: "Patient Safety", type: "healthcare" },
        { id: 7, name: "Ministry of Health", image: C7, alt: "Ministry of Health", type: "government" }
    ];
    const duplicatedCertifications = [
        ...certifications,
        ...certifications,
        ...certifications,
    ];

  return (
    <div className = {cs.container}>
        <div className = {cs.backgroundGrid}>
            <div className = {cs.topLine}></div>
            <div className = {cs.gridContainer}>
                <div className = {cs.grid}>
                    {Array.from({length: 144}) .map((_,i)=> (
                        <div key={i} className = {cs.gridCell}></div>
                    ))}
                </div>
            </div>
        </div>
        <div className = {cs.contentWrapper}>
            <div className = {cs.headingContainer}>
                <div className = {cs.headingInner}>
                    <div className = {cs.leftLine}></div>
                    <div className = {cs.rightLine}></div>
                    <h2 className = {cs.title}>
                        <span className = {cs.titleText}>
                            CERTIFIED & EXCELLENCE
                        </span>
                    </h2>
                </div>

                <p className = {cs.subtitle}>
                    Government recoginized and internationally accredited healthcare standards
                </p>
                <div className = {cs.badgeContainer}>
                    <div className = {cs.badgeDot}></div>
                    <span className = {cs.badgeText}>
                        OFFICIALLY CERTIFIED
                    </span>
                </div>
            </div>
            <div className = {cs.logosContainer}>
                <div className = {cs.logosInner}>
                    <div className = {cs.logosFlexContainer}>
                        <div className = {cs.logosMarquee}>
                            {duplicatedCertifications.map((cert , index) =>(
                                <div key={`cert-${cert.id}-${index}`}
                                    className = {cs.logoItem}>
                                    <div className = "relative">
                                        <img 
                                            src={cert.image} 
                                            alt = {cert.alt}
                                            className = {cs.logoImage}
                                        />
                                    </div>
                                    <span className = {cs.logoText}>
                                        {cert.name}
                                    </span>
                                </div>
                            ))}

                        </div>

                    </div>

                </div>

            </div>
        </div> 
        <style>{cs.animationStyles}</style>
    </div>
  );
};

export default Certification;
