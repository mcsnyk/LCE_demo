# docker network list
docker network create ADDA_demo

# Gitlab:
docker run -d --name github-broker \
-p 8001:8001 \
-e BROKER_TOKEN=... \
-e GITHUB_TOKEN=... \
-e BROKER_CLIENT_URL=http://github-broker:8001 \
-e GIT_CLIENT_URL=http://github-code-agent:3000 \
-e ACCEPT=/home/node/private \
-v /Users/miklos/Documents/Snyk/storybooks_adda/broker/private/accept.json:/home/node/private \
-e PORT=8001 \
--network ADDA_demo \
snyk/broker:github-com

docker run -d --name github-code-agent \
-p 3000:3000 \
-e PORT=3000 -e SNYK_TOKEN=... --network ADDA_demo \
snyk/code-agent
