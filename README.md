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
# Start the gateway server
cd packages/gateway
pnpm dev
```

```bash
# Start the client
cd packages/client
pnpm dev
```

### Modules

- [gateway](packages/gateway) - Gateway server
- [client](packages/client) - Client
- [common](packages/common) - Common code
