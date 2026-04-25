# CI/CD Runbook (Backend API)

## Branch strategy

- `develop`: integration branch, CI validation only.
- `master`: release branch, CI + CD deployment.

## CI workflow

File: `.github/workflows/ci.yml`

Jobs run in this order:

1. `lint`
2. `test`
3. `build`
4. `prisma-validate`

Trigger:

- `pull_request` and `push` on `develop`, `main`, `master`.

## CD workflow

File: `.github/workflows/cd.yml`

Trigger:

- `push` on `main`, `master`.

Jobs run in this order:

1. `preflight`: validate required secrets.
2. `build_and_push`: build Docker image and push to Docker Hub.
3. `deploy`: SSH into VPS and deploy with `docker compose pull + up -d`.

## Required GitHub secrets

- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_KEY`
- `BACKEND_APP_PATH`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `REGISTRY_USERNAME`
- `REGISTRY_TOKEN`

## Runtime image strategy

- Image repository: `rderoger/api-gps-based-transit-optimization`
- Tags pushed by CD:
  - `${GITHUB_SHA}` (immutable deploy tag)
  - `latest` (rolling tag)

## Production network and ports

- Public ports expected on VPS:
  - `22` (SSH)
  - `80` (Traefik HTTP)
  - `443` (Traefik HTTPS)
  - `4000` (backend API)
- Postgres `5432` must remain private (not published to host).

## Release checklist

1. Merge feature PR into `develop`.
2. Confirm CI is green on `develop`.
3. Promote `develop -> master`.
4. Confirm CD jobs pass (`preflight`, `build_and_push`, `deploy`).
5. Validate API health from VPS and public endpoint.

## Fast troubleshooting

- `ssh: unable to authenticate`:
  - check `VPS_USER`, `VPS_HOST`, `VPS_PORT`, `VPS_KEY`.
- `Host key verification failed` during clone:
  - ensure `REPO_URL` uses `https://github.com/...` in CD workflow.
- Docker push auth failures:
  - check `REGISTRY_USERNAME` and `REGISTRY_TOKEN`.
- Deploy succeeds but old code runs:
  - verify image tag in `.env` (`IMAGE_TAG`) and `docker compose pull`.
- DB connectivity issues:
  - verify postgres container is healthy and API uses internal network DNS (`postgres`).
