import React, { useEffect, useMemo, useState } from 'react'
import { doctorsPageStyles as ds } from '../assets/dummyStyles';
import { Search, X, MousePointer2Off, ChevronRight, Medal, CircleChevronUp } from "lucide-react";
import { Link } from 'react-router-dom';

const DoctorsPage = () => {

  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "")

  // fetch alldoctors fetch the doctor comming from server side 
  const [allDoctors, setAllDoctors] = useState([]);
  // help us in loading state 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // acts as filter
  const [searchTerm, setSearchTerm] = useState("");
  // acts as toggle button
  const [showAll, setShowAll] = useState(false);

  // load doctors coming from server side
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/doctors`);
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          const msg =
            (json && json.message) || `Failed to load doctors (${res.status})`;
          if (mounted) {
            setError(msg);
            setAllDoctors([]);
            setLoading(false);
          }
          return;
        }

        const items = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.doctors)
            ? json.doctors
            : Array.isArray(json)
              ? json
              : [];

        const normalized = items.map((d) => {
          const id = d._id || d.id;
          const image =
            d.imageUrl || d.image || d.imageSmall || d.imageSrc || "/placeholder-doctor.jpg";
          let available = true;
          const availabilityValue = d.availability ?? d.available;
          if (typeof availabilityValue === "string") {
            available = availabilityValue.toLowerCase() === "available";
          } else if (typeof availabilityValue === "boolean") {
            available = availabilityValue;
          } else {
            available = availabilityValue === "Available" || availabilityValue === true;
          }

          return {
            id,
            name: d.name || "Unknown",
            specialization: d.specialization || d.speciality || "",
            image,
            experience: d.experience ?? "—",
            fee: d.fee ?? d.price ?? 0,
            available,
            raw: d,
          };
        });

        if (mounted) {
          setAllDoctors(normalized);
          setError("");
        }
      } catch (err) {
        console.error("load doctors error:", err);
        if (mounted) {
          setError("Network error while loading doctors.");
          setAllDoctors([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [API_BASE]);

  // Derived filtered list 
  const filteredDoctors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allDoctors;
    return allDoctors.filter(
      (doctor) =>
        (doctor.name || "").toLowerCase().includes(q) ||
        (doctor.specialization || "").toLowerCase().includes(q),
    );
  }, [allDoctors, searchTerm]);

  const displayedDoctors = showAll
    ? filteredDoctors
    : filteredDoctors.slice(0, 8);

    // to retry loading from server 
  const retry = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/doctors`);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError((json && json.message) || `Failed to load (${res.status})`);
        setAllDoctors([]);
        return;
      }
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.doctors)
          ? json.doctors
          : Array.isArray(json)
            ? json
            : [];
      const normalized = items.map((d) => {
        const id = d._id || d.id;
        const image = d.imageUrl || d.image || d.imageSmall || d.imageSrc || "/placeholder-doctor.jpg";
        let available = true;
        const availabilityValue = d.availability ?? d.available;
        if (typeof availabilityValue === "string") {
          available = availabilityValue.toLowerCase() === "available";
        } else if (typeof availabilityValue === "boolean") {
          available = availabilityValue;
        } else {
          available = availabilityValue === "Available" || availabilityValue === true;
        }
        return {
          id,
          name: d.name || "Unknown",
          specialization: d.specialization || d.speciality || "",
          image,
          experience: d.experience ?? "—",
          fee: d.fee ?? d.price ?? 0,
          available,
          raw: d,
        };
      });
      setAllDoctors(normalized);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Network error while loading doctors.");
      setAllDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className = {ds.mainContainer}>
      <div className = {ds.backgroundShape1}> </div>
      <div className = {ds.backgroundShape2}></div>
      <div className = {ds.wrapper}>
        <div className = {ds.headerContainer}>
          <h1 className = {ds.headerTitle}>Our Medical Experts </h1>
          <p className = {ds.headerSubtitle}> Find Your doctor by name or specialization</p>
        </div>

        <div className = {ds.searchContainer}>
          <div className = {ds.searchWrapper}>
            <input 
              type="text" 
              placeholder = "Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className = {ds.searchInput}
            />
            {/* add search icon */}
            <Search className = {ds.searchIcon}/>
             {/* agar kuch bhi likha hoga toh clear ka icon laga do */}
            {searchTerm.length >0 &&(
              <button
                onClick={() => setSearchTerm("")}
                className = {ds.clearButton}
              >
                <X size={20}  strokeWidth = {2.5} />
              </button>
            )}
          </div>
        </div>
            {/* iff error occurs */}
        {error && (
          <div className = {ds.errorContainer}>
            <div className = {ds.errorText}>{error}</div>
            <div className = "flex items-center justify-center gap-3">
               {/* retry means wapis load krke dekho */}
              <button onClick={retry} className ={ds.retryButton}>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          // when loading is on going then show blank grid 
          <div className = {ds.skeletonGrid}>
            {Array.from({length:8}).map((_,i) =>(
              <div key={i} className = {ds.skeletonCard}>
                <div className = {ds.skeletonImage}></div>
                <div className = {ds.skeletonName}></div>
                <div className = {ds.skeletonSpecialization}></div>
                <div className = {ds.skeletonButton}></div>
              </div>
            ))}
          </div>
        ) :(
          <div 
            className = {`${ds.doctorsGrid} ${
              filteredDoctors.length === 0 ? "opacity-70" : "opacity-100"
            }`}
          >
            {displayedDoctors.length > 0 ?(
              displayedDoctors.map((doctor , index) =>(
                <div key={doctor.id || `${doctor.name}-${index}`} 
                className = {`${
                  ds.doctorCard
                } ${
                  !doctor.available ? ds.doctorCardUnavailable : ""
                }`} style={{
                  animationDelay: `${index *90}ms `
                }} role = "article">
                  {/* // if doctor is available */}
                  {doctor.available ? (
                    <Link
                      to={`/doctors/${doctor.id}`}
                      state={{ doctor: doctor.raw || doctor }}
                      className={ds.focusRing}
                    >
                      <div className={ds.imageContainer}>
                        <img
                          src={doctor.image || "/placeholder-doctor.jpg"}
                          alt={doctor.name}
                          loading="lazy"
                          className={ds.doctorImage}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholder-doctor.jpg";
                          }}
                        />
                      </div>
                    </Link>
                  ) : (
                    <div
                      className={`${ds.imageContainer} ${ds.imageContainerUnavailable}`}
                    >
                      <img
                        src={doctor.image || "/placeholder-doctor.jpg"}
                        alt={doctor.name}
                        loading="lazy"
                        className={ds.doctorImageUnavailable}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholder-doctor.jpg";
                        }}
                      />
                    </div>
                  )}
                  <h3 className = {ds.doctorName}>
                    {doctor.name}
                  </h3>
                  <p className = {ds.specialization}>
                    {doctor.specialization}
                  </p>
                  <div className = {ds.experienceBadge}>
                    <Medal className = {ds.experienceIcon}/>
                    <span>{doctor.experience || "-"} years Experience</span>
                  </div>
                  {/* when click on book now it takes us to that doctor id  */}
                  {doctor.available ? (
                    <Link to={`/doctors/${doctor.id}`}
                    state = {{doctor: doctor.raw || doctor}}
                    className = {ds.bookButton}
                    >
                      <ChevronRight className={ds.bookButtonIcon}/>
                      Book Now
                    </Link>
                  ) :(
                    <button disabled className = {ds.notAvailableButton}>
                      <MousePointer2Off className={ds.notAvailableIcon}/>
                      Not Available
                    </button>
                  )}
                </div>
              ))
            ):(
              <div className={ds.noResults}>
                No Doctors found matching your result criteria.
              </div>
            )}
          </div>
        )}

        {filteredDoctors.length > 8 &&(
          <div className ={ds.showMoreContainer}>
            <button onClick={() => setShowAll(!showAll)} className = {ds.showMoreButton}>
              {showAll ?(
                <>
                <CircleChevronUp className = {ds.showMoreIcon}/>
                Hide
                </>
              ) :(
                <>
                  <CircleChevronUp className = {ds.showMoreIcon}/>
                  show More
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  )
}

export default DoctorsPage;
