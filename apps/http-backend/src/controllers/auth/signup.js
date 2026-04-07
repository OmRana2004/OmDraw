"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@repo/db/client");
const common_1 = require("@repo/common");
const signup = async (req, res) => {
    const parsed = common_1.CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input data",
        });
    }
    try {
        const { email, password, name } = parsed.data;
        const existingUser = await client_1.prismaClient.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await client_1.prismaClient.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                photo: "",
            },
        });
        return res.status(201).json({
            message: "User created successfully",
            userId: user.id,
        });
    }
    catch {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
exports.signup = signup;
