import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import dotenv from "dotenv";
import crypto from "crypto";

import Razorpay from "razorpay";

import {getAuth} from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { appointmentPageStyles } from "../../frontend/src/assets/dummyStyles.js";

dotenv.config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const FRONTEND_URL = process.env.FRONTEND_URL;

const MAJOR_ADMIN_ID = process.env.MAJOR_ADMIN_ID || null;

const razorpay = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

// HElper function 

// this function will return a finite number
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// this function wil create the frontend url
const buildFrontendBase = (req) => {
  if (FRONTEND_URL) return FRONTEND_URL.replace(/\/$/, "");
  const origin = req.get("origin") || req.get("referer");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.get("host");
  if (host) return `${req.protocol || "http"}://${host}`.replace(/\/$/, "");
  return null;
};

// this func will gert the user from clerk and return the user details
function resolveClerkUserId(req) {
  try {
    const auth = req.auth || {};
    const fromReq = auth?.userId || auth?.user_id || auth?.user?.id || req.user?.id || null;
    if (fromReq) return fromReq;
    try {
      const serverAuth = getAuth ? getAuth(req) : null;
      return serverAuth?.userId || null;
    } 
    catch (e) {
      return null;
    }
  }   
  catch (e) {
    return null;
  }
}

const verifyRazorpaySignature = ({ order_id, payment_id, signature }) => {
  if (!RAZORPAY_KEY_SECRET || !order_id || !payment_id || !signature) return false;
  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${order_id}|${payment_id}`)
    .digest("hex");
  return generatedSignature === signature;
};


//  to get Appointments
export const getAppointments = async (req, res) => {
    try {
        const { doctorId, mobile, status, search = "", limit: limitRaw = 50, page: pageRaw = 1, patientClerkId, createdBy } = req.query; // limit is per page 

        // pagination per page full then goes to next page 
        const limit = Math.min(200, Math.max(1, parseInt(limitRaw, 10) || 50));
        const page = Math.max(1, parseInt(pageRaw, 10) || 1);
        const skip = (page - 1) * limit;

        /// to filter 
        const filter = {};
        if (doctorId) filter.doctorId = doctorId;
        if (mobile) filter.mobile = mobile;
        if (status) filter.status = status;
        if (patientClerkId) filter.createdBy = patientClerkId;
        if (createdBy) filter.createdBy = createdBy;
        if (search) {
            const re = new RegExp(search, "i");
            filter.$or = [{ patientName: re }, { mobile: re }, { notes: re }];
        }

        const items = await Appointment.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("doctorId", "name specialization owner imageUrl image")
            .lean();

        const total = await Appointment.countDocuments(filter);
        return res.json({
            success: true,
            appointment: items,
            meta: {page , limit , total , count: items.length}
        })
    }
    catch (err) {
        console.error("GetAppointment Error:" , err);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}


// to getAppointment By Patient
export async function getAppointmentsByPatient(req, res) {
    try {
        const queryCreatedBy = req.query.createdBy || null;
        const clerkUserId = req.auth?.user || null;
        const resolvedCreatedBy = queryCreatedBy || clerkUserId || null;

        console.log("resolvedCreatedBy (query or req.auth.userId) : ", resolvedCreatedBy);

        if (!resolvedCreatedBy && !req.query.mobile) {
            return res.status(400).json({
                success: false,
                message: "Authentication required."
            });
        }
        const filter = {};
        if (resolvedCreatedBy) filter.createdBy = resolvedCreatedBy;
        if (req.query.mobile) filter.mobile = req.query.mobile;

        const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 }).lean();

        return res.json({
            success: true,
            appointments
        });
    } 

    catch (err) {
        console.error("GetAppointmentByPatient Error:" , err);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}


// to create a particular appointment 

export const createAppointment = async(req , res) => {

    try {
        const {
            doctorId,
            patientName,
            mobile,
            age = "",
            gender = "",
            date,
            time,
            fee,
            fees,
            notes = "",
            email,
            paymentMethod,
            owner: ownerFromBody = null,
            doctorName: doctorNameFromBody,
            speciality: specialityFromBody,
            doctorImageUrl: doctorImageUrlFromBody,
            doctorImagePublicId: doctorImagePublicIdFromBody,
        } = req.body || {};

        const clerkUserId = resolveClerkUserId(req);
        if(!clerkUserId) return res.json({
            success: false,
            message : "Authentication is Required."
        });

        if(!doctorId || !patientName || !mobile || !date || !time){
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const numericFee = safeNumber( fee ?? fees ?? 0);  // fee or fees or 0
        if(numericFee === null || numericFee < 0){
            return res.status(400).json({
                success: false,
                message: " Fee must be a valid number."
            });
        } 

        // Duplicate booking prevention 

        const existingBooking = await Appointment.findOne({
            doctorId,
            createdBy: clerkUserId,
            date: String(date),
            time: String(time),
            status: {$ne: "Canceled"}, 
        }).lean();

        if(existingBooking){
            return res.status(409).json({
                success: false,
                message: "You already have an appointment with this doctor at the selected slot."
            });
        }

        let doctor = null;
        try{
            doctor = await Doctor.findById(doctorId).lean();
        } catch(e){
            console.warn("Doctor lookup failed: " , e?.message || e);
        }

        if(!doctor) return res.status(404).json({
            success: false,
            message: " Doctor not Found "
        });

        // Resolve owner, names, images, etc.
        let resolvedOwner = ownerFromBody || doctor.owner || null;
        if (!resolvedOwner) resolvedOwner = MAJOR_ADMIN_ID || String(doctorId);

        const doctorName = (doctor.name && String(doctor.name).trim()) || (doctorNameFromBody && String(doctorNameFromBody).trim()) || "";

        const speciality =
            (doctor.specialization && String(doctor.specialization).trim()) ||
            (doctor.speciality && String(doctor.speciality).trim()) ||
            (specialityFromBody && String(specialityFromBody).trim()) ||
            "";

        const doctorImageUrl =
            (doctor.imageUrl && String(doctor.imageUrl).trim()) ||
            (doctor.image && String(doctor.image).trim()) ||
            (doctor.avatarUrl && String(doctor.avatarUrl).trim()) ||
            (doctor.profileImage && doctor.profileImage.url && String(doctor.profileImage.url).trim()) ||
            (doctorImageUrlFromBody && String(doctorImageUrlFromBody).trim()) ||
            "";

        const doctorImagePublicId =
            (doctor.imagePublicId && String(doctor.imagePublicId).trim()) ||
            (doctor.profileImage && doctor.profileImage.publicId && String(doctor.profileImage.publicId).trim()) ||
            (doctorImagePublicIdFromBody && String(doctorImagePublicIdFromBody).trim()) ||
            "";

        const doctorImage = { url: doctorImageUrl, publicId: doctorImagePublicId };

        const base = {
        doctorId: String(doctor._id || doctorId),
        doctorName,
        speciality,
        doctorImage,
        patientName: String(patientName).trim(),
        mobile: String(mobile).trim(),
        age: age ? Number(age) : undefined,
        gender: gender ? String(gender) : "",
        date: String(date),
        time: String(time),
        fees: numericFee,
        status: "Pending",
        payment: { method: paymentMethod === "Cash" ? "Cash" : "Online", status: "Pending", amount: numericFee },
        notes: notes || "",
        createdBy: clerkUserId, // for a particular id 
        owner: resolvedOwner,
        sessionId: null,
        };

        // Free appointment
        if (numericFee === 0) {
            const created = await Appointment.create({
                ...base,
                status: "Confirmed",
                payment: { method: base.payment.method, status: "Paid", amount: 0 },
                paidAt: new Date(),
            });
            return res.status(201).json({ success: true, appointment: created, checkoutUrl: null });
        }

        // Cash payment
        if (paymentMethod === "Cash") {
            const created = await Appointment.create({
                ...base, // return base 
                status: "Pending",
                payment: { method: "Cash", status: "Pending", amount: numericFee },
            });
            return res.status(201).json({ success: true, appointment: created, checkoutUrl: null });
        }

        // Online: Razorpay
        if (!razorpay) return res.status(500).json({ success: false, message: "Razorpay not configured on server" });

        const frontBase = buildFrontendBase(req);
        const successUrl = frontBase ? `${frontBase}/appointment/success` : "/appointment/success";
        const cancelUrl = frontBase ? `${frontBase}/appointment/cancel` : "/appointment/cancel";

        let order;
        try {
            order = await razorpay.orders.create({
                amount: Math.round(numericFee * 100),
                currency: "INR",
                receipt: `apt_${Date.now()}_${String(doctorId).slice(-6)}`,
                notes: {
                    doctorId: String(doctorId),
                    doctorName: doctorName || "",
                    speciality: speciality || "",
                    patientName: base.patientName,
                    mobile: base.mobile,
                    clerkUserId: clerkUserId || "",
                    successUrl,
                    cancelUrl,
                },
            });
        } catch (razorpayErr) {
            console.error("Razorpay create order error:", razorpayErr);
            const message = razorpayErr?.error?.description || razorpayErr?.message || "Razorpay error";
            return res.status(502).json({ success: false, message: `Payment provider error: ${message}` });
        }

        try {
            const created = await Appointment.create({
                ...base,
                sessionId: order.id,
                payment: { ...base.payment, providerId: order.id },
                status: "Pending",
            });
            return res.status(201).json({
                success: true,
                appointment: created,
                checkoutUrl: null,
                razorpay: {
                    orderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    key: RAZORPAY_KEY_ID,
                    name: "MediCare Appointment",
                    description: `Appointment booking for ${doctorName || "doctor"}`,
                    prefill: {
                        name: base.patientName,
                        email: email || "",
                        contact: base.mobile,
                    },
                },
            });
        } 
            catch (dbErr) {
                console.error("DB error saving appointment after Razorpay order:", dbErr);
                return res.status(500).json({ success: false, message: "Failed to create appointment record" });
            }
    } 
    
    catch (err) {
        console.error("createAppointment unexpected:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// to confirm the online payment and make it paid


export const confirmPayment = async(req,res) => {
    try{
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.query;
        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({
            success: false,
            message: "Razorpay payment details are required."
        });

        if(!razorpay || !RAZORPAY_KEY_SECRET) return res.status(500).json({
            success: false,
            message: "Razorpay is not setup"
        });

        const isValidSignature = verifyRazorpaySignature({
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
        });

        if (!isValidSignature) {
            return res.status(400).json({
                success: false,
                message: "Invalid Razorpay signature"
            });
        }

        let appt = await Appointment.findOneAndUpdate(
            { sessionId: razorpay_order_id },
            {
                "payment.status": "Paid",
                "payment.providerId": razorpay_payment_id,
                status: "Confirmed",
                paidAt: new Date(),
            },
            { new: true }
        );

        if (!appt) {
            appt = await Appointment.findOneAndUpdate(
                { "payment.providerId": razorpay_order_id },
                {
                    "payment.status": "Paid",
                    "payment.providerId": razorpay_payment_id,
                    status: "Confirmed",
                    paidAt: new Date(),
                    sessionId: razorpay_order_id,
                },
                { new: true }
            );
        }

        if (!appt) {
            return res.status(404).json({ success: false, message: "Appointment not found for this payment session" });
        }

        return res.json({
            success: true,
            appointment: appt
        });
    }
    catch (err) {
        console.error("ConfirmAppointment error :", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// to update ans appointment 

export const updateAppointment = async(req,res) =>{
    try {
        
        const {id} = req.params;
        const body = req.body || {};
        const appt = await Appointment.findById(id);

        if(!appt) return res.status(404).json({
            success: false,
            message: "Appointment Not Found"
        });

        //updateAppointment 

        const terminal = appt.status === "Completed" || appt.status === "Canceled";

        if (terminal && body.status && body.status !== appt.status) {
            return res.status(400).json({ success: false, message: "Cannot change status of a completed/canceled appointment" });
        }

        const update = {};
        if (body.status) update.status = body.status;
        if (body.notes !== undefined) update.notes = body.notes;

        if (body.date && body.time) {
            if (appt.status === "Completed" || appt.status === "Canceled") {
                return res.status(400).json({ success: false, message: "Cannot reschedule completed/canceled appointment" });
            }
            update.date = body.date;
            update.time = body.time;
            update.status = "Rescheduled";
            update.rescheduledTo = { date: body.date, time: body.time };
        }

        const updated = await Appointment.findByIdAndUpdate(id , update,
            {new: true , runValidators: true}
        ).populate({path: "doctorId" , select: " name imageUrl"}).lean();

        return res.json({
            success: true,
            appointment: updated
        });
    } 
    
    catch (err) {
        console.error("UpdateAppointment error :", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// to cancel a appointment 

export const cancelAppointment = async (req, res) => {
    try {

        const { id } = req.params;
        const appt = await Appointment.findById(id);

        if(!appt) return res.status(404).json({
            success: false,
            message: "Appointment Not Found"
        });

        appt.status = "Canceled";

        await appt.save();

        return res.json({ success: true , appointment: appt});
    }

    catch (err) {
        console.error("CancelAppointment error :", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// to get the stats

export const getStats = async(req , res) =>{
    try {
        const total = await Appointment.countDocuments();
        // payment aggregate 
        const paidAgg = await Appointment.aggregate([{ $match: { "payment.status": "Paid" } }, { $group: { _id: null, total: { $sum: "$fees" } } }]);

        // revenue generated by payment
        const revenue = (paidAgg[0] && paidAgg[0].total) || 0;

        const sevenDayAgo = new Date();
        sevenDayAgo.setDate(sevenDayAgo.getDate() - 7);
        const recent = await Appointment.countDocuments({ createdAt: { $gte: sevenDayAgo } });

        return res.json({
            success: true,
            stats: {total , revenue , recentLast: recent }
        });

    }
    catch (err) {
        console.error("getStats error :", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// to get appointment by doctor

export const getAppointmentsByDoctor = async(req, res)=>{
    try {
        const{doctorId} = req.params;

        if(!doctorId) return res.status(400).json({
            success: false,
            message: "Doctor Id Required"
        });

        //getAppointmentsByDoctor

        // options with pagination
        const { mobile, status, search = "", limit: limitRaw = 50, page: pageRaw = 1 } = req.query;
        const limit = Math.min(200, Math.max(1, parseInt(limitRaw, 10) || 50));
        const page = Math.max(1, parseInt(pageRaw, 10) || 1);
        const skip = (page - 1) * limit;

        // to filter 
        const filter = { doctorId };
        if (mobile) filter.mobile = mobile;
        if (status) filter.status = status;
        if (search) {
            const re = new RegExp(search, "i");
            filter.$or = [{ patientName: re }, { mobile: re }, { notes: re }];
        }

        const items = await Appointment.find(filter)
            .sort({ date: 1, time: 1 })
            .skip(skip)
            .limit(limit)
            .populate("doctorId", "name specialization owner imageUrl image")
            .lean();

        const total = await Appointment.countDocuments(filter);
            return res.json({
                success: true , 
                appointments: items,
                meta: { page , limit , total , count: items.length}
            });
    } 
    catch (err) {
        console.error("getAppointmentByDoctor error :", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// to get register user count

export async function getRegisterUserCount(req,res){
    try {
        const totalUsers = await clerkClient.users.getCount();
        return res.json({
            success: true,
            totalUsers
        })
    }
    
    catch (err) {
        console.error("getRegisterUserCount error :", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export default{
    getAppointments,
    getAppointmentsByPatient,
    createAppointment,
    confirmPayment,
    updateAppointment,
    cancelAppointment,
    getStats,
    getAppointmentsByDoctor,
    getRegisterUserCount
};
