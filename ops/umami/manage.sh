#!/usr/bin/env bash
set -euo pipefail

operation="${1:-inspect}"
admin_password_file="${2:-}"
install_root="/opt/pufeng-umami"
source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
compose_file="$install_root/docker-compose.yml"
env_file="$install_root/.env"
nginx_available="/etc/nginx/sites-available/pufeng-umami.conf"
nginx_enabled="/etc/nginx/sites-enabled/pufeng-umami.conf"
backup_root="/var/backups/pufeng-umami"

require_command() {
  command -v "$1" >/dev/null || {
    echo "缺少命令: $1" >&2
    exit 1
  }
}

inspect_server() {
  echo "HOST=$(hostname)"
  echo "USER=$(id -un)"
  id
  df -h /
  if command -v docker >/dev/null; then
    command -v docker
    docker --version
    docker compose version
  fi
  if command -v nginx >/dev/null; then
    command -v nginx
    nginx -v
  fi
  if command -v certbot >/dev/null; then
    command -v certbot
    certbot --version
    certbot show_account 2>/dev/null || true
  fi
  if command -v getent >/dev/null; then
    getent hosts analytics.pufengwool.com || true
  fi
  if command -v ss >/dev/null; then
    ss -lnt | grep -E ':(80|443|3100)\b' || true
  fi
}

write_secrets_once() {
  if [[ -f "$env_file" ]]; then
    return
  fi

  if [[ -z "$admin_password_file" || ! -s "$admin_password_file" ]]; then
    echo "首次部署需要管理员密码文件" >&2
    exit 1
  fi

  umask 077
  local db_password app_secret admin_password
  db_password="$(openssl rand -hex 32)"
  app_secret="$(openssl rand -hex 32)"
  admin_password="$(<"$admin_password_file")"
  if (( ${#admin_password} < 16 )); then
    echo "Umami 管理员密码至少需要 16 个字符" >&2
    exit 1
  fi
  if [[ "$admin_password" =~ [[:space:]] ]]; then
    echo "Umami 管理员密码不能包含空白字符" >&2
    exit 1
  fi
  cat >"$env_file" <<EOF
POSTGRES_DB=umami
POSTGRES_USER=umami
POSTGRES_PASSWORD=$db_password
DATABASE_URL=postgresql://umami:$db_password@db:5432/umami
APP_SECRET=$app_secret
UMAMI_ADMIN_PASSWORD=$admin_password
EOF
}

install_nginx_vhost() {
  require_command nginx
  require_command systemctl
  if [[ ! -f "$nginx_available" ]]; then
    install -m 644 "$source_root/nginx.conf" "$nginx_available"
  fi
  ln -sfn "$nginx_available" "$nginx_enabled"
  nginx -t
  systemctl reload nginx
}

deploy_umami() {
  require_command docker
  require_command openssl
  require_command python3
  docker compose version >/dev/null

  install -d -m 750 "$install_root" "$backup_root"
  install -m 644 "$source_root/docker-compose.yml" "$compose_file"
  install -m 755 "$source_root/bootstrap.py" "$install_root/bootstrap.py"
  write_secrets_once

  docker compose --env-file "$env_file" -f "$compose_file" pull
  docker compose --env-file "$env_file" -f "$compose_file" up -d
  install_nginx_vhost
  python3 "$install_root/bootstrap.py"
  docker compose --env-file "$env_file" -f "$compose_file" ps
}

show_status() {
  require_command docker
  require_command curl
  require_command python3
  test -f "$env_file"
  test -f "$compose_file"
  docker compose --env-file "$env_file" -f "$compose_file" ps
  curl --fail --silent --show-error http://127.0.0.1:3100/api/heartbeat
  echo
  python3 "$install_root/bootstrap.py"
}

enable_tls() {
  require_command certbot
  if ! certbot show_account >/dev/null 2>&1; then
    echo "Certbot 尚无已注册账户，不能自动申请证书" >&2
    exit 1
  fi
  certbot --nginx \
    --domain analytics.pufengwool.com \
    --non-interactive \
    --agree-tos \
    --redirect
}

backup_database() {
  require_command docker
  require_command gzip
  install -d -m 750 "$backup_root"
  local stamp target
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  target="$backup_root/$stamp.sql.gz"
  docker compose --env-file "$env_file" -f "$compose_file" exec -T db \
    pg_dump -U umami -d umami | gzip -c >"$target"
  chmod 600 "$target"
  echo "BACKUP=$target"
}

case "$operation" in
  inspect)
    inspect_server
    ;;
  deploy)
    deploy_umami
    ;;
  status)
    show_status
    ;;
  enable-tls)
    enable_tls
    ;;
  backup)
    backup_database
    ;;
  *)
    echo "未知操作: $operation" >&2
    exit 2
    ;;
esac
