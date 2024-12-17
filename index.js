const { default: axios } = require("axios");
const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
    },
});
let onlineUser = [];
io.on("connection", (socket) => {
    socket.on("addNewUser", (userId) => {
        !onlineUser.some((user) => user.userId === userId) &&
            onlineUser.push({
                userId,
                socketId: socket.id,
            });
        console.log("onlineUser", onlineUser);
        io.emit("getOnlineUsers", onlineUser)
    });
   
    socket.on("sendMessage", (message) => {
        const user = onlineUser.find(user => user.userId === message.recipientId)
        console.log("sendMessage",onlineUser);
        
        if (user) {
            io.to(user.socketId).emit("getMessage", message)
            io.to(user.socketId).emit("getNotification", {
                senderId: message.senderId,
                isRead: false,
                date: new Date(),
                id:message._id  
            })
        }
    })

    socket.on('disconnect', () => {
        onlineUser = onlineUser.filter((user) => user.socketId !== socket.id)
        io.emit("getOnlineUsers", onlineUser)
    })
});

io.listen(5000, () => {
    console.log("Server is listening on port 5000");
});