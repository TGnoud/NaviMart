-- Kịch bản khởi tạo cơ sở dữ liệu (Physical Database Schema) cho NaviMart
-- Đồng bộ theo tài liệu thiết kế backend

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    role VARCHAR(20) NOT NULL,
    group_id INT,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE family_groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    owner_id INT NOT NULL,
    invite_code VARCHAR(50) UNIQUE
);

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE food_catalog (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    unit VARCHAR(20) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE shopping_lists (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20),
    FOREIGN KEY (group_id) REFERENCES family_groups(group_id)
);

CREATE TABLE shopping_list_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (list_id) REFERENCES shopping_lists(list_id),
    FOREIGN KEY (food_id) REFERENCES food_catalog(food_id)
);

CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    expiry_date DATE NOT NULL,
    location VARCHAR(50) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES family_groups(group_id),
    FOREIGN KEY (food_id) REFERENCES food_catalog(food_id)
);

CREATE TABLE recipes (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    instructions TEXT NOT NULL,
    image_url VARCHAR(255),
    author_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (author_id) REFERENCES users(user_id)
);

CREATE TABLE recipe_ingredients (
    recipe_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity_required DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (recipe_id, food_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
    FOREIGN KEY (food_id) REFERENCES food_catalog(food_id)
);

CREATE TABLE meal_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    recipe_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (group_id) REFERENCES family_groups(group_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
);

ALTER TABLE users ADD FOREIGN KEY (group_id) REFERENCES family_groups(group_id);
ALTER TABLE family_groups ADD FOREIGN KEY (owner_id) REFERENCES users(user_id);
