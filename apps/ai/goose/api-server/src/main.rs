use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tracing::info;

mod handlers;
mod types;

use handlers::*;
use types::*;

#[derive(Clone)]
struct AppState {
    // In a full implementation, this would hold a Goose agent instance
    // For now, it's a placeholder
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "goose_api_server=debug,tower_http=debug".into()),
        )
        .init();

    // Load environment configuration
    dotenvy::dotenv().ok();

    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let addr = format!("{}:{}", host, port);

    info!("Starting Goose API Server on {}", addr);

    // Initialize state
    let state = Arc::new(AppState {});

    // Build router
    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/api/conversation", post(conversation_handler))
        .route("/api/recipe", post(recipe_handler))
        .route("/api/skill", post(skill_handler))
        .route("/api/context/:session_id", get(context_handler))
        .with_state(state)
        .layer(
            tower_http::cors::CorsLayer::permissive()
        )
        .layer(
            tower_http::trace::TraceLayer::new_for_http()
        );

    // Start server
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    info!("Server listening on {}", addr);
    
    axum::serve(listener, app).await?;

    Ok(())
}
