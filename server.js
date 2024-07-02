import { createServer } from "http";
import { parse } from "url";
import { WebSocketServer } from "ws";
import { v4 as makeId } from "uuid";

const port = process.env.PORT || 3000;
const hostname = "localhost";  // or your hostname

// A simple HTTP server
const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
}).listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Create a WebSocket server instance
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const { pathname } = parse(request.url, true);
  if (pathname === "/multiplayer") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws) => {
  const id = makeId();
  console.log(`Client connected: ${id}`);

  // Send a welcome message to the client
  ws.send(JSON.stringify({ message: "Welcome to the WebSocket server!" }));

  // Handle incoming messages from clients
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    // Echo the received message back to the client
    ws.send(`Server received: ${message}`);
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log(`Client disconnected: ${id}`);
  });
});

console.log("WebSocket server listening...");
