#!/bin/bash
#
# Usage: run from project directory: ./scripts/run_dev_dbs.sh
# Description: kill/clear/run mongo with docker for dev environment
# Prerequirements: docker
#

echo -e "127.0.0.1 sapia-backend-code.local" | sudo tee -a /etc/hosts
sudo docker-compose -f ./config/swarm/docker-compose.yml up