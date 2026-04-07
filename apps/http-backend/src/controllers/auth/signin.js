"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@repo/db/client");
const config_1 = require("@repo/backend-common/config");
const common_1 = require("@repo/common");
const signin = async (req, res) => {
    const parsed = common_1.SigninUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
        });
    }
    try {
        const { email, password } = parsed.data;
        const user = await client_1.prismaClient.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.JWT_SECRET, {
            expiresIn: "7d",
        });
        return res.json({ token });
    }
    catch {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
exports.signin = signin;
