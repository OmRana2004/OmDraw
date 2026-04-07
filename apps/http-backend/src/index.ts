import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/pageRoutes";

const app = express();
/* ================= CONFIG ================= */

const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://omdraw.vercel.app",
];

/* ================= MIDDLEWARES ================= */

// CORS
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true, // allow cookies
  })
);

// Body parser
app.use(express.json());

app.use("/api/v1", router);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});