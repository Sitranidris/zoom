const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
const io = require("socket.io")(server);
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
	debug: true,
});
app.use("/peerjs", peerServer);





app.get("/", (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
	res.render("room", { roomId: req.params.room });
});


io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId) => {
		socket.join(roomId);
		socket.to(roomId).emit("user_connected", userId);
        // console.log("someone joined", roomId, userId);
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message);
        })
		socket.on("disconnect", () => {
			socket.to(roomId).emit("user_disconnected", userId);
		});
	});
});

// let a = [1,2,6,7,3,9,0] 
// in merge


server.listen(process.env.PORT || 3000);
