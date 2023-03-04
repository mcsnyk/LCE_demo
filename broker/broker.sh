# docker network list
docker network create ADDA_demo

# Gitlab:
docker run -d --name github-broker \
-p 8001:8001 \
-e BROKER_TOKEN=1053ed9d-0503-46b2-be61-9abf36cbed6c \
-e GITHUB_TOKEN=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 \
-e GITHUB=github.com \
-e BROKER_CLIENT_URL=http://github-broker:8001 \
-e GIT_CLIENT_URL=http://github-code-agent:3000 \
-e ACCEPT=/home/node/private \
-v /Users/miklos/Documents/Snyk/storybooks_adda/broker/private/accept.json:/home/node/private \
-e PORT=8001 \
--network ADDA_demo \
snyk/broker:github-com

docker run -d --name github-code-agent \
-p 3000:3000 \
-e PORT=3000 -e SNYK_TOKEN=aeeabf85-e8d9-4c0f-b7ba-ef1a1ef7c0e7 --network ADDA_demo \
snyk/code-agent
