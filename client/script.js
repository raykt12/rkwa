const videoUpload = document.getElementById('videoUpload');
const uploadButton = document.getElementById('uploadButton');
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');

const socket = io();

uploadButton.onclick = async () => {
    const file = videoUpload.files[0];
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        const data = await response.json();
        socket.emit('videoUploaded', data.videoUrl);
    } else {
        console.error('Upload failed');
    }
};

socket.on('videoUploaded', (url) => {
    videoSource.src = url;
    videoPlayer.load();
    videoPlayer.play();
});

videoPlayer.addEventListener('play', () => {
    socket.emit('play', videoPlayer.currentTime);
});

videoPlayer.addEventListener('pause', () => {
    socket.emit('pause', videoPlayer.currentTime);
});

videoPlayer.addEventListener('seeked', () => {
    socket.emit('seek', videoPlayer.currentTime);
});

socket.on('play', (time) => {
    if (videoPlayer.paused) {
        videoPlayer.currentTime = time;
        videoPlayer.play();
    }
});

socket.on('pause', (time) => {
    if (!videoPlayer.paused) {
        videoPlayer.currentTime = time;
        videoPlayer.pause();
    }
});

socket.on('seek', (time) => {
    videoPlayer.currentTime = time;
});
