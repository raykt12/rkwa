const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static('uploads'));

// Handle video upload
app.post('/upload', upload.single('video'), (req, res) => {
    const videoUrl = `/uploads/${req.file.filename}`;
    res.json({ videoUrl });
    io.emit('videoUploaded', videoUrl);
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('play', (time) => {
        socket.broadcast.emit('play', time);
    });

    socket.on('pause', (time) => {
        socket.broadcast.emit('pause', time);
    });

    socket.on('seek', (time) => {
        socket.broadcast.emit('seek', time);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
