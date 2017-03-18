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
        $userName = $('.signIn-box .show-user-info .user-info >span'),
        $avatar = $('.signIn-box .show-user-info > .avatar');

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
                            $avatar.html(getFirstWord($account.val()));
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

    if (storage.getItem('name').length) {
        $userName.html(storage.getItem('name'));
        $avatar.html(getFirstWord(storage.getItem('name')));
        $signInTemp.hide();
        $showUserInfo.show();
    }

    //梦感觉  分页
    if ($('.feel').length){
        var feelBox = $('.feel-right .content'),
            maxPageNum = 16;        //每页最大卡片个数
        // return false;
        $.getJSON('../data/feel.json', function (data) {
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

    //梦思想
    if ($('.idea').length){
        // 推荐标签背景色 #fcc #cfc #ccf #ffc #fcf #cff

        /*
         * 对象为标签
         * width                 : 宽度
         * height                : 高度
         * backgroundColor       ：背景颜色
         * left                  ：左部偏移
         * top                   ：顶部偏移
         * rotateDeg             ：旋转角度
         */
        $.fn.labelWall = function (options) {
            var $this = $(this);
            var settings = $.extend({
                'width': '250',
                'height': '250',
                'backgroundColor': '#fcc',
                'left': '0',
                'top': '0',
                'rotateDeg': '0',
                'title': '',
                'content': '',
                'name': ''
            }, options);

            var init = function () {
                $this.css({
                    'width': settings.width + 'px',
                    'height': settings.height + 'px',
                    'backgroundColor': settings.backgroundColor,
                    'left': settings.left + 'px',
                    'top': settings.top + 'px',
                    '-webkit-transform': 'rotate(' + settings.rotateDeg + 'deg)'
                });

                var tagNailLeft = '<div class="tag-nail tag-nail-left"></div>',
                    tagNailRight = '<div class="tag-nail tag-nail-right"></div>',
                    title = '<div class="label-title">' + settings.title + '</div>',
                    content = '<div class="label-content">' + settings.content + '</div>',
                    name = '<div class="label-name">—— ' + settings.name + '</div>';
                $this.prepend(tagNailLeft).prepend(tagNailRight)
                    .append(title).append(content).append(name);
            };
            var events = {
                drag: function () {
                    var offsetX, offsetY,
                        mouseX = $this.position().left,
                        mouseY = $this.position().top;

                    $this.on('mousedown', function (e) {
                        $this.css('zIndex',9999);

                        offsetX = mouseX - e.pageX;
                        offsetY = mouseY - e.pageY;

                        document.onmousemove = function (e) {
                            mouseX = e.pageX + offsetX;
                            mouseY = e.pageY + offsetY;

                            $this.css({
                                'left': mouseX + 'px',
                                'top': mouseY + 'px'
                            })
                        };

                        document.onmouseup = function () {
                            $this.css('zIndex',0);

                            document.onmousemove = null;
                            document.onmouseup = null;
                        }
                    });
                },
                larger: function () {
                    var timer = null,
                        matrix = $this.css('-webkit-transform'); //获取下元素的transform的初始状态
                    $this.hover(function () {
                        timer = setTimeout(function () {
                            $this.css({
                                '-webkit-transition': 'all 800ms ease-in-out',
                                '-webkit-transform': 'scale(1.2)'
                            });
                        }, 0);
                    }, function () {
                        clearTimeout(timer);
                        $this.css({
                            '-webkit-transform': matrix
                        });
                    })
                },
                delete: function () {
                    $this.find('.tag-nail').on('click', function () {
                        var _self = $(this);
                        if(_self.hasClass('tag-nail-right')){
                            $this.css('webkitTransformOrigin', '0 0');
                            $this.addClass('clockwise-rotate-animate');
                            $this.on('webkitAnimationEnd', function () {
                                $this.addClass('clockwise-down-animate');
                                $this.on('webkitAnimationEnd', function () {
                                    $this.hide();
                                })
                            })
                        }
                        if(_self.hasClass('tag-nail-left')){
                            $this.css('webkitTransformOrigin', $this.width() + 'px 0');
                            $this.addClass('anticlockwise-rotate-animate');
                            $this.on('webkitAnimationEnd', function () {
                                $this.addClass('anticlockwise-down-animate');
                                $this.on('webkitAnimationEnd', function () {
                                    $this.hide();
                                })
                            })
                        }
                    })
                }
            };
            init();
            events.drag();
            events.delete();
            // events.larger();
            return this;
        };
        var $box1 = $('.label-box.label-box1'),
            $box2 = $('.label-box.label-box2'),
            $box3 = $('.label-box.label-box3'),
            $box4 = $('.label-box.label-box4'),
            $box5 = $('.label-box.label-box5'),
            $box6 = $('.label-box.label-box6');
        $box1.labelWall({
            'left': '100',
            'top': '100',
            'backgroundColor': '#ffc',
            'rotateDeg': '5',
            'title': '',
            'content': '平凡的脚步也可以走完伟大的行程。',
            'name': '稔'
        });
        $box2.labelWall({
            'left': '600',
            'top': '300',
            'backgroundColor': '#cfc',
            'rotateDeg': '3',
            'title': '',
            'content': '无论才能知识多么卓著，如果缺乏热情，则无异纸上画饼充饥，无补于事。',
            'name': 'Honey.'
        });
        $box3.labelWall({
            'left': '200',
            'top': '400',
            'backgroundColor': '#cff',
            'rotateDeg': '-3',
            'title':'',
            'content':'痛苦是性格的催化剂，它使强者更强，弱者更弱，仁者更仁，暴者更暴，智者更智，愚者更愚。',
            'name':'静夜明'
        });
        $box4.labelWall({
            'left': '800',
            'top': '400',
            'backgroundColor': '#fcf',
            'rotateDeg': '-2',
            'title':'',
            'content':'只有一条路不能选择——那就是放弃的路;只有一条路不能拒绝——那就是成长的路。',
            'name':'Eva&'
        });
        $box5.labelWall({
            'left': '400',
            'top': '100',
            'backgroundColor': '#ccf',
            'rotateDeg': '19',
            'title':'',
            'content':'成功是优点的发挥，失败是缺点的累积。走对了路的原因只有一种，走错了路的原因却有很多。',
            'name':'禅宿'
        });
        $box6.labelWall({
            'left': '900',
            'top': '200',
            'backgroundColor': '#fcc',
            'rotateDeg': '12',
            'title':'',
            'content':'桂冠上的飘带，不是用天才纤维捻制而成的，而是用痛苦，磨难的丝缕纺织出来的。',
            'name':'青青子衿'
        });
    }

    function feelCard(image, title, content, authorAvatar, authorName, authorDate) {
        var card = '<li>' +
                        '<a  href="javascript:;" >'+
                            '<div class="card-img-box">' +
                                '<img class="img" src="images/feel/'+image+'" alt="">' +
                            '</div>'+
                            '<div class="title" title="'+title+'"><p class="ellipsis">'+title+'</p></div>' +
                            ' <div class="content">'+content+'</div>' +
                            '<div class="author">' +
                                    '<img class="author-avatar left" src="images/avatar/feel/'+authorAvatar+'" alt="">' +
                                    '<div class="author-info left">' +
                                        '<p class="name">作者：<span>'+authorName+'</span></p>' +
                                        '<p class="date">发布于：<span>'+authorDate+'</span></p>' +
                                    '</div>' +
                            '</div>' +
                        '</a>'
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