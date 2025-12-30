const socketService = (io) => {
    // Track user ID to socket ID mapping
    const userSocketMap = new Map();
    const socketUserMap = new Map();
    // Track user names for display
    const userNameMap = new Map();

    // Socket.io connection handler
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        let currentMeetingId = null;
        let currentUserId = null;

        // Join meeting room
        socket.on('join-meeting', (data) => {
            currentMeetingId = data.meetingId;
            currentUserId = data.userId;
            const userName = data.userName || 'Guest User';

            // Store the mapping between user ID and socket ID
            if (currentUserId) {
                // Remove old socket if this user was already connected
                const oldSocketId = userSocketMap.get(currentUserId);
                if (oldSocketId) {
                    socketUserMap.delete(oldSocketId);
                }

                userSocketMap.set(currentUserId, socket.id);
                socketUserMap.set(socket.id, currentUserId);
                userNameMap.set(currentUserId, userName);
                console.log(`Mapped user ${currentUserId} (${userName}) to socket ${socket.id}`);
            }

            socket.join(currentMeetingId);
            console.log(`Client ${socket.id} (user: ${currentUserId}, name: ${userName}) joined meeting ${currentMeetingId}`);

            // Get existing participants in the room (excluding current user)
            const room = io.sockets.adapter.rooms.get(currentMeetingId);
            const existingParticipants = room ? Array.from(room).filter(id => {
                const participantUserId = socketUserMap.get(id);
                return id !== socket.id && participantUserId && participantUserId !== currentUserId;
            }) : [];

            // Convert socket IDs to user IDs and get names for existing participants
            const existingUserData = existingParticipants.map(socketId => {
                const userId = socketUserMap.get(socketId);
                const userName = userNameMap.get(userId) || 'Guest User';
                return { userId, userName };
            }).filter(data => data.userId && data.userId !== currentUserId);

            // Send existing participants with names to the new joiner
            socket.emit('existing-participants', existingUserData);

            // Notify other participants (send user data instead of just ID)
            socket.to(currentMeetingId).emit('user-joined', {
                userId: currentUserId,
                userName: userName
            });
        });

        // Handle chat messages
        socket.on('chat-message', (message) => {
            console.log('Message received:', message);
            // Add sender name to message if not already present
            if (!message.userName && message.userId) {
                message.userName = userNameMap.get(message.userId) || 'Guest User';
            }
            io.to(message.meetingId).emit('chat-message', message);
        });

        // Handle WebRTC signaling
        socket.on('webrtc-signal', (data) => {
            console.log(`Forwarding WebRTC signal from ${data.senderId} to ${data.receiverId}: ${data.type}`);
            
            // Forward the signal to the specific receiver
            if (data.receiverId) {
                // Find the socket ID for the receiver user ID
                const receiverSocketId = userSocketMap.get(data.receiverId);
                if (receiverSocketId) {
                    // Verify the receiver socket is still connected
                    const receiverSocket = io.sockets.sockets.get(receiverSocketId);
                    if (receiverSocket && receiverSocket.connected) {
                        socket.to(receiverSocketId).emit('webrtc-signal', data);
                    } else {
                        console.warn(`Receiver ${data.receiverId} socket ${receiverSocketId} is not connected`);
                        // Clean up stale mapping
                        userSocketMap.delete(data.receiverId);
                        socketUserMap.delete(receiverSocketId);
                        userNameMap.delete(data.receiverId);
                    }
                } else {
                    console.warn(`Receiver ${data.receiverId} not found or not connected`);
                }
            } else {
                // Broadcast to all in the meeting if no specific receiver
                socket.to(currentMeetingId).emit('webrtc-signal', data);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);

            if (currentMeetingId && currentUserId) {
                const userName = userNameMap.get(currentUserId) || 'Guest User';
                // Notify other participants that this user left (using user data)
                socket.to(currentMeetingId).emit('user-left', {
                    userId: currentUserId,
                    userName: userName
                });
            }

            // Clean up mappings
            if (currentUserId) {
                userSocketMap.delete(currentUserId);
                userNameMap.delete(currentUserId);
            }
            socketUserMap.delete(socket.id);
        });
    });
};

module.exports = socketService;
