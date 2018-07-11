const express = require("express");
const router = express.Router();

const checkLogin = require("../middlewares/check").checkLogin;
const CommentsModel = require("../models/comments");

router.post("/",checkLogin,(req,res,next)=>{
    const author = req.session.user._id;
    const postId = req.fields.postId;
    const content = req.fields.content;

    //校验参数
    try {
        if (content.length === 0) {
            throw new Error("请填写留言内容")
        }
    } catch (e) {
        req.flash("err",e.message)
        return res.redirect("back")
    }

    const comment={
        author:author,
        postId:postId,
        content:content
    }

    CommentsModel.create(comment)
        .then(function () {
            req.flash("success","留言成功")
            //留言成功后跳转到上一页
            res.redirect("back")
        })
        .catch(next)
})

router.get("/:commentId/remove",checkLogin,(req,res,next)=>{
    const commentId = req.params.commentId;
    const author = req.session.user._id;
    CommentsModel.getCommentById(commentId)
        .then(function (comment) {
            if (!comment){
                throw new Error("留言不存在")
            }
            if (comment.author.toString()!==author.toString()){
                throw new Error("没有权限删除留言")
            }
            CommentsModel.delCommentById(commentId)
                .then(function () {
                    req.flash("success","删除留言成功")
                    //留言删除成功后跳转到上一页
                    res.redirect("back")
                })
                .catch(next)
        })
})

module.exports=router