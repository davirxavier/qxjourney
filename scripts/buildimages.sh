REPO_DIR=$1
REPO_LINK=$2

if [ -d "$REPO_DIR" ]; then
  (cd "$REPO_DIR" && git pull)
else
  git clone "$REPO_LINK" "$REPO_DIR"
fi

docker build -t qxjourney-client -f "$REPO_DIR/client/docker/Dockerfile" "$REPO_DIR/client"
docker build -t qxjourney-server "$REPO_DIR/server"

docker rmi "$(docker images --filter dangling=true -q)"