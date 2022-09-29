VERSION ?= v0.1.0
REGISTRY ?= hayeona92

# Image URL to use all building/pushing image targets
editor ?= $(REGISTRY)/monaco-editor:$(VERSION)

# Build the docker image
.PHONY: docker-build
docker-build: docker-build-editor

.PHONY: docker-push
docker-push: docker-push-editor


docker-build-editor:
	docker build . -t ${editor}

docker-push-editor:
	docker push ${editor}
