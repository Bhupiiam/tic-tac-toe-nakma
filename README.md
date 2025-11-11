A simple multiplayer Tic-Tac-Toe game built with **Next.js** and **Nakama**.



How to Run

### **Client Setup**

cd client && cp .env.example .env.local
cd client && pnpm install
cd client && pnpm run dev

Server Setup
bash
cd server && npm install
cd server && docker-compose up

cd server && docker-compose up --build
Ports
7349 → gRPC API Server

7350 → HTTP API Server

7351 → Nakama Console (Web UI)


