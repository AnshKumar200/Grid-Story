require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const postgres = require('postgres');
const cors = require('cors');

const PORT = process.env.PORT || 8080;
const database = postgres(process.env.DATABASE_URL);

(async () => {
    try {
        const res = await database`select now()`;
        console.log('connected to the database at', res[0].now);
    } catch (err) {
        console.error('error connecting to the database', err);
    }
})();

const app = express();
app.use(cors());

app.get('/api/canvas', async (req, res) => {
    try {
        const result = await database`select x, y, color from pixels`;
        res.json(result);
    } catch (err) {
        console.error('error fetching canvas:', err);
        res.status(500).json({ error: 'failed to fetch canvas.' });
    }
});

// TODO: timelapse
app.get('/api/timelapse', async (req, res) => {
    res.send('TOOD')
});


const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === 1) {
            client.send(data);
        }
    });
};

wss.on('connection', ws => {
    console.log('client connected');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.payload) {
                const { x, y, color, user_id } = data.payload;

                if (typeof x !== 'number' || typeof y !== 'number' || !color.match(/^#[0-9a-fA-F]{6}$/)) {
                    console.error('invlaid payload:', data.payload);
                    return;
                }

                await database`
                    uddate pixels
                    set color = ${color}, user_id = ${user_id}, created_at = now()
                    where x = ${x} AND y = ${y}
                `

                const broadcastPayload = {
                    payload: { x, y, color, user_id }
                };
                wss.broadcast(JSON.stringify(broadcastPayload));
            }
        } catch (err) {
            console.error('failed to process the message:', err);
        }
    });

    ws.on('close', () => {
        console.log('client disconnected');
    });

    ws.on('error', (error) => {
        console.error('webSocket error:', error);
    });
});

server.listen(PORT, () => {
    console.log(`server is listening on:`, PORT);
});


