#!/usr/bin/env bash
# Empacota backend/ e frontend/, envia para o VPS e reconstrói os containers.
# Uso: ./scripts/deploy.sh [api|app|all]
set -euo pipefail

TARGET="${1:-all}"
VPS_HOST="sombra@144.217.161.241"
VPS_PORT="2222"
VPS_KEY="$USERPROFILE/.ssh/id_ed25519_vps"
VPS_DIR="~/gerenciador-loja"
SSH="ssh -p $VPS_PORT -i $VPS_KEY -o ConnectTimeout=10 $VPS_HOST"
SCP="scp -P $VPS_PORT -i $VPS_KEY"

deploy_api() {
  echo "==> empacotando backend/"
  tar --exclude=node_modules --exclude=.env --exclude=dist --exclude=build \
    -czf /tmp/api-src.tar.gz -C backend .
  $SCP /tmp/api-src.tar.gz "$VPS_HOST:/tmp/"
  $SSH "
    set -e
    rm -rf $VPS_DIR/api/*
    tar -xzf /tmp/api-src.tar.gz -C $VPS_DIR/api
    rm /tmp/api-src.tar.gz
    cd $VPS_DIR
    docker compose build api
    docker compose up -d api
    sleep 3
    docker ps --filter name=gerenciador-loja-api --format 'table {{.Names}}\t{{.Status}}'
  "
  rm -f /tmp/api-src.tar.gz
}

deploy_app() {
  echo "==> empacotando frontend/"
  tar --exclude=node_modules --exclude=.env --exclude=dist --exclude=build \
    -czf /tmp/app-src.tar.gz -C frontend .
  $SCP /tmp/app-src.tar.gz "$VPS_HOST:/tmp/"
  $SSH "
    set -e
    rm -rf $VPS_DIR/app/*
    tar -xzf /tmp/app-src.tar.gz -C $VPS_DIR/app
    rm /tmp/app-src.tar.gz
    cd $VPS_DIR
    docker compose build app
    docker compose up -d app
    sleep 3
    docker ps --filter name=gerenciador-loja-app --format 'table {{.Names}}\t{{.Status}}'
  "
  rm -f /tmp/app-src.tar.gz
}

case "$TARGET" in
  api) deploy_api ;;
  app) deploy_app ;;
  all) deploy_api; deploy_app ;;
  *) echo "uso: $0 [api|app|all]"; exit 1 ;;
esac

echo "==> feito. https://salao.andre-aguiar-jr.com.br"
