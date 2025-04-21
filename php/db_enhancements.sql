-- Database Enhancement Script for food-price-app
-- Date: April 21, 2025

-- 1. Create normalized tables structure
-- Create states table
CREATE TABLE IF NOT EXISTS states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cities table with foreign key to states
CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
    UNIQUE KEY unique_city_state (name, state_id)
);

-- Create new normalized egg_rates_normalized table
CREATE TABLE IF NOT EXISTS egg_rates_normalized (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    date DATE NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_city_date (city_id, date)
);

-- 2. Add indexes to improve query performance
CREATE INDEX idx_egg_rates_date ON egg_rates (date);
CREATE INDEX idx_egg_rates_state ON egg_rates (state);
CREATE INDEX idx_egg_rates_city ON egg_rates (city);
CREATE INDEX idx_egg_rates_normalized_date ON egg_rates_normalized (date);

-- 3. Create archival table for historical data
CREATE TABLE IF NOT EXISTS egg_rates_archive (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Populate the normalized tables with existing data

-- Insert states from existing data
INSERT IGNORE INTO states (name)
SELECT DISTINCT state FROM egg_rates;

-- Insert cities from existing data
INSERT IGNORE INTO cities (name, state_id)
SELECT DISTINCT e.city, s.id 
FROM egg_rates e
JOIN states s ON e.state = s.name;

-- Insert rates into the normalized table
INSERT IGNORE INTO egg_rates_normalized (city_id, date, rate)
SELECT c.id, e.date, e.rate
FROM egg_rates e
JOIN cities c ON e.city = c.name
JOIN states s ON e.state = s.name AND c.state_id = s.id;