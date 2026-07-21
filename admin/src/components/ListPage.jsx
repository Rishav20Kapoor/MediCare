import React, { useEffect, useMemo, useState } from 'react'
import { doctorListStyles as ds } from '../assets/dummyStyles';
import Navbar from './Navbar';
import { BadgeIndianRupee, Search, Trash2, Trash2Icon, Users } from 'lucide-react';
// helper funcitons 

// this wll change the date from iso format to a more readable format like "12 Jan 2024"
function formatDateISO(iso) {
  // if already in readable format or not a string, return as is
  if (!iso || typeof iso !== "string") return iso;
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  // create date object  ans m-1 jan - 0 , feb - 1
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(Number(d));
  const month = monthNames[dateObj.getMonth()] || "";
  return `${day} ${month} ${y}`;
}

// normalize a date string to "YYYY-MM-DD" format, or return null if invalid
//Every JavaScript Date stores time as milliseconds since January 1, 1970.
function normalizeToDateString(d) {
  if (!d) return null;
  const dt = new Date(d);
  // if date invalid return NaN
  if (Number.isNaN(dt.getTime())) return null;
  // 2026-07-02T00:00:00.000Z change in string slpit in two half from T and only take kfirst half 
  return dt.toISOString().split("T")[0];
}

// schedule Map   normalize scheduled map ex - "YYYY-MM-DD" : array slot [slot 1 , slot2 , ....]
// also convert slot to array slots 

// This kind of data normalization makes the rest of your appointment logic simpler and safer because it can always assume the schedule has a consistent structure.
function buildScheduleMap(schedule) {
  const map = {};
  if (!schedule || typeof schedule !== "object") return map;
  // k == date and v = time  and schedule is whole object 
  Object.entries(schedule).forEach(([k, v]) => {
    // normalize date 
    const nd = normalizeToDateString(k) || String(k);
    // check if v is array 
    // v.slice prevents mutation of original array and creates a new array with same elements
    map[nd] = Array.isArray(v) ? v.slice() : [];
  });
  return map;
}

const List = () => {

  // using backend url 
  const API_BASE = "http://localhost:4000/api";
  // use state hooks 

  // serach doctor 
  const [doctors, setDoctors] = useState([]);
  // to get more details abou doctor
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState("");
  // show all show less
  const [showAll, setShowAll] = useState(false);
  // all the doctor and filter accordingly 
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  // help toggling in mobile screen
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // manage to resize the screen
  useEffect(() => {
    function onResize() {
      if (typeof window === "undefined") return;
      setIsMobileScreen(window.innerWidth < 640);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // to fetch the dcotor
  async function fetchDoctors() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/doctors`);
      const body = await res.json().catch(() => null);
      // if response is ok and body is not emoty and success is true 
      if (res.ok && body && body.success) {
        // check if its actually an array or onot 
        const list = Array.isArray(body.data)
          // if yes 
          ? body.data
          // check another prop
          : Array.isArray(body.doctors)
          ? body.doctors
          : [];
          //  loop through ever doctor 
        const normalized = list.map((d) => {
          // if d.schedule exist normalized it  if not then return {}
          const scheduleMap = buildScheduleMap(d.schedule || {});

          // create a new dcotor object 
          // onluy scheduled changes other things remains same due to ....d spread operator 
          return {
            ...d,
            schedule: scheduleMap,
          };
        });
        
        // React automatically re-renders.
        // after map normalized coantian normalized doctor and schedules 
        //Updates React state.
        setDoctors(normalized);
      } 
      else {
        console.error("Failed to fetch doctors", { status: res.status, body });
        setDoctors([]);
      }
    }
    catch (err) {
      console.error("Network error fetching doctors", err);
      setDoctors([]);
    }
     // run whether succes failure occur So loading spinner always disappears.
    finally {
      setLoading(false);
    }
  }
   
  //Run only once after the component mounts.
  useEffect(() => {
    fetchDoctors();
  }, []);


  // to filter the doctor 

  // useMemo memoizes (stores) the filtered list.
  //Instead of filtering on every render, React only recalculates when one of these changes:
  //doctors, query, filterStatus
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // initially list contains all doctors 
    let list = doctors;
    // now filter 
    // available wala filter hai 
    if (filterStatus === "available") {
      list = list.filter(
        (d) => (d.availability || "").toString().toLowerCase() === "available"
      );
    } else if (filterStatus === "unavailable") {
      list = list.filter(
        (d) => (d.availability || "").toString().toLowerCase() !== "available"
      );
    }
    // Suppose the search box is empty.
    // query = "" then !q true
    //So simply return the current filtered list.
    if (!q) return list;
    // if user type something 
    return list.filter((d) => {
      return (
        // cardiologist contain card and we write query = "card"
        (d.name || "").toLowerCase().includes(q) ||
        (d.specialization || "").toLowerCase().includes(q)
      );
    });
  }, [doctors, query, filterStatus]);

  // show docotr acc to filter 
  const displayed = useMemo(() => {
    // if show all true 
    if (showAll) return filtered;
    // 6 doctor shown
    return filtered.slice(0, 6);
  }, [filtered, showAll]);

  // toggle  to epand partiular doctor 
  function toggle(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  // to delete doctor 
  // use id 
  async function removeDoctor(id) {
    // find by id whose id matches this id 
    const doc = doctors.find((d) => (d._id || d.id) === id);
    // doc not found retur nnothing 
    if (!doc) return;
    // confimation to delete 
    const ok = window.confirm(`Delete ${doc.name}? This cannot be undone.`);
    // if cancel then delete nothing 
    if (!ok) return;

    try {

      // Sends a DELETE request to the backend.
      const res = await fetch(`${API_BASE}/doctors/${id}`, {
        method: "DELETE",
      });
      // body contain response 
      // if aprsing fails it contains null instead of crashing 
      const body = await res.json().catch(() => null);
      // if failed to delete doctor 
      if (!res.ok) {
        alert(body?.message || "Failed to delete");
        return;
      }
      //Updates the UI without fetching again.
      //React re-renders automatically.
      setDoctors((prev) => prev.filter((p) => (p._id || p.id) !== id));
      // if delte doctor info expanded since he no longer exist collapse it 
      if (expanded === id) setExpanded(null);
    } catch (err) {
      console.error("delete error", err);
      alert("Network error deleting doctor");
    }
  }

  // show all the docotr or the filtered ones 
  function applyStatusFilter(status) {
    setFilterStatus((prev) => (prev === status ? "all" : status));
    //If a doctor's card was expanded, close it 
    setExpanded(null);
    //it exits "Show All" mode.
    //Only the filtered doctors are displayed.
    // agar available pe click krdiya wapis se toh filter all pe khu he shift ho jayega 
    setShowAll(false);
  }

  return (
    <div className = {ds.container}>
      <header className = {ds.headerContainer}>

        {/* TOP SECTION */}
        <div className = {ds.headerTopSection}>
          <div className = {ds.headerIconContainer}>
            <div className = {ds.headerIcon}>
              <Users size={20} className = {ds.headerIconSvg}/>
            </div>

            <div>
              <h1 className = {ds.headerTitle}> Find a Doctor </h1>
              <p className = {ds.headerSubtitle}>
                Search by name or specialization
              </p>
            </div>
          </div>

          <div className = {ds.headerSearchContainer}>
            <div className = {ds.searchBox}>
              <Search size = {16} className = {ds.searchIcon} />
              <input 
                value = {query} 
                onChange = {(e) => setQuery(e.target.value)}
                placeholder=" Search Doctor , specialization"
                className = {ds.searchInput}
              />
            </div>

            <button onClick = {() => {
              setQuery("");
              setExpanded(null);
              setShowAll(false);
              setFilterStatus("all");
            }} className = {ds.clearButton}>
              Clear
            </button>
          </div>
        </div>

        <div className = {ds.filterContainer}>
          <button onClick = {() => applyStatusFilter("available")}
            className = {ds.filterButton(
              filterStatus === "available",
              "emerald",
            )}
          >
            Available
          </button>

          <button onClick = {() => applyStatusFilter("unavailable")}
            className = {ds.filterButton(
              filterStatus === "unavailable",
              "red",
            )}
          >
            Unavailable
          </button>

        </div>

      </header>

      <main className = {ds.gridContainer}>

         {/* if laoding  */}
        {loading &&(
          <div className = {ds.loadingContainer}>
            Loading Doctors
          </div>
        )}
         {/* if not loading */}
        {!loading && filtered.length === 0 &&(
          <div className={ds.noResultsContainer}>
            No doctors match your search.
          </div>
        )}

        {displayed.map((doc) => {
          const id = doc.id || doc._id;
          const isOpen = expanded === id;
          const isAvailable = doc.availability === "Available";

          const scheduleMap = buildScheduleMap(doc.schedule ||{});

          return (
            <article key={id} className = {ds.article}>
              <div className = {ds.articleContent}>
                <img
                  src={doc.imageUrl || doc.image || ""}
                  alt={doc.name}
                  className={ds.doctorImage}
                />

                <div className={ds.doctorInfoContainer}>
                  <div className={ds.doctorHeader}>
                    <div className="min-w-0 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={ds.doctorName}>{doc.name}</h3>

                        <span className={ds.availabilityBadge(isAvailable)}>
                          <span className={ds.availabilityDot(isAvailable)} />
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <div className={ds.doctorDetails}>
                        {doc.specialization} - {doc.experience} years
                      </div>
                    </div>

                    <div className={ds.statsContainer}>
                      <div className={ds.statsLabel}> Patients </div>
                      <div className={ds.statsValue}>
                        <Users size={14} /> {doc.patients}
                      </div>

                      <div className={ds.actionContainer}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeDoctor(id)} className={ds.deleteButton}>
                            <Trash2 size={14} /> Delete
                          </button>

                          <div className={ds.feesLabel}> Fees: </div>
                          <div className={ds.feesValue}>
                            <BadgeIndianRupee /> {doc.fee}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        })}

      </main>
      
    </div>
  )
}

export default List
