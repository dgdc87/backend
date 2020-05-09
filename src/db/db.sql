CREATE DATABASE IF NOT EXISTS backapp character set UTF8 collate utf8_bin;

CREATE TABLE IF NOT EXISTS user (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    firstname VARCHAR(30) NOT NULL,
    lastname VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    id_role smallint,
    pass VARCHAR(200),
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    jwt VARCHAR(200)
);


CREATE TABLE IF NOT EXISTS roles (
    id INT(2) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    descr VARCHAR(40) UNIQUE
);

INSERT IGNORE INTO roles ( descr )
VALUES ('simple');

INSERT IGNORE INTO roles ( descr )
VALUES ('advanced');

INSERT IGNORE INTO roles ( descr )
VALUES ('expert');

