var express = require('express');
var session = require('express-session');
var router = express.Router();
var createConn = require("../sources/CreateConn");
var stateCode = require("../sources/StateCode");
const md5 = require("md5-js");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
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

router.post("/user/register", checkUserAndPassword)
    .post("/user/register", function (req, res, next) {
        let conn = createConn();
        conn.connect1().then(result => {
            return conn.query1("SELECT * FROM `login` WHERE `name`=?", [req.body.name])
        }).then(function (rows) {
            if (rows.length) {
                var result = rows[0];
                if (req.body.name == result.name) {
                    res.json({state: stateCode.USER_IS_EXISTED, message: "user is exised"});
                    conn.end();
                }
            }
        }).then(result => {
            return conn.query1("INSERT INTO `login` (`name`,`pwd`) VALUES(?,?)",
                [req.body.name, md5(req.body.pwd)]);
        }).then(result => {
            res.json({state: stateCode.ALLOW_LOGIN_OR_REGISTER, message: "OK"});
            conn.end();
        }).catch(error => {
            res.json({state: error.errno, message: error.code});
        })
    });
router.post("/user/login", checkUserAndPassword)
    .post("/user/login", function (req, res, next) {
        let conn = createConn();
        conn.connect1().then(result => {
            return conn.query1("SELECT * FROM `login` WHERE `name`=?", [req.body.name]);
        }).then(function (rows) {
            if (rows.length) {
                var result = rows[0];
                if (md5(req.body.pwd) == result.pwd) {
                    // req.session.currentUserName = result.name;
                    // req.session.currentUserPwd = result.pwd;
                    res.json({state: stateCode.ALLOW_LOGIN_OR_REGISTER, message: "OK"});
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


module.exports = router;
