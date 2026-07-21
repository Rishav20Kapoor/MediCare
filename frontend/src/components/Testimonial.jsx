import React, { useEffect, useRef, useState } from 'react'
import { testimonialStyles as ts } from '../assets/dummyStyles'
import { Star } from "lucide-react";

const Testimonial = () => {

  const scrollRefLeft = useRef(null);
  const scrollRefRight = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const testimonials = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      text: "The appointment booking system is incredibly efficient. It saves me valuable time and helps me focus on patient care.",
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      type: "doctor",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Patient",
      text: "Scheduling appointments has never been easier. The interface is intuitive and reminders are very helpful!",
      image:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80",
      type: "patient",
    },
    {
      id: 3,
      name: "Dr. Robert Martinez",
      role: "Pediatrician",
      text: "This platform has streamlined our clinic operations significantly. Patient management is much more organized.",
      image:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80",
      type: "doctor",
    },
    {
      id: 4,
      name: "Emily Williams",
      role: "Patient",
      text: "Booking appointments online 24/7 is a game-changer. The confirmation system gives me peace of mind.",
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      type: "patient",
    },
    {
      id: 5,
      name: "Dr. Amanda Lee",
      role: "Dermatologist",
      text: "Excellent platform for managing appointments. Automated reminders reduce no-shows dramatically.",
      image:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80",
      type: "doctor",
    },
    {
      id: 6,
      name: "David Thompson",
      role: "Patient",
      text: "The wait time has reduced significantly since using this platform. Very convenient and user-friendly!",
      image:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80",
      type: "patient",
    },
  ];

  const leftTestimonials = testimonials.filter((t) => t.type === "doctor");
  const rightTestimonials = testimonials.filter((t) => t.type === "patient");

  useEffect(() => {
    // animation speed for the testimonial
    const scrollLeft = scrollRefLeft.current;
    const scrollRight = scrollRefRight.current;
    if (!scrollLeft || !scrollRight) return;

    let scrollSpeed = 0.5; // preserved animation speed
    let rafId;

    const smoothScroll = () => {
      if (!isPaused) {
        scrollLeft.scrollTop += scrollSpeed;
        scrollRight.scrollTop -= scrollSpeed;

        // seamless infinite loop
        if (scrollLeft.scrollTop >= scrollLeft.scrollHeight / 2) {
          scrollLeft.scrollTop = 0;
        }
        if (scrollRight.scrollTop <= 0) {
          scrollRight.scrollTop = scrollRight.scrollHeight / 2;
        }
      }
      rafId = requestAnimationFrame(smoothScroll);
    };

    rafId = requestAnimationFrame(smoothScroll);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused]);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={
          i < rating
            ? ts.activeStar
            : ts.inactiveStar
        }
      >
        <Star className={ts.star} />
      </span>
    ));

    // testimonial card
  const TestimonialCard = ({ testimonial, direction }) => (
    <div
      className={`${ts.testimonialCard} ${
        direction === "left"
          ? ts.leftCardBorder
          : ts.rightCardBorder
      }`}
    >
      <div className={ts.cardContent}>
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className={ts.avatar}
        />
        <div className={ts.textContainer}>
          <div className={ts.nameRoleContainer}>
            <div>
              <h4
                className={`${ts.name} ${
                  direction === "left"
                    ? ts.leftName
                    : ts.rightName
                }`}
              >
                {testimonial.name}
              </h4>
              <p className={ts.role}>{testimonial.role}</p>
            </div>
            <div className={ts.starsContainer}>
              {renderStars(testimonial.rating)}
            </div>
          </div>

          <p className={ts.quote}>"{testimonial.text}"</p>

          {/* Stars on small screens beneath text */}
          <div className={ts.mobileStarsContainer}>
            {renderStars(testimonial.rating)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className = {ts.container}>
        <div className = {ts.headerContainer}>
            <h2 className = {ts.title}>
                Voice of Trust
            </h2>
            <p className = {ts.subtitle}>
                Real Stories from doctors and patitent sharing their posiitve 
                experience with our healthcare platform.
            </p>
        </div>
        <div 
            className = {ts.grid}
            onMouseEnter = {() => setIsPaused(true)}
            onMouseLeave = {() => setIsPaused(false)}
        >
            <div className = {`${ts.columnContainer} ${ts.leftColumnBorder}`}>
                <div className = {`${ts.columnHeader} ${ts.leftColumnHeader}`}>
                    👩‍⚕️ Medical Professionals
                </div>

                <div 
                    onTouchStart ={() => setIsPaused(true)} 
                    onTouchEnd ={() => setIsPaused(false)} 
                    ref={scrollRefLeft}
                    className = {ts.scrollContainer}
                >
                    {[
                        ...leftTestimonials , ...leftTestimonials].map((t,i) =>(
                        <TestimonialCard 
                            key = {`L-${i}`} 
                            testimonial={t} 
                            direction = "left"
                        />
                    ))}
                </div>
            </div>
            <div className = {`${ts.columnContainer} ${
                ts.rightColumnBorder
            }`}>
                <div className = {`${ts.columnHeader} ${ts.rightColumnHeader}`}>
                    🧑‍💼 Patients
                </div>

                <div ref={scrollRefRight} className = {ts.scrollContainer}
                    onTouchStart = {() => setIsPaused(true)}
                    onTouchEnd = {() =>setIsPaused(false)}
                >
                    {[...rightTestimonials, ...rightTestimonials].map((t,i)=>(
                        <TestimonialCard 
                            key = {`R-${i}`} 
                            testimonial={t} 
                            direction = "right"
                        />
                    ))}

                </div>
            </div>
        </div>
        <style>{ts.animationStyles}</style>
    </div>
  );
};

export default Testimonial;
