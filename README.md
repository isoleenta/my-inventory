# My inventory app

This repository provides a minimal and production-ready starter template for building fast Laravel APIs using **Laravel Octane** and **RoadRunner**, preconfigured with Docker and Docker Compose. It supports both **MySQL** and **PostgreSQL** databases.

---

## ⚙️ Prerequisites

Make sure the following are installed on your machine:

* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)

---

## 📁 Project Structure

```
.
├── app/                    # Laravel application
├── bootstrap/
├── config/
├── docker/                 # Docker-related configs (php.ini, .bashrc, entrypoints)
│   └── php/
├── public/
├── routes/
├── storage/
├── tests/
└── docker-compose.yaml
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://bitbucket.org/empat_tech/laravel-api-template-next.git
cd laravel-api-template-next
```

### 2. Prepare environment

```bash
cp .env.example .env
```

Optionally create `auth.json` if you're using Laravel Nova:

```json
{
  "http-basic": {
    "nova.laravel.com": {
      "username": "your-email",
      "password": "your-token"
    }
  }
}
```

### 3. Start development environment

Build and launch the API container:

```bash
docker-compose up -d
```

### 4. Migrate database

```bash
docker-compose exec api bash
php artisan migrate
```

### 5. Enable GrumPHP

After all dependencies are install, from within api container, run
```bash
vendor/bin/grumphp git:init
```
### You must commit with api container running. It is necessary to be able to run unit tests suite on `testing` database.

---

## 🧰 Services Overview

| Service    | Description                         | Port                               |
|------------|-------------------------------------|------------------------------------|
| `api`      | Laravel Octane API with RoadRunner  | `http://localhost:${APP_PORT:-80}` |
| `postgres` | PostgreSQL 18.1 (default)           | `${FORWARD_DB_PORT:-5432}`         |
| `redis`    | Redis server for queues/cache       | `${FORWARD_REDIS_PORT:-6379}`      |
| `horizon`  | Queue manager (disabled by default) |                                    |

---

## 🤖 MCP Server Integration

This project includes **Laravel Boost** - an MCP (Model Context Protocol) server that enhances AI-assisted development by providing essential context and structure for generating high-quality, Laravel-specific code.

### Features

- **15+ Specialized Tools**: Database queries, Artisan commands, configuration inspection, and more
- **Documentation API**: Access to 17,000+ pieces of Laravel-specific information with semantic search
- **AI Guidelines**: Composable guidelines for Laravel ecosystem packages
- **Real-time Context**: Application info, routes, models, and environment variables

### Available MCP Tools

| Tool | Description |
|------|-------------|
| Application Info | Read PHP & Laravel versions, database engine, ecosystem packages |
| Database Query | Execute queries against the database |
| Database Schema | Read the database schema |
| List Artisan Commands | Inspect available Artisan commands |
| List Routes | Inspect application routes |
| Search Docs | Query Laravel documentation API |
| Tinker | Execute arbitrary code within application context |
| Browser Logs | Read logs and errors from browser |
| Get Config | Get configuration values using dot notation |
| Last Error | Read last error from application logs |

### Setup in Cursor

1. **Add Laravel Boost MCP**  
   In Cursor, open **Settings** → **Tools & MCP** and add the Laravel Boost MCP server (this project’s `.cursor/mcp.json` already defines it).

2. **Enable the server**  
   On the **Tools & MCP** tab, turn on the **Laravel Boost** server so Cursor can use its tools (database, Artisan, docs search, Tinker, etc.).

3. **Frontend development (optional)**  
   For frontend debugging and inspection, we recommend installing the **Chrome DevTools** MCP in Cursor. It integrates with Chrome for DOM inspection, console logs, and network analysis.

---

## 🧪 Useful Commands

| Action                                               | Command                        |
|------------------------------------------------------|--------------------------------|
| Start all services                                   | `docker-compose up -d`         |
| Stop all services                                    | `docker-compose down`          |
| Rebuild API service                                  | `docker-compose build api`     |
| Enter API container                                  | `docker-compose exec api bash` |
| View logs                                            | `docker-compose logs -f api`   |
| Run basic healthchecks <br/> (from within container) | `php artisan health:check`     |

---

## 🧼 Notes

* The container uses a custom non-root user `www` with UID `1000`.
* `.bashrc` and `php.ini` are mounted from `docker/php/` for full customization.
* Laravel Octane is configured to run via RoadRunner on port `8080` internally.
* PostgreSQL 18+ images now persist data in `/var/lib/postgresql/<major>/main`, so we mount the entire `/var/lib/postgresql` tree. If you previously ran this stack, either run `pg_upgrade` or wipe the old volume before restarting: `docker compose down && docker volume rm my-inventory_postgres` (destroys existing data).

---

## 🎁 Production

This template is optimized for both local and production use. You can base your production Dockerfile on the same structure by switching to a build stage that installs `--no-dev` dependencies and disables volumes.

---

## 🆘 Support

If you encounter issues:

1. Run `docker-compose logs -f`
2. Rebuild: `docker-compose up -d --build`
3. Restart containers
4. Check your `.env` configuration
