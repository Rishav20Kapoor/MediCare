import React from 'react'
import { bannerStyles as bs } from '../assets/dummyStyles';
import { Stethoscope , Star , Ribbon , Users , Clock , ShieldUser , Calendar , Phone} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import banner from '../assets/BannerImg.png'

const Banner = () => {

    const navigate = useNavigate();
  return (
    <div className = {bs.bannerContainer}>
        <div className = {bs.mainContainer}>
            <div className = {bs.borderOutline}>
                <div className = {bs.outerAnimatedBand}></div>
                <div className = {bs.innerWhiteBorder}></div>

            </div>

            <div className = {bs.contentContainer}>
                <div className = {bs.flexContainer}>
                    <div className = {bs.leftContent}>
                        <div className = {bs.headerBadgeContainer}>
                            <div className = {bs.stethoscopeContainer}>
                                <div className = {bs.stethoscopeInner}>
                                    <Stethoscope className = {bs.stethoscopeIcon}/>
                                </div>
                            </div>

                            <div className = {bs.titleContainer}>
                                <h1 className = {bs.title}>
                                    Medi
                                    <span className = {bs.titleGradient}> Care+ </span>
                                </h1>

                                {/* stars */}
                                <div className = {bs.starsContainer}>
                                    <div className = {bs.starsInner}>
                                        {[1,2,3,4,5].map((star) => (
                                            <Star className = {bs.starIcon} key={star}/>
                                        ))}

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* tagline */}
                        <p className = {bs.tagline}>
                            Premium Healthcare
                            <span className = {`block ${bs.taglineHighlight}`}>
                                At Your Fingertips
                            </span>
                        </p>
                        <div className = {bs.featuresGrid}>
                            <div className = {`${bs.featureItem} ${bs.featureBorderGreen}`}>
                                <Ribbon className = {bs.featureIcon}/>
                                <span className = {bs.featureText}>
                                    Certfied Specialists
                                </span>
                            </div>

                            <div className = {`${bs.featureItem} ${bs.featureBorderBlue}`}>
                                <Clock className = {bs.featureIcon}/>
                                <span className = {bs.featureText}>
                                    24/7 Availability
                                </span>
                            </div>

                            <div className = {`${bs.featureItem} ${bs.featureBorderEmerald}`}>
                                <ShieldUser className = {bs.featureIcon}/>
                                <span className = {bs.featureText}>
                                    Safe &amp; Secure
                                </span>
                            </div>

                            <div className = {`${bs.featureItem} ${bs.featureBorderPurple}`}>
                                <Users className = {bs.featureIcon}/>
                                <span className = {bs.featureText}>
                                    500+ Dcotors
                                </span>
                            </div>
                        </div>

                        <div className = {bs.ctaButtonsContainer}>
                            <button onClick={() => navigate("/doctors")}
                                className = {bs.bookButton}
                            >
                                <div className = {bs.bookButtonOverlay}></div>
                                <div className = {bs.bookButtonContent}>
                                    <Calendar className = {bs.bookButtonIcon}/>
                                    <span> Book Appointment Now</span>
                                </div>
                            </button>

                            <button onClick = {() => (window.location.href = "tel:1234567890")}
                                className = {bs.emergencyButton}
                            >
                                <div className = {bs.emergencyButtonContent}>
                                    <Phone className = {bs.emergencyButtonIcon}/>
                                    <span> Emergency Call </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div classame = {bs.rightImageSection}>
                        <div className = {bs.imageContainer}>
                            <div className = {bs.imageFrame}>
                                <img src = {banner} alt = "banner" className = {bs.image}/>
                            </div>

                        </div>

                    </div>
                </div>
            </div>

        </div>
      
    </div>
  )
}

export default Banner;
