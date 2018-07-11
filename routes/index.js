module.exports=function (app) {
    app.get("/",(req,res)=>{
        res.redirect("/posts")
    })

    app.use("/signup",require("./signup"));
    app.use("/signin",require("./signin"));
    app.use("/signout",require("./signout"));
    app.use("/posts",require(("./posts")));
    app.use("/comments",require("./comments"));
    app.use(function (req,res) {
        if(!res.headerSent){
            return res.status(404).render("404")
        }
    })
}