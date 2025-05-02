# Agent Studio

A full-stack application designed for building, managing, and interacting with LangGraph AI agents. Built using a modern tech stack within a Turborepo monorepo.

## Vision

**Warning:** The following diagram is a high-level overview of the vision for the project. It does not represent the current state of the project.

This project aims to provide a comprehensive studio environment for developing, testing, and deploying sophisticated LangGraph AI agents.

This is highly inspired by the LangGraph Platform, a closed-source product, however we are building a fully open-source and self-hostable version of it to empower the community to adopt graph-based AI agents without the uncertainty of vendor lock-in.

![Agentic Flow Overview](./docs/agntic-flow-overview.png)

In this diagram, you can see the high-level overview of the agentic flow in Agent Studio.

The platform once deployed, will allow users to:

- Create AI Agents using LangGraph-js in standalone repositories.
- Deploy AI Agents to the platform using a github action.
- Interact with AI Agents using a web interface (playground).
- Manage organizations and workspaces to group AI Agents.

## Features

- **Monorepo:** Managed with Turborepo and pnpm for efficient builds and dependency management.
- **Frontend:** Built with Next.js (using Turbopack), React 19, TypeScript, Tailwind CSS, and Shadcn UI components.
- **Backend:** Powered by Hono, a fast and lightweight web framework, using TypeScript.
- **API:** Type-safe API layer using tRPC connecting frontend and backend.
- **Database:** ORM layer with Drizzle, likely targeting PostgreSQL.
- **AI Integration:** Leverages LangChain and LangGraph for building complex AI agent workflows, supporting models like OpenAI and Anthropic.
- **Vector Storage:** Utilizes ChromaDB for efficient vector similarity searches.
- **File Storage:** Integration with AWS S3 for file handling.
- **Environment Management:** Secure environment variable handling with T3 Env.

## Tech Stack

- **Monorepo:** Turborepo, pnpm
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI, TanStack Query/Table/Form, tRPC Client
- **Backend:** Hono, TypeScript, Node.js
- **API:** tRPC
- **Database:** Drizzle ORM, PostgreSQL (likely)
- **AI:** LangChain, LangGraph, OpenAI, Anthropic
- **Vector DB:** ChromaDB
- **File Storage:** AWS S3
- **Linting/Formatting:** ESLint, Prettier
- **Development Runner:** tsx

## Prerequisites

- Node.js (>= v20 recommended)
- pnpm (v10.7.1 or compatible)
- Git
- Docker (optional, for `docker-compose.dev.yml`)
- PostgreSQL Database Access
- Required API Keys (see `.env.example`)

## Getting Started

1.  **Initial Setup:**

    ```bash
    pnpm install
    cp .env.example .env
    # Edit .env with your database connection details and API keys
    ```

2.  **Database Migration:**

    ```bash
    # Ensure your database server is running
    pnpm db:push
    ```

3.  **Run Development Servers:**
    ```bash
    pnpm dev
    ```
    - Web: `http://localhost:3000`
    - Server: `http://localhost:3030`

## Available Scripts

Here are some useful scripts available from the root directory:

- `pnpm dev`: Starts the development servers for all apps (`web`, `server`).
- `pnpm build`: Builds all apps for production.
- `pnpm dev:web`: Starts the development server only for the `web` app.
- `pnpm dev:server`: Starts the development server only for the `server` app.
- `pnpm db:push`: Applies database schema changes using Drizzle Kit (targets the `server` app).
- `pnpm db:studio`: Opens Drizzle Studio to interact with your database (targets the `server` app).
- `pnpm lint`: Lints the codebase across all apps.
- `pnpm check-types`: Performs type checking across all apps.
- `pnpm format`: Formats the codebase using Prettier.
- `pnpm clean`: Removes build artifacts and `node_modules` directories.

## License

This project is licensed under the MIT License. See the [LICENCE](./LICENCE) file for details.
