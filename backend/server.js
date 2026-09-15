import express from "express";
import cors from "cors";
import "dotenv/config";


import { clerkMiddleware } from "@clerk/express";
import {connectDB} from "./config/db.js";
import doctorRouter from "./routes/doctorRouter.js";
import appointmentRouter from "./routes/appointmentRouter.js";

const app  = express();

const PORT = process.env.PORT || 4000;

// frontend as well as admin url

const localOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
];

const allowedOrigins = [
    ...localOrigins,
    ...(process.env.CLIENT_ORIGINS || "")
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, ""))
        .filter(Boolean),
];

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    return /^(http:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

// middlewares

app.use(cors({
    origin: function (origin, callback) {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
}));
app.use(express.json({limit: "20mb"}));
app.use(clerkMiddleware());
app.use(express.urlencoded({limit: "20mb", extended: true}));

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// db
connectDB();



// routes


app.use("/api/doctors" , doctorRouter);
app.use("/api/appointments" , appointmentRouter);
// Note: service and service-appointments routes removed because related
// route/controller files are not present in this checkout.
// Re-add `serviceRouter` and `serviceAppointmentRouter` when those files
// exist under ./routes and ./controllers respectively.



app.get("/", (req , res) => {
    res.send("API Working");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
