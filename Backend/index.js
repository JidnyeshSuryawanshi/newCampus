const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const connectDB = require("./config/database")
const { errorHandler } = require("./utils/errorHandler")
const cookieParser = require("cookie-parser")

// Load env vars
dotenv.config()

// Connect to database
const app = express()

// Body parser
app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.send("Hello World")
})

const PROD_FRONTEND_URLS = (
    process.env.ALLOWED_ORIGINS ||
    "https://campus-cove.vercel.app,https://campus-cove-ten.vercel.app"
).split(",")
const DEV_FRONTEND_URLS = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]
// Enable CORS
app.use(
    cors({
        origin: (origin, callback) => {
            if (process.env.NODE_ENV === "production") {
                // Allow requests from production frontend URLs
                if (!origin || PROD_FRONTEND_URLS.includes(origin)) {
                    callback(null, true)
                } else {
                    callback(new Error("Not allowed by CORS"))
                }
            } else {
                // In development, allow any localhost origin
                if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
                    callback(null, true)
                } else {
                    callback(null, DEV_FRONTEND_URLS[0]) // Default to first dev URL if not localhost
                }
            }
        },
        credentials: true,
    })
)

// Add cookie parser
app.use(cookieParser())

// Mount routers
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/hostel-rooms", require("./routes/hostelRoomRoutes"))
app.use("/api/mess", require("./routes/messRoutes"))
app.use("/api/gym", require("./routes/gymRoutes"))
app.use("/api/student", require("./routes/studentRoutes"))
app.use("/api/owner", require("./routes/ownerRoutes"))
app.use("/api/users", require("./routes/userRoutes"))
app.use("/api/bookings", require("./routes/bookingRoutes"))

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

// Connect to database before starting server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error("Database connection failed:", error)
        process.exit(1)
    })

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`)
    // Close server & exit process
    process.exit(1)
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`)
    process.exit(1)
})