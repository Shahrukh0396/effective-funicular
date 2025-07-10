#!/bin/bash

# Linton Portals - Push to Docker Hub Script
# This script tags and pushes all Docker images to Docker Hub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Docker Hub configuration
DOCKER_USERNAME="shahrukh0396"
TAG="staging"

# Images to push
IMAGES=(
    "linton-backend:staging"
    "linton-client-portal:staging"
    "linton-employee-portal:staging"
    "linton-admin-panel:staging"
)

# Function to tag and push an image
push_image() {
    local image_name=$1
    local local_tag=$2
    local dockerhub_tag="${DOCKER_USERNAME}/${image_name}:${TAG}"
    
    print_status "Tagging ${image_name}..."
    docker tag "${image_name}:${local_tag}" "${dockerhub_tag}"
    
    print_status "Pushing ${dockerhub_tag} to Docker Hub..."
    docker push "${dockerhub_tag}"
    
    print_success "Successfully pushed ${dockerhub_tag}"
}

# Main function
main() {
    print_status "Starting Docker Hub push process..."
    print_status "Docker Hub Username: ${DOCKER_USERNAME}"

    print_status "Tag: ${TAG}"
    echo ""
    
    # Check if Docker is logged in
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running or you're not logged in"
        print_status "Please run: docker login"
        exit 1
    fi
    
    # Push each image
    for image in "${IMAGES[@]}"; do
        local_name=$(echo $image | cut -d':' -f1)
        local_tag=$(echo $image | cut -d':' -f2)
        
        print_status "Processing ${local_name}..."
        push_image "${local_name}" "${local_tag}"
        echo ""
    done
    
    print_success "All images pushed successfully!"
    echo ""
    print_status "Docker Hub Images:"
    echo "  ${DOCKER_USERNAME}/linton-backend:${TAG}"
    echo "  ${DOCKER_USERNAME}/linton-client-portal:${TAG}"
    echo "  ${DOCKER_USERNAME}/linton-employee-portal:${TAG}"
    echo "  ${DOCKER_USERNAME}/linton-admin-panel:${TAG}"
    echo ""
    print_success "Push to Docker Hub completed!"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --tag TAG       Use custom tag (default: staging)"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Push with 'staging' tag"
    echo "  $0 --tag latest       # Push with 'latest' tag"
    echo "  $0 --tag v1.0.0       # Push with 'v1.0.0' tag"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --tag)
            TAG="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Run main function
main 