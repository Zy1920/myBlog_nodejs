const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash  = require("connect-flash");
const config = require("config-lite")(__dirname);
const routes = require("./routes");
const pkg = require("./package");
const winston = require("winston");
const expressWinston = require("express-winston");

const app = express();

app.set("views","./views");
app.set("view engine","ejs");

app.use(express.static("./public"));

app.use(session({
    name:config.session.key,
    secret:config.session.secret,
    resave:true,
    saveUninitialized:false,
    cookie:{
        maxAge:config.session.maxAge
    },
    store:new MongoStore({
        url:config.mongodb
    })
}))

app.use(flash())

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir:"./public/img", // 上传文件目录
    keepExtensions: true// 保留后缀
}))

//设置模板全局变量
app.locals.blog={
    title:pkg.name,
    description:pkg.description
}

//添加模板必须的三个变量
app.use((req,res,next)=>{
    res.locals.user=req.session.user
    res.locals.success=req.flash("success").toString()
    res.locals.error=req.flash("error").toString()
    next();
})

/*app.use(expressWinston.logger({
    transports:[
        new (winston.transports.Console)({
            json:true,
            colorize:true
        }),
        new winston.transports.File({
            filename:"./logs/success.log"
        })
    ]
}))*/
routes(app)
/*
app.use(expressWinston.errorLogger({
    transports:[
        new winston.transports.Console({
            json:true,
            colorize:true
        }),
        new winston.transports.File({
            filename:"./logs/error.log"
        })
    ]
}))
*/

/*app.use(function (err, req, res, next) {
    console.error(err);
    req.flash("error", err.message);
    return res.redirect("/posts")
})*/


app.listen(config.port,()=>{
    console.log(`${pkg.name} listening on port ${config.port}`)
})


