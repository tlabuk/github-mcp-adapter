# GitHub MCP Adapter

This Node.js server dynamically exposes [GitHub MCP](https://github.com/github/github-mcp-server) tools as REST endpoints. It launches the MCP server as a subprocess over `stdio` and serves a Swagger/OpenAPI interface for calling tools like `create-issue`, `get-repo`, etc.

## Features

- 🧰 Dynamically registers routes for all MCP tools (e.g., `/tools/create-issue`)
- 📜 Auto-generates OpenAPI spec (`/openapi.json`)
- 🧪 Swagger UI at `/docs` for quick testing
- 🔁 Pipes all requests through the MCP server over `stdio`

---

## Prerequisites

- Node.js 18+
- Docker (optional but recommended)
- A GitHub Personal Access Token
- Python with MCP installed (if running without Docker):

  ```bash
  pip install github-mcp
  ```

---

## Setup

```bash
git clone https://github.com/your-org/mcp-node-adapter.git
cd mcp-node-adapter
npm install
cp .env.example .env
# Edit .env to include your GitHub token
```

---

## Option A: Run With Docker MCP Backend (Recommended)

Build the MCP server:

```bash
git clone https://github.com/github/github-mcp-server.git
cd github-mcp-server
docker build -t github-mcp-server .
```

Start the adapter and pipe output from Docker:

```bash
docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_yYV9IiFqm0RCbr61EFh63Wmoyg4RvIzv \
  github-mcp-server stdio | node index.js
```

---

## Option B: Run With Local MCP (Python)

Make sure MCP is installed:

```bash
pip install github-mcp
```

Then simply run:

```bash
npm start
```

This will spawn `python3 -m mcp.__main__` as a subprocess.

---

## Endpoints

| Method | Path                 | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/tools/<tool-name>` | Call a specific MCP tool       |
| GET    | `/openapi.json`      | OpenAPI 3.0 spec for all tools |
| GET    | `/docs`              | Swagger UI for testing         |

Example:

```bash
curl -X POST http://localhost:3000/tools/create-issue \
  -H "Content-Type: application/json" \
  -d '{"title": "Bug report", "repository": "octocat/hello-world"}'
```

---

## Use with Kong AI Gateway

This adapter supports `/openapi.json` and REST POST calls, which can be integrated into Kong AI Gateway’s `ai-proxy` plugin by referencing the spec and enabling `route_type: llm/v1/chat`.
