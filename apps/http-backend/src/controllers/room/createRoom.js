"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = void 0;
const client_1 = require("@repo/db/client");
const common_1 = require("@repo/common");
const createRoom = async (req, res) => {
    const parsed = common_1.CreateRoomSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid room data"
        });
    }
    if (!req.userId) {
        return res.status(403).json({
            message: "User not authenticated"
        });
    }
    try {
        const room = await client_1.prismaClient.room.create({
            data: {
                slug: parsed.data.name,
                adminId: req.userId,
            },
        });
        return res.status(201).json({
            roomId: room.id
        });
    }
    catch {
        return res.status(409).json({
            message: "Room already exists"
        });
    }
};
exports.createRoom = createRoom;
