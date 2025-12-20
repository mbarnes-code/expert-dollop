#!/bin/sh
#
# SPDX-FileCopyrightText: Copyright (c) 1993-2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Script to initialize Pinecone index at container startup
echo "Initializing Pinecone index..."

# Wait for the Pinecone service to become available
echo "Waiting for Pinecone service to start..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  if curl -s --head http://pinecone:5080 > /dev/null; then
    echo "Pinecone service is up!"
    break
  fi
  echo "Waiting for Pinecone service (attempt $attempt/$max_attempts)..."
  attempt=$((attempt + 1))
  sleep 2
done

if [ $attempt -gt $max_attempts ]; then
  echo "Timed out waiting for Pinecone service"
  exit 1
fi

# Create the index directly
echo "Creating index 'entity-embeddings'..."
curl -v -X POST "http://pinecone:5080/create_index" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "entity-embeddings",
    "dimension": 384,
    "metric": "cosine"
  }'

# Also try alternate endpoint as fallback
echo "Trying alternate endpoint..."
curl -v -X POST "http://pinecone:5080/indexes" \
  -H "Content-Type: application/json" \
  -H "Api-Key: pclocal" \
  -d '{
    "name": "entity-embeddings",
    "dimension": 384,
    "metric": "cosine"
  }'

echo "Pinecone initialization complete" 