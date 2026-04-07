"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pageRoutes_1 = __importDefault(require("./routes/pageRoutes"));
const app = (0, express_1.default)();
/* ================= CONFIG ================= */
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://omdraw.vercel.app",
];
/* ================= MIDDLEWARES ================= */
// CORS
app.use((0, cors_1.default)({
    origin: ALLOWED_ORIGINS,
    credentials: true, // allow cookies
}));
// Body parser
app.use(express_1.default.json());
app.use("/api/v1", pageRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
