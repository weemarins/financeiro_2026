#!/bin/bash

# Script para fazer backup do banco de dados

BACKUP_DIR="./backups"
DB_FILE="./data/financeiro.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/financeiro_$TIMESTAMP.db"

# Criar diretório de backups
mkdir -p $BACKUP_DIR

# Fazer backup
if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_FILE"
    echo "✓ Backup criado: $BACKUP_FILE"
else
    echo "✗ Arquivo de banco de dados não encontrado: $DB_FILE"
    exit 1
fi

# Manter apenas os últimos 7 backups
BACKUP_COUNT=$(ls $BACKUP_DIR | wc -l)
if [ $BACKUP_COUNT -gt 7 ]; then
    OLD_BACKUPS=$(ls -t1r $BACKUP_DIR | head -n $((BACKUP_COUNT - 7)))
    for backup in $OLD_BACKUPS; do
        rm "$BACKUP_DIR/$backup"
        echo "✓ Backup antigo removido: $backup"
    done
fi

echo "✓ Backup concluído!"
