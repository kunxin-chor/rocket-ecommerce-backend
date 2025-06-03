-- SEUTP THE DATABASE

-- Create organic database if it does not exists
CREATE DATABASE IF NOT EXISTS organic;

CREATE USER 'foo'@'%' IDENTIFIED WITH mysql_native_password BY 'bar';
grant all privileges on *.* to 'foo'@'%';
FLUSH PRIVILEGES;

