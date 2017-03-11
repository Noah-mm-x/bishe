/**
 * Created by Administrator on 2017/1/7.
 */
$(function () {

    var storage = localStorage;


//    顶部图片切换
    var $switchFrame = $(".image-switch-frame"),
        $preImage = $(".pre-image ul li"),
        timer = null;
    $preImage.hover(function () {
        var _self = $(this), showImage;
        timer = setTimeout(function () {
            showImage = _self.find("img").attr("src");
            $switchFrame.fadeOut(function () {
                $(this).css({
                    "backgroundImage": "url(" + showImage + ")",
                }).fadeIn();
            })
        }, 200);
    }, function () {
        clearTimeout(timer);
    });

//    注册弹出框信息
    $('.join-us-title>a').on('click', function () {
        $('.alert-register').show();
    });
    $('.alert-register .register-box .close').on('click', function () {
        $('.alert-register').fadeOut();
        $registerAccount.val('');
        $registerPassword.val('');
        $registerConfirmPassword.val('');
        hideInfo();
    });

    var $registerInfo = $('.register-info');

    function showInfo(str) {
        $registerInfo.html(str).show();
    }

    function hideInfo() {
        $registerInfo.html("").hide();
    }

//    注册
    var $registerAccount = $('.register-account'),
        $registerPassword = $('.register-password'),
        $registerConfirmPassword = $('.register-confirm-password'),
        $registerBtn = $('.register-btn'),
        accountFlag = false, passwordFlag = false, confirmFlag = false;

    $registerAccount.blur(function () {
        var _self = $(this);
        if (_self.val() == '' || _self.val().length === 0 || _self.val() == undefined) {
            showInfo('用户名不能为空！');
            return false;
        }
        if (_self.val().length > 12) {
            showInfo('用户名长度不能超过12位');
            return false;
        }
        if (_self.val().length < 6) {
            showInfo('用户名不能少于6位');
            return false;
        }

        accountFlag = true;
        hideInfo();
    });

    $registerPassword.blur(function () {
        var _self = $(this), reg = /^[0-9a-zA-Z]+$/,
            flag1 = false, flag2 = false, flag3 = false;

        if (_self.val() == "" || _self.val() == undefined || _self.val() == null) {
            showInfo('密码不能为空');
            return false;
        } else {
            flag1 = true;
            hideInfo();
        }

        if (!reg.test(_self.val())) {
            showInfo('密码只能由数字和字母组成');
            return false;
        } else {
            flag2 = true;
            hideInfo();
        }

        if (_self.val().length < 8 || _self.val().length > 15) {
            showInfo('用户名长度为8到15位');
            return false;
        } else {
            flag3 = true;
            hideInfo();
        }

        if (flag1 && flag2 && flag3) passwordFlag = true;
    });

    $registerConfirmPassword.blur(function () {
        var _self = $(this), pwd = $registerPassword;
        if (_self.val() != pwd.val()) {
            showInfo('密码不一致');
            return false;
        } else {
            confirmFlag = true;
            hideInfo();
        }
    });

    $registerBtn.on("click", function () {
        // if (!accountFlag || !passwordFlag || !confirmFlag) return false;
        if (!accountFlag) {
            swal('用户名不符合要求！');
            return false;
        }
        if (!passwordFlag) {
            swal('密码不符合要求！');
            return false;
        }
        if (!confirmFlag) {
            swal('确认密码不符合要求！');
            return false;
        }

        $.post('/apis/user/register', {
            name: $registerAccount.val(),
            pwd: md5($registerPassword.val())
        }).done(function (data) {
            console.log(data);
            switch (data.state) {
                case 1:
                    swal({
                        title: '注册成功',
                        text: '欢迎加入晨梦网',
                        type: 'success',
                        confirmButtonColor: '#3171b8',
                        confirmButtonText: '确定'
                    }, function (isConfirm) {
                        if (isConfirm) $('.alert-register').hide();
                        $registerAccount.val('');
                        $registerPassword.val('');
                        $registerConfirmPassword.val('');
                    });
                    break;
                case 9:
                    swal({
                        title: '用户名已被占用',
                        text: '请换一个用户名重新注册',
                        type: 'warning',
                        confirmButtonColor: '#3171b8',
                        confirmButtonText: '确定'
                    }, function (isConfirm) {
                        $registerAccount.val("");
                        $registerPassword.val("");
                        $registerConfirmPassword.val("");
                    });
                    break;
                case 2:
                    swal('请输入用户名');
                    break;
                default:
                    swal({
                        title: '异常错误，请重新注册'
                    });
                    break;
            }
        }).fail(function (err) {
            console.log(err);
        })
    });

//登录
    var $account = $('#account'),
        $password = $('#password'),
        $signInBtn = $('.signIn-box .remember-and-login .remember > a'),
        $signInTemp = $('.signIn-temp'),
        $showUserInfo = $('.show-user-info'),
        $userName = $('.signIn-box .show-user-info .user-info >span');

    $signInBtn.click(function (e) {
        e.preventDefault();
        $.post('/apis/user/login', {
            name: $account.val(),
            pwd: md5($password.val())
        }).done(function (data) {
            console.log(data);
            switch (data.state) {
                case 1:
                    swal({
                        title: '登录成功',
                        type: 'success',
                        confirmButtonColor: '#3171b8',
                        confirmButtonText: '确定'
                    }, function (isConfirm) {
                        if (isConfirm) {
                            storage.setItem('name', $account.val());
                            storage.setItem('pwd', md5($password.val()));
                            $userName.html($account.val());
                            $signInTemp.hide();
                            $showUserInfo.show();
                        }
                    });
                    break;
                case 4:
                    swal('密码错误');
                    $password.val("");
                case 5:
                case 6:
                    swal('用户名错误');
                    $account.val("");
                    $password.val("");
                default:
                    swal('未知错误');
                    console.log(data.message);
                    break;
            }
        })
    })
//    退出登录
    var exit = $('.exit-login');
    exit.click(function (e) {
        e.preventDefault();
        $.post('/apis/user/exit').done(function (data) {
            if (data.state == 11 ){
                swal('退出成功');
                storage.setItem('name','');
                $signInTemp.show();
                $showUserInfo.hide();
            }else{
                swal('未知错误');
            }
        })
    });

//进入页面检测用户是否登录
    var $avatar = $('.signIn-box .show-user-info > .avatar');
    if (storage.getItem('name').length) {
        $userName.html(storage.getItem('name'));
        $avatar.html(getFirstWord(storage.getItem('name')));
        $signInTemp.hide();
        $showUserInfo.show();
    }

    //梦感觉  分页
    if ($('.feel').length){
        var feelBox = $('.feel-right .content'),
            maxPageNum = 16;//每页最大卡片个数
        // return false;
        $.getJSON('../data/feel.json', function (data) {
            console.log(data.articles.length);
            var item = data.articles, length = Math.ceil(data.articles.length/maxPageNum), pageIndex;
            //默认页面显示内容
            for (var i = 0; i < maxPageNum; i++) {
                feelBox.append(new feelCard(item[i].image,item[i].title,item[i].content,
                    item[i].avatarAvatar,item[i].avatarName,item[i].avatarDate));
            }
            $(".M-box").pagination({
                pageCount: length,
                jump: true,
                coping: true,
                homePage: '首页',
                endPage: '末页',
                preContent: '上页',
                nextContent: '下页',
                callback: function (index) {
                    pageIndex = index.getCurrent() - 1;
                    console.log(pageIndex);
                    feelBox.empty();
                    for (var i = 0; i < maxPageNum; i++) {
                        var j = maxPageNum * pageIndex + i;
                        if (item[j]) {
                            feelBox.append(new feelCard(item[j].image, item[j].title,
                                item[j].content, item[j].avatarAvatar, item[j].avatarName,
                                item[j].avatarDate));
                        }
                    }
                    backToTop();
                }
            })
        });
    }

    function feelCard(image, title, content, authorAvatar, authorName, authorDate) {
        var card = '<li>' +
                        '<img class="img" src="images/feel/'+image+'" alt="">' +
                        '<div class="title" title="'+title+'"><a class="ellipsis" href="javascript:;">'+title+'</a></div>' +
                        ' <div class="content">'+content+'</div>' +
                        '<div class="author">' +
                            '<img class="author-avatar left" src="images/avatar/feel/'+authorAvatar+'" alt="">' +
                                '<div class="author-info left">' +
                                    '<p class="name">作者：<span>'+authorName+'</span></p>' +
                                    '<p class="date">发布于：<span>'+authorDate+'</span></p>' +
                                '</div>' +
                        '</div>' +
                    ' </li>';
        return $(card);
    }
    // 返回顶部
    function backToTop() {
        $('body,html').animate({scrollTop:0},400);
    }
    //获取用户名字第一个字
    function getFirstWord(target) {
        return target.substring(0,1);
    }
});