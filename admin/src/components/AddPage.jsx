import React,{useState , useRef , useEffect } from "react";
import {User,Plus,Trash2,Eye,EyeOff,CheckCircle,XCircle , Calendar} from "lucide-react";
import {doctorDetailStyles as s} from "../assets/dummyStyles";


// helper function to add doctor

// this function will give output in minutes from the time string in 12 hour format
function timeStringToMinutes(t) {
  if (!t) return 0;
  const [hhmm, ampm] = t.split(" ");
  let [h, m] = hhmm.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

// this function will o=cinvert yyyy-mm-dd to dd mmm yyyy format

function formatDateISO(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
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


const  AddPage = () =>{
  // store doctor that will added here 
  const [doctorList, setDoctorList] = useState([]);
  // file input ref to reset the file input after submission
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    imageFile: null,
    imagePreview: "",
    experience: "",
    qualifications: "",
    location: "",
    about: "",
    fee: "",
    patients: "",
    schedule: {},
    availability: "Available",
    email: "",
    password: "",
  });

  // slot state for adding slots to the form
  const [slotDate, setSlotDate] = useState("");
  const [slotHour, setSlotHour] = useState("");
  const [slotMinute, setSlotMinute] = useState("00");
  const [slotAmpm, setSlotAmpm] = useState("AM");

  // toast state
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  //toggle between password and text for password input
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // computes the todays date in local time zone and returns it in yyyy-mm-dd format for date input min attribute
  const [today] = useState(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().split("T")[0];
  });

  // useEffect to hide toast after 3 seconds
  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, show: false })), 3000);
    return () => clearTimeout(t);
  }, [toast.show]);

  const showToast = (type, message) => setToast({ show: true, type, message });

  // handle image function to handle image file input and create a preview URL
  function handleImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (form.imagePreview && form.imageFile) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch (err) {}
    }
    setForm((p) => ({
      ...p,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }

  // remove the image preview and file from the form state and reset the file input
  function removeImage() {
    if (form.imagePreview && form.imageFile) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch (err) {}
    }
    // wapis khali krde
    setForm((p) => (
      { ...p, 
        imageFile: null, 
        imagePreview: "" 
      }
    ));
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch (err) {}
    }
  }

  // to add slots to form state, we will check if the slot is valid and not in the past, then add it to the form.schedule object
  function addSlotToForm() {
    // check if slotDate and slotHour are valid pehle bhari hui toh nhi 
    if (!slotDate || !slotHour) {
      showToast("error", "Select date + time");
      return;
    }
    // privous date pe toh nhi 
    if (slotDate < today) {
      showToast("error", "Cannot add a slot in the past");
      return;
    }
    // time ka format hai hour : time AM/PM, so we need to convert it to 12 hour format and check if it is in the past for today
    const time = `${slotHour}:${slotMinute} ${slotAmpm}`;

    // if date is today, check if the time is in the past 
    if (slotDate === today) {
      const now = new Date();
      // abhi ka time in minutes
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      // slot ka time in minutes
      const slotMinutes = timeStringToMinutes(time);
      // slot ka time abhi ke time se chhota hai toh error show krdo
      if (slotMinutes <= nowMinutes) {
        showToast("error", "Cannot add a time that has already passed today");
        return;
      }
    }

    // set in form state, we will add the slot to the form.schedule object, which is an object with date as key and array of time strings as value
    // object hai toh array ki tarah dalenge 
    setForm((f) => {
      const sched = { ...f.schedule };
      // if not same date then create a new array for that date
      if (!sched[slotDate]) sched[slotDate] = [];
      // if same date then push the time to the array and also not same time 
      if (!sched[slotDate].includes(time)) sched[slotDate].push(time);

      sched[slotDate] = sched[slotDate].sort(
        (a, b) => timeStringToMinutes(a) - timeStringToMinutes(b),
      );
      return { ...f, schedule: sched };
    });

    // reset the slot state
    setSlotHour("");
    setSlotMinute("00");
  }

  // remove the added slot from the form.schedule object, if the date has no more slots then delete the date key from the object
  function removeSlot(date, time) {
    setForm((f) => {
      const sched = { ...f.schedule };
      // uss time ko dlete krdo 
      sched[date] = sched[date].filter((t) => t !== time);
      // kuch hai he nhi toh date ko delete krdo 
      if (!sched[date].length) delete sched[date];
      return { ...f, schedule: sched };
    }); 
  }

  // it will convert the schedule object into an array of objects with date and time keys, so that we can send it to the server in a flat format
  function getFlatSlots(s) {
    const arr = [];
    Object.keys(s)
      .sort()
      .forEach((d) => {
        // pushed in array for each date and time, so that we can send it to the server in a flat format
        s[d].forEach((t) => arr.push({ date: d, time: t }));
      });
    return arr;
  }

  // validate each of the field  that user filled by admin or not 
  function validate(f) {
    const req = [
      "name",
      "specialization",
      "experience",
      "qualifications",
      "location",
      "about",
      "fee",
      "patients",
      "email",
      "password",
    ];

    for (const k of req) {
      if (f[k] === "" || f[k] === null || f[k] === undefined) {
        return false;
      }
    }
    if (!f.imageFile) return false;
    if (!Object.keys(f.schedule).length) return false;
    return true;
  }

  // add a doctor 

  async function handleAdd(e) {
    // to stop page from reloading 
    e.preventDefault();
    // validate 
    if (!validate(form)) {
      showToast("error", "Fill all fields + upload image + add slot");
      return;
    }
    setLoading(true);

    // update each details 
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("specialization", form.specialization || "");
      fd.append("experience", form.experience || "");
      fd.append("qualifications", form.qualifications || "");
      fd.append("location", form.location || "");
      fd.append("about", form.about || "");
      fd.append("fee", form.fee === "" ? "0" : String(form.fee));
      fd.append("patients", form.patients || "");
      fd.append("availability", form.availability || "Available");
      fd.append("email", form.email);
      fd.append("password", form.password);
      // need to stringyfy the schedule object before sending to server because it is an object and FormData can only send strings
      fd.append("schedule", JSON.stringify(form.schedule || {}));

      // check image file is present or not 
      if (form.imageFile) fd.append("image", form.imageFile);

      // using backend url 
      const API_BASE = "http://localhost:4000/api";
      // to post the doctor details to the server, we will use fetch API and send the form data as body, and set the method to POST
      const res = await fetch(`${API_BASE}/doctors`, {
        method: "POST",
        body: fd,
      });

      // data  contain response from the server, we will check if the response is ok or not, if not then show error toast, else show success toast and reset the form state
      const data = await res.json().catch(() => null);

      // if ok doesnt happen
      if (!res.ok) {
        // form message 
        const msg = data?.message || `Server error (${res.status})`;
        // push in toast
        showToast("error", msg);
        setLoading(false);
        return;
      }

      // if happen type , message
      showToast("success", "Doctor Added Successfully!");

      // token will be stored at data storage 
      // data?.token "Access token from data, but only if data exists. If data is null or undefined, return undefined instead of throwing an error."
      if (data?.token) {
        // saving token in browser storage 
        try {
          localStorage.setItem("token", data.token);
        } catch (err) {}
      }
      // getting doctor data from server response
      const doctorFromServer = data?.data
        // if data exists then use it 
        ? data.data
        // if not create a new doctor object with the form data and a unique id, and use the image preview URL as the imageUrl
        : { id: Date.now(), ...form, imageUrl: form.imagePreview };

      // update doctor list to the top of the list, so that the newly added doctor is visible at the top of the list, and also to avoid reloading the page to see the new doctor
      setDoctorList((old) => [doctorFromServer, ...old]);

      // cleanup: revoke object URL if used
      if (form.imagePreview && form.imageFile) {
        try {
          URL.revokeObjectURL(form.imagePreview);
        } catch (err) {}
      }

      // reset the form state to initial values
      setForm({
        name: "",
        specialization: "",
        imageFile: null,
        imagePreview: "",
        experience: "",
        qualifications: "",
        location: "",
        about: "",
        fee: "",
        patients: "",
        schedule: {},
        availability: "Available",
        email: "",
        password: "",
      });

      // reset the file input value to empty string, so that the user can select the same file again if needed
      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch (err) {}
      }

      // reset the slot state to initial values
      setSlotDate("");
      setSlotHour("");
      setSlotMinute("00");
      setShowPassword(false);
    } 
    // if by chance addition is not successful
    catch (err) {
      console.error("submit error:", err);
      showToast("error", "Network or server error");
    } finally {
      setLoading(false);
    }
  }

  return(

    <div className={s.pageContainer}>

      <div className={s.maxWidthContainer + " " + s.headerContainer}>
        <div className={s.headerFlexContainer}>
            <div className = {s.headerIconContainer}>
              <User className = " text-white" size={32}/>
            </div>
            <h1 className={s.headerTitle}> Add Doctor </h1>
        </div>
      </div>

      {/* FORM */}

      <div className={s.maxWidthContainer + " " + s.headerContainer}>
        <form
          onSubmit={handleAdd}
          className={s.formGrid}
        >
                {/* // Name */}
              <input
                className={s.inputBase}
                placeholder="Doctor Name"
                value = {form.name}
                onChange={(e) => setForm({ ...form , name: e.target.value})}
              />
                    {/* Specialization */}
              <input
                className={s.inputBase}
                placeholder="Specialization"
                value = {form.specialization}
                onChange={(e) => setForm({ ...form , specialization: e.target.value})}
              />
                      {/* location */}
              <input
                className={s.inputBase}
                placeholder="Location"
                value = {form.location}
                onChange={(e) => setForm({ ...form , location: e.target.value})}
              />
                  {/* Experience */}
              <input
                className={s.inputBase}
                placeholder="Experience"
                value = {form.experience}
                onChange={(e) => setForm({ ...form , experience: e.target.value})}
              />

                  {/* qualifications */}
              <input
                className={s.inputBase}
                placeholder="qualifications"
                value = {form.qualifications}
                onChange={(e) => setForm({ ...form , qualifications: e.target.value})}
              />

                  {/* Consultation Fee */}
              <input
                className={s.inputBase}
                type="number"
                placeholder="Consultation Fee"
                value = {form.fee}
                onChange={(e) => setForm({ ...form , fee: e.target.value})}
              />

                  {/* Patient */}
              <input
                className={s.inputBase}
                type="number"
                placeholder="Patients"
                value = {form.patients}
                onChange={(e) => setForm({ ...form , patients: e.target.value})}
              />

                  {/* email*/}
              <input
                className={s.inputBase}
                placeholder="Email"
                value = {form.email}
                type = "email"
                onChange={(e) => setForm({ ...form , email: e.target.value})}
              />

                {/* Password */}
              <div className="relative">
                <input 
                  className = {s.inputBase + " " + s.inputWithIcon}
                  placeholder="Password"
                  type={showPassword?"text":"password"}
                  value = {form.password}
                  onChange={(e) => 
                    setForm({ 
                      ...form , 
                      password: e.target.value
                    })
                  }
                />

                {/* button */}
                <button
                  type="button"
                  // toggle 
                  onClick={()=> setShowPassword(!showPassword)}
                  className={s.passwordToggleButton + " " + s.cursorPointer}
                >
                  {/* ternary operator to show eye or eye off icon based on showPassword state */}
                  {
                  showPassword?
                  <EyeOff size = {18}/>
                  :
                  <Eye size = {18}/>
                  }
                </button>
              </div>


                  {/* // toggle between available and not available for doctor availability, this will be a select input with two options, and the value will be stored in form.availability state */}
              <select 
                className = {s.inputBase} value = {form.availability} 
                onChange={(e)=>
                  setForm({
                    ...form,
                    availability:e.target.value
                  })
                }
              >
                <option value = "Available">Available</option>
                <option value = "Not Available">Not Available</option>
              </select>

              <textarea
                className={s.textareaBase + "md:col-span-2"}
                rows={3} 
                placeholder="About Doctor"
                value = {form.about}
                onChange={(e) => 
                  setForm({ 
                    ...form , 
                    about: e.target.value
                  })
                }
              />

              {/* handle image here  */}

          <div className = "md:col-span-2">
            <label className = {s.label}> Upload Profile Image</label>
            <div className = "flex flex-wrap items-center gap-4">
              <input
                type="file"
                ref = {fileInputRef}
                accept="image/*"
                onChange={handleImage}
                className = {s.fileInput}
              />
            </div>

               {/* if showiung image preview  */}
            {form.imagePreview &&(
              <div>
                <img 
                src={form.imagePreview} 
                alt="Preview" 
                className = {s.imagePreview } />

                <button 
                type = "button" 
                onClick={removeImage}
                className = {s.removeImageButton + " " + s.cursorPointer}
                >
                  <XCircle size = {14}/>
                </button>
              </div>
            )}

          </div>

          {/* SCHEDULE */}
          <div className={s.scheduleContainer + " md:col-span-2"}>
            <div className={s.scheduleHeader}>
              <Calendar className="text-emerald-600" />
              <p className={s.scheduleTitle}>Add Schedule Slots</p>
            </div>

                  {/* DATE SLOT */}
            <div className={s.scheduleInputsContainer}>
              <input
                type="date"
                value={slotDate}
                min={today}
                onChange={(e) => setSlotDate(e.target.value)}
                className={s.scheduleDateInput}
              />

                  {/* HOUR SLOT */}
              <select
                value={slotHour}
                onChange={(e) => setSlotHour(e.target.value)}
                className={s.scheduleTimeSelect}
              >
                <option value="">Hour</option>
                        {/* MAP OF TIME  12 hours  */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={String(i + 1)}>
                    {i + 1}
                  </option>
                ))}
              </select>

                      {/* MINUTE SLOT */}
              <select
                value={slotMinute}
                onChange={(e) => setSlotMinute(e.target.value)}
                className={s.scheduleTimeSelect}
              >
                {Array.from({ length: 60 }).map((_, i) => (
                  <option key={i} value={String(i).padStart(2, "0")}>
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
                    {/* AM PM  */}
              <select
                value={slotAmpm}
                onChange={(e) => setSlotAmpm(e.target.value)}
                className={s.scheduleTimeSelect}
              >
                <option>AM</option>
                <option>PM</option>
              </select>

                         {/* BUTTON TO ADD SLOT  */}
              <button
                type="button"
                onClick={addSlotToForm}
                className={s.addSlotButton + " " + s.cursorPointer}
              >
                <Plus size={18} /> Add Slot
              </button>
            </div>

            <div className={s.slotsGrid}>
              {getFlatSlots(form.schedule).map(({ date, time }) => (
                <div
                  key={date + time}
                  className={s.slotItem + " " + s.cursorPointer}
                >
                  <span>
                    {formatDateISO(date)} — {time}
                  </span>
                  <button
                    onClick={() => removeSlot(date, time)}
                    className="text-rose-500"
                    aria-label={`Remove slot ${date} ${time}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

              {/* Subbmit */}
          <div className = {s.submitButtonContainer}>
            <button 
              type = "submit" 
              // disabled when in loading starge
              disabled = {loading}
              className = {s.submitButton + " " + s.cursorPointer +" " + 
                (loading ? s.submitButtonDisabled : s.submitButtonEnabled)
              }
            >
              {loading ? "Adding..." : "Add Doctor To Team"}
            </button>

          </div>  

        </form>
      </div>

      {/* TOAST */}
      {toast.show && (
        <div
          className={s.toastContainer + " " + 
            (toast.type === "success" ? s.toastSuccess : s.toastError)}
        >
          {toast.type === "success" ? (
            <CheckCircle size={22} />
          ) : (
            <XCircle size={22} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* SIMPLE OVERVIEW OF ADDED DOCTORS  */}

      <div className = {s.doctorListContainer}>
        {doctorList.length ? (
          <div className = {s.doctorListGrid}>
            {doctorList.map((doc) => (
              <div key = {doc.id || doc._id} className = {s.doctorCard}>
                <div className = {s.doctorCardContent}>
                  <img src = {doc.imageUrl || doc.imagePreview} alt = {doc.name} className = {s.doctorImage}/>
                  <div>
                    <div className = {s.doctorName}>{doc.name}</div>
                    <div className = {s.doctorSpecialization}>{doc.specialization}</div>

                  </div> 

                </div>
              </div>
            ))}
          </div>
          
        ) : (
          <p className = {s.emptyState}> No Doctor Yet </p>
        )}
      </div>
    </div>

  );

};


export default AddPage;