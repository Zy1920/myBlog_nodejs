const db = require("../lib/mongo");
const User = db.User;

module.exports={
    create:function create(user) {
        return User.create(user).exec()
    },
    getUserByName:function  getUserByName(name){
        return User.findOne({name:name}).addCreatedAt().exec()
    }
}
