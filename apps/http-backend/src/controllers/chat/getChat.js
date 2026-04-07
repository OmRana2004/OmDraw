"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChats = void 0;
const client_1 = require("@repo/db/client");
const getChats = async (req, res) => {
    const { roomId } = req.params;
    if (!roomId) {
        return res.status(400).json({
            message: "Room ID is required"
        });
    }
    try {
        const messages = await client_1.prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50
        });
        return res.status(200).json({
            messages
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to load chats"
        });
    }
};
exports.getChats = getChats;
