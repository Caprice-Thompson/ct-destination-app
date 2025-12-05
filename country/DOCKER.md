# Docker Commands Reference

Quick reference for managing Docker containers and services in this project.

## Project Services

- **postgres**: PostgreSQL 15 database
- **Container name**: `country-service-db`
- **Network**: `country-network`
- **Volume**: `postgres_data`

---

## Docker Compose Commands

All commands should be run from the project root: `/Users/caprthom/Documents/Repo/ct-destination-app`

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres

# Start and view logs
docker-compose up
```

### Stop Services

```bash
# Stop all services (containers remain)
docker-compose stop

# Stop specific service
docker-compose stop postgres

# Stop and remove containers (volumes persist)
docker-compose down

# Stop and remove containers + volumes (deletes all data)
docker-compose down -v

# Remove orphaned containers
docker-compose down --remove-orphans
```

### View Logs

```bash
# View logs for all services
docker-compose logs

# Follow logs (live tail)
docker-compose logs -f

# Logs for specific service
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 postgres
```

### Service Status

```bash
# List running services
docker-compose ps

# Check service health
docker-compose ps postgres
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart postgres
```

---

## Direct Docker Commands

### List Containers

```bash
# Running containers only
docker ps

# All containers (including stopped)
docker ps -a

# Filter by name
docker ps -a | grep country

# Show container sizes
docker ps -s
```

### Remove Containers

```bash
# Remove specific container (must be stopped first)
docker rm country-service-db

# Force remove (even if running)
docker rm -f country-service-db

# Remove by container ID
docker rm -f 0fa0d52ebf51

# Remove all stopped containers
docker container prune

# Remove multiple containers
docker rm container1 container2 container3

# Remove all containers (dangerous!)
docker rm -f $(docker ps -aq)
```

### Container Logs

```bash
# View logs
docker logs country-service-db

# Follow logs (live tail)
docker logs -f country-service-db

# Last 100 lines
docker logs --tail=100 country-service-db

# Logs with timestamps
docker logs -t country-service-db

# Logs since specific time
docker logs --since 30m country-service-db
```

### Execute Commands in Container

```bash
# Open shell inside container
docker exec -it country-service-db sh

# Run PostgreSQL shell
docker exec -it country-service-db psql -U dev_user -d country_db

# Run single SQL command
docker exec country-service-db psql -U dev_user -d country_db -c "SELECT version();"

# Run as specific user
docker exec -u postgres -it country-service-db sh
```

### Inspect Container

```bash
# Full container details
docker inspect country-service-db

# Get specific info (IP address)
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' country-service-db

# Container stats (CPU, memory, etc.)
docker stats country-service-db

# Real-time stats for all containers
docker stats
```

---

## Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect ct-destination-app_postgres_data

# Remove specific volume (container must be stopped)
docker volume rm ct-destination-app_postgres_data

# Remove all unused volumes
docker volume prune

# Remove volumes when stopping services
docker-compose down -v
```

---

## Network Management

```bash
# List networks
docker network ls

# Inspect network
docker network inspect ct-destination-app_country-network

# Remove network
docker network rm ct-destination-app_country-network

# Remove all unused networks
docker network prune
```

---

## Image Management

```bash
# List images
docker images

# Remove specific image
docker rmi postgres:15-alpine

# Remove unused images
docker image prune

# Remove all unused images (not just dangling)
docker image prune -a

# Pull latest version of image
docker pull postgres:15-alpine
```

---

## Database Specific Commands

### Connect to Database

```bash
# Using docker exec
docker exec -it country-service-db psql -U dev_user -d country_db

# Using psql from host (if installed)
psql postgresql://dev_user:dev_password@localhost:5432/country_db

# Using npm script (from country directory)
cd country
npm run db:shell
```

### Database Operations

```bash
# Check database is accepting connections
docker exec country-service-db pg_isready -U dev_user -d country_db

# List databases
docker exec -it country-service-db psql -U dev_user -c "\l"

# List tables
docker exec -it country-service-db psql -U dev_user -d country_db -c "\dt"

# Run SQL file
docker exec -i country-service-db psql -U dev_user -d country_db < migration.sql

# Dump database
docker exec country-service-db pg_dump -U dev_user country_db > backup.sql

# Restore database
docker exec -i country-service-db psql -U dev_user -d country_db < backup.sql
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker logs country-service-db

# Check if port is already in use
lsof -i :5432

# Remove and recreate
docker rm -f country-service-db
docker-compose up -d postgres
```

### Container Name Conflict

```bash
# Error: "The container name is already in use"
docker rm -f country-service-db
docker-compose up -d postgres
```

### Database Connection Issues

```bash
# Verify container is running
docker ps | grep country-service-db

# Check container health
docker inspect --format='{{.State.Health.Status}}' country-service-db

# Test connection from inside container
docker exec country-service-db pg_isready -U dev_user -d country_db

# Check environment variables
docker exec country-service-db env | grep POSTGRES
```

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove all containers, networks, and volumes
docker system prune -a --volumes

# Start fresh
docker-compose up -d postgres
```

---

## Cleanup Commands

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Clean up everything (be careful!)
docker system prune -a --volumes

# See disk usage
docker system df
```

---

## Useful Aliases

Add these to your `~/.zshrc`:

```bash
# Docker aliases
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dps='docker ps'
alias dpsa='docker ps -a'
alias dex='docker exec -it'

# Project specific
alias db-start='cd /Users/caprthom/Documents/Repo/ct-destination-app && docker-compose up -d postgres'
alias db-stop='cd /Users/caprthom/Documents/Repo/ct-destination-app && docker-compose stop postgres'
alias db-logs='docker logs -f country-service-db'
alias db-shell='docker exec -it country-service-db psql -U dev_user -d country_db'
```

Then reload: `source ~/.zshrc`

---

## Quick Reference Card

| Task             | Command                                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| Start database   | `docker-compose up -d postgres`                                         |
| Stop database    | `docker-compose stop postgres`                                          |
| View logs        | `docker logs -f country-service-db`                                     |
| Connect to DB    | `docker exec -it country-service-db psql -U dev_user -d country_db`     |
| Remove container | `docker rm -f country-service-db`                                       |
| Reset everything | `docker-compose down -v`                                                |
| Check status     | `docker ps`                                                             |
| Check health     | `docker inspect --format='{{.State.Health.Status}}' country-service-db` |

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Database Setup Guide](./country/DATABASE.md)
