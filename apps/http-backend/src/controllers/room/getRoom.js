"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoom = void 0;
const client_1 = require("@repo/db/client");
const getRoom = async (req, res) => {
    try {
        const room = await client_1.prismaClient.room.findUnique({
            where: { slug: req.params.slug }
        });
        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        return res.json({ room });
    }
    catch {
        return res.status(500).json({
            message: "Failed to fetch room"
        });
    }
};
exports.getRoom = getRoom;
