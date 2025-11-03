#!/bin/bash

# Script de vérification du statut de l'application médicale
# Usage: ./check-status.sh

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Vérification du statut de l'application médicale ===${NC}"
echo ""

# Vérifier Docker
echo -e "${BLUE}🐳 Docker:${NC}"
if docker --version &> /dev/null; then
    echo -e "  ${GREEN}✅ Docker installé${NC}"
else
    echo -e "  ${RED}❌ Docker non installé${NC}"
fi

# Vérifier Docker Compose
echo -e "${BLUE}🐙 Docker Compose:${NC}"
if docker-compose --version &> /dev/null; then
    echo -e "  ${GREEN}✅ Docker Compose installé${NC}"
else
    echo -e "  ${RED}❌ Docker Compose non installé${NC}"
fi

echo ""

# Vérifier les conteneurs
echo -e "${BLUE}📦 Conteneurs:${NC}"
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(medical-|postgres|rabbitmq|minio)" &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(medical-|postgres|rabbitmq|minio)" | while read line; do
        if echo "$line" | grep -q "Up"; then
            echo -e "  ${GREEN}✅ $line${NC}"
        else
            echo -e "  ${RED}❌ $line${NC}"
        fi
    done
else
    echo -e "  ${YELLOW}⚠️ Aucun conteneur médical en cours d'exécution${NC}"
fi

echo ""

# Vérifier les services
echo -e "${BLUE}🌐 Services:${NC}"

# Application principale
if curl -f -s http://localhost:3000/health &> /dev/null; then
    echo -e "  ${GREEN}✅ Application (port 3000)${NC}"
else
    echo -e "  ${RED}❌ Application (port 3000)${NC}"
fi

# PostgreSQL
if docker exec medical-db pg_isready -U postgres &> /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ PostgreSQL (port 5432)${NC}"
else
    echo -e "  ${RED}❌ PostgreSQL (port 5432)${NC}"
fi

# RabbitMQ
if curl -f -s http://localhost:15672 &> /dev/null; then
    echo -e "  ${GREEN}✅ RabbitMQ Management (port 15672)${NC}"
else
    echo -e "  ${RED}❌ RabbitMQ Management (port 15672)${NC}"
fi

# MinIO
if curl -f -s http://localhost:9001 &> /dev/null; then
    echo -e "  ${GREEN}✅ MinIO Console (port 9001)${NC}"
else
    echo -e "  ${RED}❌ MinIO Console (port 9001)${NC}"
fi

echo ""

# Vérifier l'utilisation des ressources
echo -e "${BLUE}💾 Ressources:${NC}"
echo -e "  ${BLUE}Mémoire:${NC} $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo -e "  ${BLUE}Disque:${NC} $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " utilisé)"}')"

# Vérifier les logs récents
echo ""
echo -e "${BLUE}📋 Logs récents (dernières 5 lignes):${NC}"
if [ -f "/var/log/medical-deploy.log" ]; then
    tail -5 /var/log/medical-deploy.log 2>/dev/null || echo -e "  ${YELLOW}⚠️ Impossible de lire les logs de déploiement${NC}"
else
    echo -e "  ${YELLOW}⚠️ Fichier de log de déploiement non trouvé${NC}"
fi

echo ""
echo -e "${BLUE}=== Fin de la vérification ===${NC}"

# Commandes utiles
echo ""
echo -e "${BLUE}📚 Commandes utiles:${NC}"
echo -e "  ${YELLOW}Voir les logs:${NC} docker-compose -f docker-compose.prod.yml logs -f"
echo -e "  ${YELLOW}Redémarrer:${NC} docker-compose -f docker-compose.prod.yml restart"
echo -e "  ${YELLOW}Arrêter:${NC} docker-compose -f docker-compose.prod.yml down"
echo -e "  ${YELLOW}Démarrer:${NC} docker-compose -f docker-compose.prod.yml up -d" 