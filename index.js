const { default: axios } = require("axios");
const { Server } = require("socket.io");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*", // Cho phép tất cả các nguồn truy cập
        methods: ["GET", "POST"],//cho phép các phương thức get post
    },
});
let onlineUser = [];//tạo ra 1 mảng onlineUser
io.on("connection", (socket) => {//kết nối với socket.io
    socket.on("addNewUser", (userId) => {//on là lắng nghe có io.on(event,callback), hàm này sẽ lắng event là addNewUser, 
        //và 1 callback, khi emit truyền data thì on sẽ nhận data đó là một callBack
        !onlineUser.some((user) => user.userId === userId) &&//phương thức some trong js là khi có ít nhất 1 điều kiện thõa mãn sẽ trả về true
            //còn nếu không có điều kiện nào thỏa sẽ trả về false, trong trường hợp này nếu trong onlineUser user.userId ===userId của hàm callBack từ emit
            //thì sẽ về true, còn nếu không có trả về false, nếu trả về false thì dấu này ! sẽ chuyển thành true push userId và socketId đó vào mảng onlineUser
            onlineUser.push({
                userId,
                socketId: socket.id,
            });
        console.log("onlineUser", onlineUser);
        io.emit("getOnlineUsers", onlineUser)//emit là phát sự kiện có io.emit(event,data), hàm này có nghĩa là sẽ phát data là mảng onlineUser và có sự kiện là getOnlineUsers
        //bên client sẽ on để lắng nghe sự kiện và nhận được mảng onlineUser thông qua callBack
    });
   
    socket.on("sendMessage", (message) => {//lắng nghe sự kiện sendMessage từ client và nhận data thông qua callBack
        const user = onlineUser.find(user => user.userId === message.recipientId)//hàm này có nghĩa là tìm trong onlineUser nếu userId nào bằng với recipientId từ client phát sự kiện
        //recipient này có nghĩa là id của người nhận từ bên client gửi qua, trả về user có userId bằng recipientId từ mảng onlineUser''
        console.log("sendMessage",onlineUser);
        
        if (user) {
            io.to(user.socketId).emit("getMessage", message)// nếu user có thì io sẽ gửi phát sự kiện cho user nhận được tìm thầy ở trên
            // bằng cách io.to(user.socketId), và emit sự getMessage , và có data là message
            io.to(user.socketId).emit("getNotification", {//hàm này phát sự kiện đến socketId của trong mảng onlineUser, có object data là senderId, isRead, date
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
server.listen(5000, () => {
  console.log(`Server is running on port ${port}`);
});
