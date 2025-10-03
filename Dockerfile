# ----- Runtime stage -----
FROM nginx:alpine AS runtime

# Instalar curl para el healthcheck
RUN apk add --no-cache curl

# Quitar default y copiar nuestra conf + estáticos
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Menos verbosidad
RUN sed -i 's/error_log .*/error_log \/var\/log\/nginx\/error.log warn;/' /etc/nginx/nginx.conf

EXPOSE 80

# Healthcheck con curl (falla si no recibe 200)
HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
  CMD curl -fsS http://localhost/ >/dev/null || exit 1

CMD ["nginx", " -g", "daemon off;"]
