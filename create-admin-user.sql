-- Create Admin User: Adam Townerli
-- Email: at253@gmail.com
-- Password: ()w!7Lv3+h()

INSERT INTO users (id, email, password_hash, full_name, linkedin_url, role, created_at)
VALUES (
    gen_random_uuid(),
    'at253@gmail.com',
    '$2b$10$zTDL6pIa.z1e.7RPXEFiXewAm.kP6qigeOfnNB2T08ds3Q1mobg.u',
    'Adam Townerli',
    'https://www.linkedin.com/in/adam-towner-33332a29a/',
    'ADMIN',
    NOW()
);
