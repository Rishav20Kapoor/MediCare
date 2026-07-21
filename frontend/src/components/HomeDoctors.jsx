import React, { useEffect, useState } from 'react'
import { homeDoctorsStyles as hs, iconSize } from '../assets/dummyStyles';
import { Link } from 'react-router-dom';
import { Medal , ChevronRight, MousePointer2Off } from 'lucide-react';

const HomeDoctors = ({previewCount = 8}) => {

    // backend url
    const API_BASE = 'http://localhost:4000'

    const [doctors , setDoctors] = useState([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState("");

    // to fetch doctor comming from server side 
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        // fet doctors 
        const res = await fetch(`${API_BASE}/api/doctors`);
        // store res inside json
        const json = await res.json().catch(() => null);
        // if response is not ok
        if (!res.ok) {
          const msg =
            (json && json.message) || `Failed to load doctors (${res.status})`;
          if (!mounted) return;
          setError(msg);
          setDoctors([]);
          setLoading(false);
          return;
        }
        // create normalized items 
        const items = (json && (json.data || json)) || [];
        const normalized = (Array.isArray(items) ? items : []).map((d) => {
          const id = d._id || d.id;
          const image =
            d.imageUrl || d.image || d.imageSmall || d.imageSrc || "";
          const available =
            (typeof d.availability === "string"
              ? d.availability.toLowerCase() === "available"
              : typeof d.available === "boolean"
                ? d.available
                : d.availability === true) || d.availability === "Available";
          return {
            id,
            name: d.name || "Unknown",
            specialization: d.specialization || "",
            image,
            experience:
              d.experience || d.experience === 0 ? String(d.experience) : "",
            fee: d.fee ?? d.price ?? 0,
            available,
            raw: d,
          };
        });

        if (!mounted) return;
        setDoctors(normalized);
      } 
      catch (err) {
        if (!mounted) return;
        console.error("load doctors error:", err);
        setError("Network error while loading doctors.");
        setDoctors([]);
      }
       finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [API_BASE]);

  // show 8 doctors
  const preview = doctors.slice(0, previewCount);

  return (
    <section className = {hs.section}>
        <div className = {hs.container}>
            <div className = {hs.header}>
                <h1 className = {hs.title}>
                    Our{" "}
                    <span className = {hs.titleSpan}> Medical Team</span>
                </h1>
                <p className = {hs.subtitle}>
                    Book appointment quickly with our verfied  specialists
                </p>
            </div>
            {/* error / retry */}

             {/* SO HERE IT WILL RE FETCH THE API TO GET RESPONSE  */}
            {error ? (
            <div className={hs.errorContainer}>
                <div className={hs.errorText}>{error}</div>
                <button
                onClick={() => {
                    setLoading(true);
                    setError("");
                    (async () => {
                    try {
                        const res = await fetch(`${API_BASE}/api/doctors`);
                        const json = await res.json().catch(() => null);
                        const items = (json && (json.data || json)) || [];
                        const normalized = (Array.isArray(items) ? items : []).map(
                        (d) => {
                            const id = d._id || d.id;
                            const image = d.imageUrl || d.image || "";
                            const available =
                            (typeof d.availability === "string"
                                ? d.availability.toLowerCase() === "available"
                                : typeof d.available === "boolean"
                                ? d.available
                                : d.availability === true) ||
                            d.availability === "Available";
                            return {
                            id,
                            name: d.name || "Unknown",
                            specialization: d.specialization || "",
                            image,
                            experience: d.experience || "",
                            fee: d.fee ?? d.price ?? 0,
                            available,
                            raw: d,
                            };
                        },
                        );
                        setDoctors(normalized);
                        setError("");
                    } catch (err) {
                        console.error(err);
                        setError("Network error while loading doctors.");
                        setDoctors([]);
                    } finally {
                        setLoading(false);
                    }
                    })();
                }}
                className={hs.retryButton}
                >
                Retry
                </button>
            </div>
            ) : null}
            
            {/* if it in loading state */}
            {loading ? (
                <div className = {hs.skeletonGrid}>
                    {/* array of lengthh preview count */}
                    {Array.from({length: previewCount}).map((_,i)=>(
                        <div key={i} className={hs.skeletonCard}>
                            <div className = {hs.skeletonImage}> </div>
                            <div className = {hs.skeletonText1}> </div>
                            <div className = {hs.skeletonText2}> </div>
                            <div className = "flex gap-2 mt-auto">
                                <div className = {hs.skeletonButton}></div>
                            </div>
                        </div>  
                    ))}
                </div>
            ) : (
                <div className = {hs.doctorsGrid}>
                    {preview.map((doctor) =>(
                        <article key = {doctor.id || doctor.name} className = {hs.article}>
                            {doctor.available ?(
                                <Link to={`/doctors/${doctor.id}`}
                                state = {{
                                    doctor: doctor.raw || doctor
                                }}>
                                    <div className = {hs.imageContainerAvailable}>
                                        <img
                                            src={doctor.image || "/placeholder-doctor.jpg"}
                                            alt={doctor.name}
                                            loading="lazy"
                                            className={hs.image}
                                            onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/placeholder-doctor.jpg";
                                            }}
                                        />
                                    </div>
                                
                                </Link>
                            ) :(
                                <div className = {hs.imageContainerUnavailable}>
                                    <img
                                    src={doctor.image || "/placeholder-doctor.jpg"}
                                    alt={doctor.name}
                                    loading="lazy"
                                    className={hs.image}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/placeholder-doctor.jpg";
                                    }}
                                />
                                    <div className = {hs.unavailableBadge}>
                                        Not available
                                    </div>
                                </div>
                            )}

                            {/* body */}
                            <div className = {hs.cardBody}>
                                <h3 className ={hs.doctorName}
                                id = {`doctor-${doctor.id}-name`}
                                >
                                    {doctor.name}
                                </h3> 
                                <p className = {hs.specialization}>
                                    {doctor.specialization}
                                </p>
                                <div className = {hs.experienceContainer}>
                                    <div className = {hs.experienceBadge}>
                                        <Medal className = {`${iconSize.small} h-4`}/>
                                        <span> {doctor.experience} years Experience</span>
                                    </div>
                                </div>
                                <div className = {hs.buttonContainer}>
                                    <div className ="w-full" >
                                        {doctor.available ? (
                                            <Link to={`/doctors/${doctor.id}`} state={{
                                                doctor: doctor.raw || doctor
                                            }} className = {hs.buttonAvailable}>
                                                <ChevronRight className = "w-5 h-5"/>
                                                Book Now
                                            </Link>
                                        ) : (
                                            <button disabled className = {hs.buttonUnavailable}>
                                                <MousePointer2Off className = "w-5 h-5"/>
                                                Not Available
                                            </button>
                                        )}

                                    </div>

                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
        <style>{hs.customCSS}</style>
    </section>
  )
}

export default HomeDoctors;
