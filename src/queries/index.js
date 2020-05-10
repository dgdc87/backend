// All the queries here (meassurement, right now is a special case)

user = {
    create:      'INSERT INTO user (username, firstname, lastname, email, id_role, pass, reg_date, update_date, last_login, jwt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    delete:      'DELETE FROM user WHERE id = ?',
    update:      'UPDATE user SET firstname = ?, lastname = ?, email = ?, update_date = ? WHERE id = ?',
    read:        'SELECT id, username, firstname, lastname, email, id_role, reg_date, update_date, last_login FROM user WHERE 1=1 ORDER BY id',
    getById:     'SELECT id, username, firstname, lastname, email, last_login, id_role FROM user WHERE id = ?',
    credentials: 'SELECT * FROM user WHERE username = ? AND pass = ?',
    login:       'UPDATE user SET jwt = ?, last_login = ? WHERE id = ?',
    logout:      'UPDATE user SET jwt = null WHERE id = ?',
}

role = {
    create:  'INSERT INTO roles (descr) VALUES (?)',
    delete:  'DELETE FROM roles WHERE id = ?',
    update:  'UPDATE roles SET descr = ? WHERE id = ?',
    read:    'SELECT * FROM roles WHERE 1',
    getById: 'SELECT * FROM roles WHERE id = ?',
    getByDescr: 'SELECT id FROM roles WHERE descr = ?'
}


jwt = {
    getUserJwt: 'SELECT * FROM user WHERE jwt = ?',
    getRoleJwt: 'SELECT roles.descr FROM user INNER JOIN roles ON user.id_role = roles.id and user.jwt = ?',
}


module.exports = {
    user,
    role,
    jwt
}
