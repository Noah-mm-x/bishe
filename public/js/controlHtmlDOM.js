/**
 * Created by Administrator on 2017/1/7.
 */
$(function () {

//    顶部图片切换
    var $switchFrame = $(".image-switch-frame"), $preImage = $(".pre-image ul li"), timer = null;
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
        if (_self.val().length > 12) {
            showInfo('用户名长度不能超过12位');
            return false;
        } else {
            accountFlag = true;
            hideInfo();
        }
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
                    break;
            }
        })
    })

});