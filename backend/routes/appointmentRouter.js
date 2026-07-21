import express from 'express';
import { clerkMiddleware , requireAuth } from '@clerk/express';
import { cancelAppointment, confirmPayment, createAppointment, getAppointments, getAppointmentsByDoctor, getAppointmentsByPatient, getRegisterUserCount, getStats, updateAppointment } from '../controllers/appointmentController.js';

const appointmentRouter = express.Router();

appointmentRouter.get("/" , getAppointments);
appointmentRouter.get("/confirm" , confirmPayment);
appointmentRouter.get("/stat/summary" , getStats);

// authenticate routes

appointmentRouter.post("/" , clerkMiddleware() , requireAuth() , createAppointment);

appointmentRouter.get("/me" , clerkMiddleware() , requireAuth() , getAppointmentsByPatient);

appointmentRouter.get("/doctor/:doctorId" , getAppointmentsByDoctor);

appointmentRouter.post("/:id/cancel" , cancelAppointment);
appointmentRouter.get("/patients/count" , getRegisterUserCount);
appointmentRouter.put("/:id" , updateAppointment);

export default appointmentRouter;