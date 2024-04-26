const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
app.use(cors());
const server = http.createServer(app);
const port = 5050
const io = socketIo(server, {
    cors: {
        origin: "*", // Update this with your client's domain
        methods: ["GET", "POST"]
    }
});

app.use(bodyParser.json());

const users: L_User[] = [
    { username: "admin", password: "1234" }
];

const userSessions: Map<string, string> = new Map();
const sessionParticipants: L_Session[] = [];
const sessionMessages: Map<string, string[]> = new Map();
const activeRooms = {};


app.post("/login/admin", (request, response) => {
    //fetch username and password from the body

    const { username, password } = request.body;

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        response.json({ message: 'Login successful' });
    } else {
        response.status(401).json({ error: 'Invalid username or password' });
    }
})

app.post("/login/participant", (request, response) => {
    //fetch username and password from the body

    const { username, password, sessionId } = request.body;

    const r_session = sessionParticipants.find((session) => session.id == sessionId)

    if(!r_session){
        response.status(401).json({ error: 'Invalid session' });
    }

    const user = r_session?.participants.find(user => user.username === username && user.password === password);

    if (user) {
        response.json({ message: 'Login successful' });
    } else {
        response.status(401).json({ error: 'Invalid username or password' });
    }
})

app.get("/session", (request, response) => {
    const { username } = request.body;

    const user = users.find(user => user.username === username);
    if (user) {
        const session = userSessions.get(user.username);
        if (session) {
            response.json({ session });
        } else {
            response.status(404).json({ error: 'Session not found' });
        }
    }
    else {
        response.status(404).json({ error: 'User not found' });
    }
});

app.post("/session", (request, response) => {
    const data = request.body;
    console.log(data);
    const user = users.find(user => user.username === data.username);

    if (user) {
        const sessionId = Math.random().toString(36).substring(7);
        const participants = data.participants;

        if (participants) {
            const temp_users: L_User[] = [];
            for (const p of participants) {
                temp_users.push({ username: p.username, password: p.password })
            }
            const session: L_Session = { id: sessionId, participants: temp_users };
            console.log(`Session create: ${sessionId}, Users: ${temp_users.toString()}`)
            sessionParticipants.push(session);
            userSessions.set(user.username, sessionId);
        }
        response.json({ sessionId });
    } else {
        response.status(404).json({ error: 'User not found' });
    }
}); // to create a new session, returns the id of newly created session

app.get('/chatroom/:sessionId', (req, res) => {
    // Handle potential errors with sessionId
    const sessionId = req.params.sessionId;
    if (!sessionId) {
    //   return res.status(400).send('Missing sessionId parameter');
    }
  
    // Create a new namespace for the chatroom with the sessionId
    const chatroom = io.of(`/chatroom/${sessionId}`);
  
    chatroom.on('connection', (socket) => {
      console.log(`Socket connected to chatroom: ${sessionId}`);
  
      // Handle socket events specific to this chatroom
      socket.on('message', (data) => {
        console.log(`Message received in ${sessionId}: ${data}`);
        // Broadcast the message to all connected sockets in the chatroom
        chatroom.emit('message', data);
      });
  
      // Handle socket disconnection
      socket.on('disconnect', () => {
        console.log(`Socket disconnected from chatroom: ${sessionId}`);
      });
    });
  
    // Send a success response to the UI
    res.send('Chatroom created');
  });



io.of('/hello').on("connection", (socket) => {
    console.log("Client connected at Hello");
})

io.on('connection', (socket) => {
    let roomId;

    socket.on('createRoom', (payload) => {

        // activeRooms[payload.sessionId] = { users: [payload.username], messages: [] };
        // socket.join(payload.sessionId);
        // socket.emit('roomCreated', payload);
        console.log(`MSG createRoom => Payload recieved: ${JSON.stringify(payload)}`);
    });

    socket.on('joinRoom', (payload) => {

        const room = activeRooms[payload];
        if(!room){
            activeRooms[payload] = {events:[]};
            console.log(`New room created: ${payload}`);
            activeRooms[payload].userCount = 1;
        }
        console.log(`All rooms: ${JSON.stringify(activeRooms)}`);
        if (room) {
            socket.join(payload);
        //     // Send chat history to the new user
            const events = activeRooms[payload].events;
            socket.emit('allEvents', events);
            activeRooms[payload].userCount++;
        }
        console.log(`MSG joinRoom => Payload recieved: ${JSON.stringify(payload)}`);
    });

    // Handler for sending a message
    socket.on('updateEvents', (payload) => {
        const { sessionId, newEvents} = payload;
        const room = activeRooms[sessionId];
        if (room) {
            console.log(`Updating events for room: ${sessionId}`);
            room.events= newEvents;
            io.to(sessionId).emit('updateEvents', newEvents);
        }
        console.log(`All rooms: ${JSON.stringify(activeRooms)}`);
        console.log(`MSG updateEvents => Payload received: ${JSON.stringify(payload)}`);
    });

    // Handler for disconnecting
    socket.on('disconnect', () => {
        // if (roomId) {
        //     const room = activeRooms[roomId];
        //     if (room) {
        //         room.users = room.users.filter(userId => userId !== socket.id);
        //         io.to(roomId).emit('userLeft', { userId: socket.id });
        //         if (room.users.length === 0) {
        //             console.log(`deleting room: ${roomId} since total  users are: ${room.users.length}`)
        //             delete activeRooms[roomId];
        //         }
        //     }
        // }
        console.log(`Disconnecting...`);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// types
type L_User = {
    username: string,
    password: string,
}

type L_Session = {
    id: string
    participants: L_User[]
}
