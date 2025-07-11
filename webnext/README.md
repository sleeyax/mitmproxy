# mitmwebnext

Next-generation web interface for mitmproxy, designed for modern browsers and workflows.

> [!IMPORTANT]  
> This project is under active development. It is not suitable for production use yet. We welcome contributions and feedback!

## Introduction

I've been waiting for a better mitmweb for years. It never came so I decided to build it myself. This project is a rewrite\* of the original mitmweb, aiming to provide a modern, responsive, and user-friendly interface for mitmproxy.

\*The wheel should not be reinvented when we don't have to. Therefore we reuse parts from the original web project such as the redux store (state management), websocket backend and keyboard shortcuts. This allows us to focus on building the UI/UX and new features without duplicating existing functionality.

> [!WARNING]  
> We aim to maintain backward compatibility (at least for now). The original web project must remain a standalone application. Any changes to it should be implemented without disrupting existing functionality.

## Features

This project introduces the following new features:

- **Modern UI/UX**: Built with Vite, TypeScript, React, Tailwind CSS, Radix UI, and shadcn/ui for a fast, responsive, and accessible experience.
- **Split Panels**: Interact with the request and response side-by-side.
- **Colored URLs**: URL segments are color-coded for clarity, with easy copy-to-clipboard functionality.
- **Useful Notes**: Multiline comment field for each flow, with support for Markdown formatting (planned).
- **Dark & Light Mode**: Adapts to your system preference automatically.

... and more to come!

## Getting Started

### Prerequisites

- mitmproxy codebase (see [CONTRIBUTING](../CONTRIBUTING.md))
- Python, Node.js & npm

### Development

> [!NOTE]
> The development server runs as a separate process to enable hot module replacement for the project.

1. Install the dependencies:

   ```bash
   cd webnext
   npm install
   cd ../web
   npm install
   ```

2. Build local dependency:

   ```bash
   # in the web directory:
   npm run tsc
   ```

3. Start the development server:

   ```bash
   # at the project root:
   uv run --active mitmweb
   # in the webnext directory (in a separate terminal):
   npm run dev
   ```

This should start the mitmweb server and the Vite development server concurrently:

- mitmweb: `http://127.0.0.1:8081/?token=<token>`
- Vite dev server: `http://127.0.0.1:5173/`

The Vite dev server proxies API and websocket requests to mitmweb (port 8081 is assumed):

- `http://127.0.0.1:5173/flows` → `http://127.0.0.1:8081/flows`
- `ws://127.0.0.1:5173/updates` → `ws://127.0.0.1:8081/updates`

### Production

> [!NOTE]
> The project is served statically by mitmweb's Python backend (Tornado).

1. Create a production build:

   ```bash
   # in the web directory:
   npm run tsc
   # in the webnext directory:
   npm run build
   ```

   The output will be placed in the `dist` directory and automatically copied to `mitmproxy/tools/webnext`.

2. Serve the production build:

   ```bash
   uv run --active mitmwebnext
   ```

This should start the mitmwebnext server.

To proxy requests, similar to the development setup, you can use the included mitmproxy addon:

```bash
uv run --active mitmweb
mitmdump --mode reverse:http://localhost:8081@8082 -s webnext/addon.py
```

Point your browser to `http://localhost:8082/`. Using this approach you can compare the original web and the new webnext interface production builds side by side, both using the same proxy server on port `8080`.
