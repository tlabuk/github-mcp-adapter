const { spawn } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const token = `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`;

const mcp = spawn('docker', [
    'run', '-i', '--rm',
    '-e', token,
    'github-mcp-server', 'stdio'
]);

mcp.stdout.setEncoding('utf8');
mcp.stderr.setEncoding('utf8');

mcp.on('error', (err) => {
    console.error('Failed to start MCP subprocess:', err);
});

mcp.stderr.on('data', (data) => console.error('MCP stderr:', data));

let buffer = '';
let pendingResponse = null;

mcp.stdout.on('data', (data) => {
    buffer += data;
    let boundary;
    while ((boundary = buffer.indexOf('\n')) >= 0) {
        const message = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 1);
        if (pendingResponse) {
            try {
                const json = JSON.parse(message);
                pendingResponse.json(json);
            } catch (e) {
                pendingResponse.status(500).send('Invalid JSON from MCP');
            }
            pendingResponse = null;
        }
    }
});

app.post('/mcp', (req, res) => {
    if (pendingResponse) return res.status(429).send('Busy');
    pendingResponse = res;
    mcp.stdin.write(JSON.stringify(req.body) + '\n');
});

const port = 3000;
app.listen(port, () => {
    console.log(`GitHub MCP adapter running on http://localhost:${port}/mcp`);
});
