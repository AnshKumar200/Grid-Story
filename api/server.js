require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const postgres = require('postgres');
const cors = require('cors');

const PORT = process.env.PORT || 7878;
const database = postgres(process.env.DATABASE_URL);

const PIXEL_COOLDOWN_MS = 5000;

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

app.get('/api/timelapse', async (req, res) => {
    try {
        const result = await database `select x, y, color, created_at from pixels order by created_at asc`;
        res.json(result);
    } catch (err) {
        console.error('error fetching timelapse data:', err);
        res.status(500).json({ error: 'failed to fetch timelapse.' });
    }
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
    ws.lastPixelPlacement = 0;

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'placePixel' && data.payload) {
                
                const lastPlacement = ws.lastPixelPlacement || 0;
                const now = Date.now();
                const diff = now - lastPlacement;

                if (diff < PIXEL_COOLDOWN_MS) {
                    ws.send(JSON.stringify({
                        type: 'cooldownViolation',
                        payload: { remaining: PIXEL_COOLDOWN_MS - diff }
                    }));
                    return;
                }

                const { x, y, color, userId } = data.payload;

                if (typeof x !== 'number' || typeof y !== 'number' || !color.match(/^#[0-9a-fA-F]{6}$/)) {
                    console.error('invalid pixel data received:', data.payload);
                    return;
                }

                await database`
                    UPDATE pixels
                    SET color = ${color}, user_id = ${userId || 'anonymous'}, created_at = NOW()
                    WHERE x = ${x} AND y = ${y};
                `;

                ws.lastPixelPlacement = Date.now();

                ws.send(JSON.stringify({
                    type: 'startCooldown',
                    payload: { duration: PIXEL_COOLDOWN_MS }
                }));

                const broadcastPayload = {
                    type: 'updatePixel',
                    payload: { x, y, color }
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