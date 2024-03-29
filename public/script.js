const socket = io("/");
const myPeer = new Peer(undefined, {
	path: "/peerjs",
	host: "/",
	port: "443",
});


// 1) Heroku
// 2) Netfliy
// 3) Firebase
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
peers = {};
let myVideoStream;




navigator.mediaDevices
	.getUserMedia({
		video: false,
		audio: true,
	})

    .then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream);
		myPeer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});
		socket.on("user_connected", (userId) => {
			setTimeout(function () {
				connectToNewUser(userId, stream);
			}, 1000);
		});
		let text = $("input");
		$("html").keydown(function (e) {
			if (e.which == 13 && text.val().length != 0) {
				socket.emit("message", text.val());
				text.val("");
			}
		});
		socket.on("createMessage", (message) => {
			$("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
			scrollToBottom();
		});
	});

	
	myPeer.on("open", (id) => {
		socket.emit("join-room", ROOM_ID, id);

	});

    

	socket.on("user_disconnected", (userId) => {
		if (peers[userId]) {
			peers[userId].close();
		}
	});

    function connectToNewUser(userId, stream) {
		const call = myPeer.call(userId, stream);
		const video = document.createElement("video");
		call.on("stream", (userVideoStream) => {
			addVideoStream(video, userVideoStream);
		});
		call.on("close", () => {
			video.remove();
		});
		peers[userId] = call;
		// console.log(peers);
	}

    function addVideoStream(video, stream) {
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
        });
        videoGrid.append(video);
    }


	const muteUnmute = () => {
		const enabled = myVideoStream.getAudioTracks()[0].enabled;
		if (enabled) {
			myVideoStream.getAudioTracks()[0].enabled = false;
			setUnmuteButton();
		} else {
			setMuteButton();
			myVideoStream.getAudioTracks()[0].enabled = true;
		}
	};

	const setMuteButton = () => {
		const html = `
		  <i class="fas fa-microphone"></i>
		  <span>Mute</span>
		`;
		document.querySelector(".main__mute_button").innerHTML = html;
	};
	
	const setUnmuteButton = () => {
		const html = `
		  <i class="unmute fas fa-microphone-slash"></i>
		  <span>Unmute</span>
		`;
		document.querySelector(".main__mute_button").innerHTML = html;
	};
	

	
const playStop = () => {
	let enabled = myVideoStream.getVideoTracks()[0].enabled;
	// console.log(myVideoStream.getVideoTracks());
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		setPlayVideo();
	} else {
		myVideoStream.getVideoTracks()[0].enabled = true;
		setStopVideo();
	}
}

	const setStopVideo = () => {
		const html = `
		  <i class="fas fa-video"></i>
		  <span>Stop Video</span>
		`;
		document.querySelector(".main__video_button").innerHTML = html;
	};
	
	const setPlayVideo = () => {
		const html = `
		<i class="stop fas fa-video-slash"></i>
		  <span>Play Video</span>
		`;
		document.querySelector(".main__video_button").innerHTML = html;
	};