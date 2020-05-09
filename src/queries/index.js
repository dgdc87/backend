// All the queries here (meassurement, right now is a special case)

user = {
    create:      'INSERT INTO user (username, firstname, lastname, email, id_role, pass, reg_date, update_date, last_login, jwt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
    delete:      'DELETE FROM user WHERE id = $1',
    update:      'UPDATE user SET username = $1, firstname = $2, lastname = $3, email = $4, id_role = $5, update_date = $6 WHERE id = $7',
    read:        'SELECT * FROM user WHERE 1=1 ORDER BY id',
    getById:     'SELECT u.id, u.username, u.firstname, u.lastname, u.email, u.last_login, u.id_role, r.descr AS role FROM user u JOIN role r ON u.id_role = r.id WHERE u.id = $1',
    credentials: 'SELECT * FROM user WHERE username = $1 AND pass = $2',
    login:       'UPDATE user SET jwt = $1, last_login = $3 WHERE id = $2',
    logout:      'UPDATE user SET jwt = null WHERE id = $1',
}

role = {
    create:  'INSERT INTO roles (descr) VALUES ($1) RETURNING id',
    delete:  'DELETE FROM roles WHERE id = $1',
    update:  'UPDATE roles SET descr = $1 WHERE id = $2',
    read:    'SELECT * FROM roles WHERE 1',
    getById: 'SELECT * FROM roles WHERE id = ?'
}


util = {
    getUserJwt: 'SELECT * FROM user WHERE jwt = $1',
}


module.exports = {
    user,
    role,
    util
}
