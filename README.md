# Party Game Framework

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) - JavaScript runtime
- [pnpm](https://pnpm.js.org/) - Package manager

To install pnpm:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Installing

```bash
pnpm install
```

### Running

```bash
# Start the lobby server
cd packages/lobby
pnpm dev
```

```bash
# Start the client
cd packages/client
pnpm dev
```

### Fundamentals

#### Communication

To create or join a game clients need to find each other. This is done by connecting to a known lobby server. The lobby server is a WebSocket server that keeps track of all the clients that are connected to it and manages them in rooms. The lobby server does not know anything about the game itself, it only knows about the clients that are connected to it and handles the communication between them.

The games themselves follow a client-server model. The server is the host of the game and the clients are the players. The server is responsible for creating the room via the lobby server and for managing the game state. The clients are responsible for sending user input to the server and for rendering the game state.
