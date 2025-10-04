# checkin-report — Guía de Docker + Nginx y Actualización (Stable/Canary)

Esta guía explica cómo **implementar** y **actualizar** la aplicación *checkin-report* (React + TypeScript + Vite) usando Docker, Nginx y GitHub Actions. Incluye un flujo **stable / canary** para probar nuevas versiones sin afectar producción.

---

## 0) Requisitos

* **Ubuntu** con Docker/Compose:

  ```bash
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose-plugin
  sudo usermod -aG docker $USER && newgrp docker
  docker --version && docker compose version
  ```
* Acceso al repo: `ariasbenraq/checkin-report`.
* Imágenes publicadas en **GitHub Container Registry (GHCR)**.
* (Opcional si el paquete es privado) Login a GHCR:

  ```bash
  echo "<YOUR_PAT>" | docker login ghcr.io -u ariasbenraq --password-stdin
  ```

---

## 1) Archivos clave del proyecto

> Estos archivos ya existen en el repo. Aquí queda su referencia.

### 1.1 `Dockerfile`

* Compila con Node (Vite) y sirve con **Nginx**.
* Incluye **healthcheck** usando `curl`.

### 1.2 `nginx.conf`

* Config para **SPA** con fallback a `index.html`.
* Caché larga para assets con hash.

### 1.3 `docker-compose.yml` (stable/canary)

* Dos servicios:

  * `app_stable` (puerto host `8080`)
  * `app_canary` (puerto host `8083`)
* Healthcheck HTTP.

### 1.4 `.env.example` → copia a `.env`

```ini
GH_USER=ariasbenraq
APP_NAME=checkin-report

HOST_PORT_STABLE=8080
HOST_PORT_CANARY=8083

IMAGE_TAG_STABLE=latest
IMAGE_TAG_CANARY=latest  # o un SHA específico
```

### 1.5 `.dockerignore`

* Excluye `node_modules`, `dist`, `.git`, `.env`, etc.

### 1.6 GitHub Actions (`.github/workflows/build.yml`)

* En cada `push` a `main`:

  * Construye la imagen Docker.
  * Publica: `ghcr.io/ariasbenraq/checkin-report:latest` y `:<sha7>`.

---

## 2) Implementación (primer despliegue)

> Ruta recomendada en el servidor: `/home/husares/apps/checkin-report`

1. Crear carpeta y copiar archivos de despliegue:

   ```bash
   mkdir -p /home/husares/apps/checkin-report
   cd /home/husares/apps/checkin-report
   # Copiar `docker-compose.yml` y `.env` desde el repo
   ```

2. Ajustar `.env` si hace falta (puertos/tags).

3. Descargar imágenes y levantar:

   ```bash
   docker compose pull
   docker compose up -d
   ```

4. Verificar:

   ```bash
   docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
   ```

5. Acceso:

   * **Stable**: `http://<IP>:8080`
   * **Canary**: `http://<IP>:8083`

---

## 3) Exponer con ngrok (stable 8080)

1. Autenticar ngrok (una sola vez):

   ```bash
   ngrok config add-authtoken <TU_AUTHTOKEN>
   ```
2. Iniciar túnel (si tienes dominio reservado):

   ```bash
   ngrok http --domain=sloth-sought-hare.ngrok-free.app 8080
   ```
3. Panel de inspección: `http://127.0.0.1:4040`.

> **Nota:** También puedes crear servicio `systemd` para que ngrok quede siempre arriba.

---

## 4) Actualización de la aplicación (canary → stable)

### 4.1 Tras un `git push` a `main`

* Verifica en **GitHub → Actions** que el build termina *Success*.
* Toma el **SHA corto** mostrado en el job (p.ej. `9253740`). La imagen publicada será:
  `ghcr.io/ariasbenraq/checkin-report:9253740`.

### 4.2 Actualizar **canary** (pruebas)

```bash
cd /home/husares/apps/checkin-report
sed -i 's/^IMAGE_TAG_CANARY=.*/IMAGE_TAG_CANARY=<sha_nuevo>/' .env

docker compose pull app_canary
docker compose up -d --no-deps --force-recreate app_canary

# Verificar
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
curl -I http://localhost:8083
```

> Alternativa: dejar `IMAGE_TAG_CANARY=latest` y solo hacer `pull` + `up -d`.

### 4.3 Pruebas funcionales en canary

* Subir PDF real y validar:

  * Áreas y **subáreas** correctas.
  * Conteo "**después de 7:30 a.m.**".
  * Casos borde 7:29 / 7:30 / 7:31.
* Revisar logs: `docker logs -f checkin-report-canary`.

### 4.4 Promover **canary → stable** (producción)

```bash
cd /home/husares/apps/checkin-report
sha=$(grep IMAGE_TAG_CANARY .env | cut -d= -f2)
sed -i "s/^IMAGE_TAG_STABLE=.*/IMAGE_TAG_STABLE=$sha/" .env

docker compose pull app_stable
docker compose up -d --no-deps app_stable

# (opcional) apagar canary
# docker compose rm -fsv app_canary
```

### 4.5 Rollback (si algo falla en prod)

```bash
cd /home/husares/apps/checkin-report
sed -i 's/^IMAGE_TAG_STABLE=.*/IMAGE_TAG_STABLE=<sha_anterior>/' .env

docker compose pull app_stable
docker compose up -d --no-deps app_stable
```

---

## 5) Comandos útiles

```bash
# Ver estado de contenedores
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# Logs (en vivo)
docker logs -f checkin-report-stable
docker logs -f checkin-report-canary

# Inspeccionar health
docker inspect --format='{{json .State.Health}}' checkin-report-stable | jq

# Recrear solo un servicio (aplicando cambios de .env)
docker compose up -d --no-deps --force-recreate app_canary

# Bajar todo y limpiar huérfanos (poco frecuente)
docker compose down --remove-orphans

# Limpiar imágenes no usadas
docker image prune -f
```

---

## 6) Troubleshooting

* **Unhealthy** pero la app responde:

  * Asegúrate de estar usando la imagen con `curl` instalado y healthcheck HTTP.
  * En `docker-compose.yml` el test debe ser: `curl -fsS http://localhost/ || exit 1`.

* **Puerto en uso (p.ej. 8083)**:

  ```bash
  docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep 8083 || true
  sudo ss -ltnp 'sport = :8083'
  # Cambiar HOST_PORT_CANARY en .env o detener el proceso que lo usa
  ```

* **No me descarga la imagen de GHCR** (repo privado):

  ```bash
  echo "<YOUR_PAT>" | docker login ghcr.io -u ariasbenraq --password-stdin
  ```

* **ngrok dice que el dominio no está disponible**:

  * Reserva el dominio en el dashboard de ngrok o usa `ngrok http 8080` sin `--domain`.

---

## 7) Glosario rápido

* **Stable**: versión actual en producción (puerto 8080).
* **Canary**: versión nueva para pruebas (puerto 8083). Se valida aquí antes de promover.
* **Tag `<sha7>`**: identificador único de la imagen creada por GitHub Actions a partir del commit.
* **Rollback**: volver un servicio a un tag anterior conocido-bueno.

---

## 8) Plantilla de notas para el equipo (QA)

* **Objetivo**: Validar nueva versión en *canary* antes de producción.
* **URLs**: Stable `:8080` (ngrok) / Canary `:8083` (interna).
* **Qué probar**: carga de PDF, áreas/subáreas, conteos, casos borde 7:30, errores legibles, rendimiento y navegadores.
* **Criterios de aceptación**: conteos correctos, sin bloqueos, tiempos aceptables.
* **Reporte de bug**: Título, Severidad, Ambiente (Stable/Canary), PDF, Pasos, Esperado, Observado, Evidencia.

---

## 9) Anexos (opcional)

### 9.1 Servicio `systemd` para ngrok

```ini
[Unit]
Description=ngrok tunnel for checkin-report :8080
After=network-online.target
Wants=network-online.target

[Service]
User=husares
Environment=NGROK_CONFIG=/home/husares/.config/ngrok/ngrok.yml
ExecStart=/usr/local/bin/ngrok start checkin --log=stdout
WorkingDirectory=/home/husares
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### 9.2 `~/.config/ngrok/ngrok.yml`

```yaml
version: "2"
authtoken: <TU_AUTHTOKEN>
tunnels:
  checkin:
    addr: 8080
    proto: http
    domain: sloth-sought-hare.ngrok-free.app
    inspect: true
```

---

**Fin.**
