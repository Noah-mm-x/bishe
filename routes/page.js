var express = require('express');
var app = express();
var session = require('express-session');
var router = express.Router();
var createConn = require("../sources/CreateConn");
var stateCode = require("../sources/StateCode");
var sessionData;
const md5 = require("md5-js");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});
router.get('/page', function(req, res) {
    res.sendfile( './public/css');
});
router.get('/index', function(req, res) {
    res.sendfile( './public/index.html');
});
router.get('/feel', function(req, res) {
    res.sendfile( './public/feel.html');
});
router.get('/feel/article', function(req, res) {
    res.sendfile( './public/feelArticle.html');
});
router.get('/idea', function(req, res) {
    res.sendfile( './public/idea.html');
});


//判断是否有用户名和密码
function checkUserAndPassword(req, res, next) {
    if (!req.body.name) {
        res.json({state: stateCode.NO_USER_NAME, message: "no user name"});
        return false;
    }
    if (!req.body.pwd) {
        res.json({state: stateCode.NO_PASSWORD, message: "no password"});
        return false;
    }
    next();
}

// 判断用户是否登录
// function checkUserIsLogin(req, res, next) {
//     var sessionDataId = req.body.id;
//     if (sessionDataId == '' || sessionDataId == null || sessionDataId == undefined){
//         res.json({state:stateCode.NO_LOGIN, message: "user not login"});
//     }
//     next();
// }

//注册接口
router.post("/user/register", checkUserAndPassword)
    .post("/user/register", function (req, res, next) {
        let conn = createConn();
        conn.connect1().then(result => {
            return conn.query1("SELECT * FROM `user` WHERE `name`=?", [req.body.name])
        }).then(function (rows) {
            if (rows.length) {
                var result = rows[0];
                if (req.body.name == result.name) {
                    res.json({state: stateCode.USER_IS_EXISTED, message: "user is exised"});
                    conn.end();
                }
            }
        }).then(result => {
            return conn.query1("INSERT INTO `user` (`name`,`pwd`) VALUES(?,?)",
                [req.body.name, md5(req.body.pwd)]);
        }).then(result => {
            return conn.query1("SELECT * FROM `user` WHERE `name`=?",
                [req.body.name]);
        }).then(rows=> {
            if (rows.length) {
                var result = rows[0];
                res.json({data:result,state: stateCode.ALLOW_LOGIN_OR_REGISTER, message: "OK"});
            }
            conn.end();
        }).catch(error => {
            res.json({state: error.errno, message: error.code});
        })
    });

// 登录接口
router.post("/user/login", checkUserAndPassword)
    .post("/user/login", function (req, res, next) {
        let conn = createConn();
        conn.connect1().then(result => {
            return conn.query1("SELECT * FROM `user` WHERE `name`=?", [req.body.name]);
        }).then(function (rows) {
            if (rows.length) {
                var result = rows[0];
                if (md5(req.body.pwd) == result.pwd) {
                    // req.session.currentUserId = result.id;
                    // req.session.currentUserName = result.name;
                    // req.session.currentUserPwd = result.pwd;
                    // sessionData = req.session;
                    res.json({data:result,state: stateCode.ALLOW_LOGIN_OR_REGISTER, message: "OK"});
                } else {
                    res.json({state: stateCode.PASSWORD_WRONG, message: "password wrong"});
                }
            } else {
                res.json({state: stateCode.NO_SUCH_USER, message: "no such user"});
            }
            conn.end();
        }).catch(function (error) {
            res.json({state: error.errno, message: error.code});
        })
    });

// 退出登录接口
router.post('/user/exit',function (req, res, next) {
    let conn = createConn();
    conn.connect1().then(result=>{
        // req.session.currentUserId = null;
        // req.session.currentUserName = null;
        // req.session.currentUserPwd = null;
        // sessionData = req.session;
    }).then(result => {
        res.json({state: stateCode.EXIT_LOGIN_SUCCESS, message: "OK"});
        conn.end();
    }).catch(error => {
        res.json({state: error.errno, message: error.code});
    })
});

// 梦感觉 便签接口
router.post('/idea/articles',function (req, res, next) {
   let conn = createConn();
   conn.connect1().then(result=>{
       return conn.query1("SELECT * FROM `idea_article`");
   }).then(function (rows) {
       if (rows.length){
           var result = rows;
           res.json({data: result,state:stateCode.OK, message: "ok"});
           conn.end();
       }
   }).catch(function (error) {
       res.json({state: error.errno, message: error.code});
   })
});

// 梦感觉 文章详情接口
router.post('/feel/articles',function (req, res, next) {
    let conn = createConn();
    conn.connect1().then(result=>{
        return conn.query1("SELECT * FROM `feel_article` WHERE `id` = ?" ,[req.body.link]);
    }).then(function (rows) {
        if (rows.length){
            var result = rows;
            res.json({data: result,state:stateCode.OK, message: "ok"});
            conn.end();
        }
    }).catch(function (error) {
        res.json({state: error.errno, message: error.code});
    })
});

// 梦感觉 输入评论接口
router.post('/feel/inputComments',function (req, res, next) {
   let conn = createConn();
   conn.connect1()
       .then(result=>{
           if (req.body.id) sessionData = req.body.id;
           if (sessionData == '' || sessionData == null || sessionData == undefined){
               res.json({state:stateCode.NO_LOGIN, message: "user not login"});
           }
       }).then(result=>{
           return conn.query1("INSERT INTO `feel_comment` (`aid`,`uid`,`content`,`date`)" +
               " VALUES(?,?,?,?)",
               [req.body.aid,sessionData,req.body.content, req.body.dateStr]);
       }).then(result=>{
           res.json({state:stateCode.OK, message: "ok"});
           conn.end();
        }).catch(function (error) {
       res.json({state: error.errno, message: error.code});
   })
});

// 梦感觉 显示评论接口
router.post('/feel/showComments',function (req, res, next) {
    let conn = createConn();
    conn.connect1().then(result=>{
        return conn.query1("SELECT name,content,date FROM user AS u LEFT JOIN " +
            "feel_comment AS c ON u.id = c.uid WHERE c.aid = ?",[req.body.link]);
    }).then(function (rows) {
        if (rows.length){
            var result = rows;
            res.json({data: result,state:stateCode.OK, message: "ok"});
            conn.end();
        }
    }).catch(function (error) {
        res.json({state: error.errno, message: error.code});
    })
});

module.exports = router;
