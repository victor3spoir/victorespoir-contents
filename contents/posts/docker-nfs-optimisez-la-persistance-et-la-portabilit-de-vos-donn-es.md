---
title: "Docker + NFS : Optimisez la persistance et la portabilité de vos données"
description: "Une approche auto-hébergée pour centraliser les volumes Docker, faciliter les backups et renforcer la résilience de vos environnements de production."
published: false
coverImage: "https://raw.githubusercontent.com/victor3spoir/victorespoir-contents/main/contents/images/f07191c2-5a3c-445f-b5fa-f83e9152980d.png"
createdAt: "2025-12-20T04:10:33.285Z"
updatedAt: "2025-12-20T04:10:33.285Z"
tags: ["docker", "devops"]
---

La persistance des données est un sujet important quand l'on travaille avec Docker, surtout à partir du moment où nous travaillons avec des applications hébergeant des données sensibles et/ou importantes. L'utilisation des volumes de Docker permet de persister les données entre les lancements et les arrêts des conteneurs Docker.

## La problématique

La gestion des volumes Docker représente un défi pour les développeurs et les petites structures. Les volumes locaux assurent la persistance, mais limitent la mobilité, la centralisation et la facilité de sauvegarde. Les solutions cloud comme AWS EFS, S3 ou Azure Files sont puissantes, mais souvent coûteuses et complexes à déployer pour des projets modestes. Il devient donc essentiel de proposer une alternative simple, économique et auto-hébergée.

## L'approche de solution

Docker associé à NFS offre une solution légère et flexible pour centraliser la gestion des volumes.

![image](https://raw.githubusercontent.com/victor3spoir/victorespoir-contents/main/contents/images/d20a29a3-e621-4512-b2f7-f00d22878bc6.png)

### Installer et configurer un serveur NFS

Commencez par installer un serveur NFS sur votre serveur de production (Ubuntu pour cet article). Configurez le dossier cible avec les droits adaptés :

* **Installer NFS sur votre serveur**

```bash
# Installer le NFS
sudo apt update -qqy
sudo apt install nfs-kernel-server -y
```

* **Créer le dossier cible** qui va centraliser toutes les données des volumes de vos applications (le choix du dossier est à votre convenance).

```bash
mkdir -p /usr/storage/docker-prod
```

* **Configurer le NFS** pour prendre en compte votre dossier cible: `nvim /etc/exports`

```bash
/usr/storage/docker-prod *(rw,async,no_subtree_check,no_root_squash)
```

Checker les configurations avec la commande `sudo exportfs -a`

* **Activer et Démarrer votre NFS**

```bash
# Activer et démarrer le service du nfs
sudo systemctl enable nfs-kernel-server.service
sudo systemctl start nfs-kernel-server.service
```

> **Très important: Assurer que le NFS est uniquement accessible depuis le localhost du serveur. c'est qui nous dispense de lui appliquer une authentification.**

Votre NFS est prêt pour l'emploi. Nous pouvons passer à la création des services docker et à leurs configurations.

### Configuration pour vos volumes Docker

Pour la création des configurations des volumes de vos applications, vous devrez ajouter quelques instructions supplémentaires.

**La version cli pour docker**

```bash
docker volume create \
  --driver local \
  --opt type=nfs \
  --opt device=:/usr/storage/docker-prod/appname \
  --opt o=addr=127.0.0.1,rw \
  appname-vol
```

**La version *yml* pour docker-compose**

```yml
volumes: 
  appname-vol: 
    name: appname-vol 
    driver: local 
    driver_opts:
      type: nfs 
      device: :/usr/storage/docker-prod/appname 
      o: 'addr=127.0.0.1,rw'
```

Pour chaque nouvelle application que vous devez déployer, créez un dossier correspondant à l'application dans le dossier de centralisation. pour une application ***nginx***, vous créer un dossier `/usr/storage/docker-prod/nginx`, et l'instruction `driver_opts:device` du volume doit pointer vers le dossier `/usr/storage/docker-prod/nginx`.

**Voici un exemple concret** : je veux lancer l'application ***infisical*** sur mon serveur de production.

Voici mon fichier de configuration (pour des soucis de clarté, j'ai omis certaines instructions dans la configuration) :

```yml
name: infisical

volumes:
  infisical-db-vol:
    name: infisical-db-vol
    driver: local
    driver_opts:
      type: nfs 
      device: :/usr/storage/docker-prod/infisical/db 
      o: 'addr=127.0.0.1,rw'
  infisical-redis-vol:
    driver: local
    name: infisical-redis-vol
    driver_opts:
      type: nfs 
      device: :/usr/storage/docker-prod/infisical/redis
      o: 'addr=127.0.0.1,rw'

networks:
  infisical-net: {}

services:
  infisical-backend:
    depends_on:
      infisical-db:
        condition: service_healthy
      infisical-redis:
        condition: service_started
    image: infisical/infisical:latest-postgres
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 500MiB
          cpus: 0.3
    environment:
      - NODE_ENV=production
    networks:
      - infisical-net
  infisical-redis:
    image: redis:8-alpine
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 500MiB
          cpus: 0.3
    environment:
      - ALLOW_EMPTY_PASSWORD=yes
    networks:
      - infisical-net
    volumes:
      - infisical-redis-vol:/data
  infisical-db:
    image: postgres:17-alpine
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 500MiB
          cpus: 0.3
    environment:
      - POSTGRES_USER
      - POSTGRES_PASSWORD
      - POSTGRES_DB
    volumes:
      - infisical-db-vol:/var/lib/postgresql/data
    networks:
      - infisical-net
```

**Lancer l'application**

```bash
# Créer les dossiers de l'application dans le dossier de centralisation.
mkdir -p /usr/storage/docker-prod/infisical/{db,redis}

# Lancer l'application
docker-compose -f /path/to/infisical/compose.yml up -d
```

Et boom, votre application est lancée, les données de votre application seront bien présentes dans le dossier cible désigné.

### Créer une tache de sauvegarde et de synchronisation

![image](https://raw.githubusercontent.com/victor3spoir/victorespoir-contents/main/contents/images/96dbfe18-c550-4d3e-9de0-3668a7ad0ea4.png)

A présent, vos configurations sont terminées, vos applications fonctionnent, et surtout, les données de vos applications sont centralisées.

La dernière étape est la mise en place d'une tâche de synchronisation des données depuis votre serveur vers votre **serveur backup** (que vous avez de préférence dans votre entreprise, ou chez vous, et qui est actif en plein de préférence aussi).

Deux outils peuvent être utilisés : ***rsync******* ou ***rsnapshot***&#x20;

Nous allons utiliser *rsync* pour cet article.

**Installer rsync**

```bash
# Installer rsync
sudo apt update -qqy
sudo apt install rsync

# Créer le dossier cible pour les backups
mkdir -p /usr/backups/docker-prod
```

**Configurer les accès**

*rsync* aura besoin de se connecter à votre serveur de production via ssh pour faire la synchronisation. Vous devez configurer le client ssh du serveur backup avec les clés ssh. (la configuration ssh est hors du scope de cet article, il existe une panoplie d'articles sur comment le faire).

**Créer la tâche automatisée avec crontab** :&#x20;

Cette tâche synchronise les données des volumes de mes applications depuis le serveur de production sur mon serveur de backup local. La fréquence et les heures de synchronisation dépendent que de vous et de vos préférences :

```bash
0 2 * * * rsync -avz user@remote-srv:/usr/storage/docker-prod/ /local/backup/docker-prod/
```

A l'avenir, quand vous voudrez changer de serveur de production, vous aurez juste à répliquer les mêmes configurations et les données de backup sur le nouveau serveur de production.

## La conclusion

J'utilise Docker avec NFS au quotidien, autant dans mes projets personnels que professionnels. Avec des moyens limités, cette solution m'a souvent sauvé des casse-tête. Ce n'est pas la solution ultime, mais elle reste simple, fiable et accessible. Elle permet de centraliser les volumes sans dépendre de services coûteux. Pour les petites équipes ou les développeurs solo, c'est un bon compromis.