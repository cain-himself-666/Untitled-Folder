var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

// create a sequelize instance with our local postgres database information.
var sequelize = new Sequelize('postgres://postgres:Darkhorse@1@localhost:5432/scs');

// setup Admin model and its fields.
var Admin = sequelize.define('admins', {
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    usertype: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false
    },
    activated: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    hooks: {
      beforeCreate: (admin) => {
        const salt = bcrypt.genSaltSync();
        admin.password = bcrypt.hashSync(admin.password, salt);
      }
    }
});

Admin.prototype.validPassword = function (password) {
return bcrypt.compareSync(password, this.password);
};

// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = Admin;
