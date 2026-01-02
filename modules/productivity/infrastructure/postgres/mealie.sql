-- PostgreSQL Schema: mealie
-- Description: Mealie recipe management schema

CREATE SCHEMA IF NOT EXISTS mealie;

SET search_path TO mealie;

CREATE TABLE IF NOT EXISTS mealie.recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients JSONB,
    instructions JSONB,
    prep_time INTEGER,
    cook_time INTEGER,
    servings INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mealie.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS mealie.recipe_categories (
    recipe_id INTEGER REFERENCES mealie.recipes(id),
    category_id INTEGER REFERENCES mealie.categories(id),
    PRIMARY KEY (recipe_id, category_id)
);

CREATE TABLE IF NOT EXISTS mealie.meal_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    meals JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipes_name ON mealie.recipes(name);
