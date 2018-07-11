const fs = require("fs");
const path = require("path");
const sha1 = require("sha1");
const express = require("express");
const router = express.Router();

const UserModel = require("../models/users");
const checkNotLogin = require("../middlewares/check").checkNotLogin;

router.get("/",checkNotLogin,(req,res,next)=>{
    res.render("signup")
})

router.post("/",checkNotLogin,(req,res,next)=>{
    const name = req.fields.name;
    const gender = req.fields.gender;
    const bio = req.fields.bio;
    const avatar = req.files.avatar.path.split(path.sep).pop()
    let password = req.fields.password;
    const repassword = req.fields.repassword;

    //校验参数
    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error("名字请限制在1-10个字符")
        }

        if (["m", "f", "x"].indexOf(gender) === -1) {
            throw new Error("性别只能是m、f或者x")
        }

        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error("个人简介请限制在1-30字")
        }

        if (!req.files.avatar.name) {
            throw new Error("缺少头像")
        }

        if (password.length < 6) {
            throw new Error("密码至少6位数")
        }

        if (password !== repassword) {
            throw new Error("两次密码输入不一致")
        }
    } catch (e) {
        //注册失败,异步删除上传的头像
        fs.unlink(req.files.avatar.path)
        req.flash("error",e.message)
        return res.redirect("/signup")
    }

    //加密密码
    password=sha1(password)

    //待写入数据库的数据
    let user={
        name:name,
        password:password,
        gender:gender,
        bio:bio,
        avatar:avatar
    }

    UserModel.create(user)
        .then(function (result) {
            user=result.ops[0];
            delete user.password;
            req.session.user=user;
            req.flash("success","注册成功")
            res.redirect("/posts");
    })
        .catch(function (e) {
            fs.unlink(req.files.avatar.path)
            if (e.message.match("duplicate key")){
                req.flash("error","用户名已经被占用了")
                return res.redirect("/signup");
            }
            next(e)
        })
})

module.exports=router