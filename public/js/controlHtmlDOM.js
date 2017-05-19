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
        if (_self.val().length < 3) {
            showInfo('用户名不能少于3位');
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
            showInfo('密码长度为8到15位');
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

        $.post('/page/user/register', {
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

                        // 注册成功存入 storage
                        storage.setItem('id', data.data.id);
                        storage.setItem('name', data.data.name);
                        storage.setItem('pwd', data.data.pwd);

                        // 注册成功 自动登录
                        $userName.html(storage.getItem('name'));
                        $avatar.html(getFirstWord(storage.getItem('name')));
                        $signInTemp.hide();
                        $showUserInfo.show();
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
        $.post('/page/user/login', {
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
                            storage.setItem('id', data.data.id);
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
                    break;
                case 5:
                    swal('没有此用户');
                    $password.val("");
                    break;
                case 6:
                    swal('用户名错误');
                    $account.val("");
                    $password.val("");
                    break;
                default:
                    swal('未知错误');
                    console.log(data.state);
                    console.log(data.message);
                    break;
            }
        })
    })
//    退出登录
    var exit = $('.exit-login');
    exit.click(function (e) {
        e.preventDefault();
        $.post('/page/user/exit').done(function (data) {
            if (data.state == 11 ){
                swal('退出成功');
                storage.setItem('id','');
                storage.setItem('name','');
                storage.setItem('pwd','');
                $account.html();
                $password.html();
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
        // $account.val(storage.getItem('name'));
        // $password.val(storage.getItem('pwd'));
    }

    //梦感觉  分页
    if ($('.feel').length){
        var feelBox = $('.feel-right .content'),
            maxPageNum = 16;        //每页最大卡片个数
        // return false;
        $.getJSON('../data/feel.json', function (data) {
            var item   = data.articles,
                length = Math.ceil(data.articles.length/maxPageNum),
                pageIndex;
            //默认页面显示内容
            for (var i = 0; i < maxPageNum; i++) {
                feelBox.append(new feelCard(item[i].image,item[i].title,item[i].content,
                    item[i].avatarAvatar,item[i].avatarName,item[i].avatarDate,item[i].link));
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
                    feelBox.empty();
                    for (var i = 0; i < maxPageNum; i++) {
                        var j = maxPageNum * pageIndex + i;
                        if (item[j]) {
                            feelBox.append(new feelCard(item[j].image, item[j].title,
                                item[j].content, item[j].avatarAvatar, item[j].avatarName,
                                item[j].avatarDate,item[j].link));
                        }
                    }
                    backToTop();
                }
            })
        });
    }

    // 梦感觉 文章详情页
    if ($('.feel-article').length){
        var linkSearch = window.location.search.replace('?',''),
            articleLength = 50,
            articleTitle = $('.feel-article-content .title'),
            articleImage = $('.feel-article-content .image'),
            articleContent = $('.feel-article-content .content'),
            articleAuthor = $('.feel-article-content .author span');

       $.post('/page/feel/articles',{
           link:parseInt(linkSearch)
       }).done(function (datas) {
           if (datas.state == 1000) {
               var data = datas.data[0];
               articleTitle.html(data.title);
               articleImage.attr('src','images/feel/'+data.image);
               articleContent.html(data.content);
               articleAuthor.html(data.author);
           }
       }).fail(function (err) {
           console.log(err);
       });
       $.post('/page/feel/showComments',{
           link:parseInt(linkSearch)
       }).done(function (datas) {
            if (datas.state == 1000) {
                var items = datas.data;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    comment = new createComment(item.name,item.content,item.date);
                    commentList.append(comment);
                }
            }
        }).fail(function (err) {
            console.log(err);
        });
        var commentList = $('.feel-article-comment .user-comment-list'),
            comment = '',
            dateStr = '',
            now = '',
            year = '',
            month = '',
            day = '';
        $('.submit-comment').on('click',function (e) {
            e.preventDefault();
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth()+1;
            day = now.getDate();
            dateStr = year+'-'+month+'-'+day;
            comment = $('.feel-article-comment .comment-box').val();
            if (comment == '' || comment == null || comment == undefined){
                swal('评论不能为空');
                return false;
            }
            $.post('/page/feel/inputComments',{
                id:storage.getItem('id'),
                aid:parseInt(linkSearch),
                content:comment,
                dateStr:dateStr
            }).done(function (datas) {
                console.log(datas.state);
                switch (datas.state){
                    case 12 :
                        swal('未登录');
                        break;
                    case 1000:
                        var commentContent = createComment(storage.getItem('name'),comment,dateStr);
                        commentList.append(commentContent);
                        break;
                    default:
                        swal('评论失败');
                        break;
                }
            }).fail(function (err) {
                console.log(err);
            });
        });
        $('.pre-feel-article').on('click',function (e) {
            e.preventDefault();
            if (linkSearch == 1) {
                $('.pre-feel-article').hide();
                return false;
            }

            window.location.href =
                window.location.href.replace(
                    window.location.search,'')+"?"+(parseInt(linkSearch)-1
                )
        });
        $('.next-feel-article').on('click',function (e) {
            e.preventDefault();
            if (linkSearch == articleLength) {
                $('.next-feel-article').hide();
                return false;
            }

            window.location.href =
                window.location.href.replace(
                    window.location.search,'')+"?"+(parseInt(linkSearch)+1
                )
        });
    }

    //梦探索
    if ($('.explore').length){
        var exploreBox = $('.explore .content-list'),
            maxPageNum = 8;        //每页最大卡片个数
        // return false;
        $.getJSON('../data/explore.json', function (data) {
            var item   = data.articles,
                length = Math.ceil(data.articles.length/maxPageNum),
                pageIndex;
            //默认页面显示内容
            for (var i = 0; i < maxPageNum; i++) {
                exploreBox.append(new exploreCard(item[i].image,item[i].title,item[i].content,
                    item[i].date,item[i].link));
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
                    exploreBox.empty();
                    for (var i = 0; i < maxPageNum; i++) {
                        var j = maxPageNum * pageIndex + i;
                        if (item[j]) {
                            exploreBox.append(new exploreCard(item[j].image,item[j].title,item[j].content,
                                item[j].date,item[j].link));
                        }
                    }
                    backToTop();
                }
            })
        });
    }

    // 梦感觉 文章详情页
    if ($('.explore-article').length){
        var linkSearch = window.location.search.replace('?',''),
            articleLength = 50,
            articleTitle = $('.explore-article .content-details > .title'),
            articleDate = $('.explore-article .content-details > .date'),
            articleContent = $('.explore-article .content-details > .content');

        $.post('/page/explore/articles',{
            link:parseInt(linkSearch)
        }).done(function (datas) {
            if (datas.state == 1000) {
                var data = datas.data[0];
                articleTitle.html(data.title);
                articleDate.html(data.date);
                articleContent.html(data.content);
            }
        }).fail(function (err) {
            console.log(err);
        });
        $('.pre-feel-article').on('click',function (e) {
            e.preventDefault();
            if (linkSearch == 1) {
                $('.pre-feel-article').hide();
                return false;
            }

            window.location.href =
                window.location.href.replace(
                    window.location.search,'')+"?"+(parseInt(linkSearch)-1
                )
        });
        $('.next-feel-article').on('click',function (e) {
            e.preventDefault();
            if (linkSearch == articleLength) {
                $('.next-feel-article').hide();
                return false;
            }

            window.location.href =
                window.location.href.replace(
                    window.location.search,'')+"?"+(parseInt(linkSearch)+1
                )
        });
    }

    //梦思想
    if ($('.idea').length) {
        //点击切换标签
        $('.btn-switch').on('click',function () {
           window.location.reload();
        });

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
                        $this.css('zIndex', 9999);

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
                            $this.css('zIndex', 0);

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
                        if (_self.hasClass('tag-nail-right')) {
                            $this.css('webkitTransformOrigin', '0 0');
                            $this.addClass('clockwise-rotate-animate');
                            $this.on('webkitAnimationEnd', function () {
                                $this.addClass('clockwise-down-animate');
                                $this.on('webkitAnimationEnd', function () {
                                    $this.hide();
                                })
                            })
                        }
                        if (_self.hasClass('tag-nail-left')) {
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
        var $box = [
                $('.label-box.label-box1'),
                $('.label-box.label-box2'),
                $('.label-box.label-box3'),
                $('.label-box.label-box4'),
                $('.label-box.label-box5'),
                $('.label-box.label-box6')
            ],
            randomNum,
            boxLen = $('.label-box-container .label-box').length,
            leftRandom = createRandom(90, 1000, boxLen, 100),
            topRandom = createRandom(140, 460, boxLen, 20),
            rotateRandom = createRandom(-15, 15, boxLen),
            backgroundColor = createRandom(0, 5, 6),
            backgroundColorSelect = ['#fcc', '#cfc', '#ccf', '#ffc', '#fcf', '#cff'];
        $.post('/page/idea/articles').done(function (datas) {
            if (datas.state == 1000) {
                var items = datas.data;
                randomNum = createRandom(0, items.length - 1, boxLen);
                for (var i = 0; i < boxLen; i++) {
                    $box[i].labelWall({
                        'left': leftRandom[i],
                        'top': topRandom[i],
                        'backgroundColor': backgroundColorSelect[backgroundColor[i]],
                        'rotateDeg': rotateRandom[i],
                        'content': items[randomNum[i]].content,
                        'name': items[randomNum[i]].author
                    })
                }
            } else {
                swal({
                    'title': '数据获取失败，请刷新重试!',
                    'type': 'warning'
                })
            }
        });
    }

    //后台管理
    if ($('.back-stage').length){
    //    切换选择
        $('.side li').on('click',function (e) {
            e.preventDefault();
            var _self = $(this);
            var son = _self.data('son');
            _self.addClass('active').siblings().removeClass('active');
            $('#'+son).show().siblings().hide();
        })

    //    梦感觉
        $('#feel-submit').on('click',function () {
           var title = $('#feel-title').val();
           var image = $('#feel-image').val();
           var content = $('#feel-content').val();
           var author = $('#feel-author').val();
           if (title==null || title==''||title==undefined){
               swal('标题不能为空');
               return false;
           }
            if (image==null || image==''||image==undefined){
                swal('图片不能为空');
                return false;
            }
            if (content==null || content==''||content==undefined){
                swal('内容不能为空');
                return false;
            }
            if (author==null || author==''||author==undefined){
                swal('作者不能为空');
                return false;
            }
            $.post('/page/backFeel',{
                title:title,
                image:image,
                content:content,
                author:author
            }).done(function (datas) {
                if (datas.state == 1000) {
                    swal('输入成功');
                }
            }).fail(function (err) {
                console.log(err);
            });
        });
    //    梦思想
        $('#idea-submit').on('click',function () {
            var content = $('#idea-content').val();
            var author = $('#idea-author').val();

            if (content==null || content==''||content==undefined){
                swal('内容不能为空');
                return false;
            }
            if (author==null || author==''||author==undefined){
                swal('作者不能为空');
                return false;
            }
            $.post('/page/backIdea',{
                content:content,
                author:author
            }).done(function (datas) {
                if (datas.state == 1000) {
                    swal('输入成功');
                }
            }).fail(function (err) {
                console.log(err);
            });
        });
    //    梦探索
        $('#explore-submit').on('click',function () {
            var now = new Date();
            var title = $('#explore-title').val();
            var date = now.getFullYear()+'-'+formateNum((now.getMonth()+1))+'-'+formateNum(now.getDay());
            var content = $('#explore-content').val();
            if (title==null || title==''||title==undefined){
                swal('标题不能为空');
                return false;
            }

            if (content==null || content==''||content==undefined){
                swal('内容不能为空');
                return false;
            }

            $.post('/page/backExplore',{
                title:title,
                date:date,
                content:content
            }).done(function (datas) {
                if (datas.state == 1000) {
                    swal('输入成功');
                }else {
                    console.log(datas.state);
                }
            }).fail(function (err) {
                console.log(err);
            });
        });
    }

    //返回顶部
    $('.backToTop').on('click',function (e) {
        e.preventDefault();
       backToTop();
    });

    function feelCard(image, title, content, authorAvatar, authorName, authorDate,link) {
        var card = '<li>' +
                        '<a target="_blank"  href=feel/article?'+link+'>'+
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
                        '</a>'+
                    ' </li>';
        return $(card);
    }

    function createComment(name,comment,date) {
        var _name=getFirstWord(name);
        var _html='<li class="clearfix">'+
                        '<div class="user-info">'+
                            '<div class="user-avatar">'+_name+'</div>'+
                                '<div class="user-name ellipsis">'+name+'</div>'+
                            '</div>'+
                            '<div class="user-comment">'+
                            '<p class="user-comment-detail">'+comment+'</p>'+
                            '<p class="user-comment-date">'+date+'</p>'+
                            '</div>'+
                        '</div>'+
                    '</li>';
        return $(_html);
    }

    function exploreCard(image,title,content,date,link) {
        var card = '<li class="clearfix">'+
                        '<a target="_blank" href=explore/article?'+link+ ' class="list-left">'+
                             '<img src=images/explore/'+image+' alt="">'+
                        '</a>'+
                        '<div class="list-right">'+
                            '<a target="_blank" href=explore/article?'+link+ '>'+title+'</a>'+
                            '<p class="summary">'+content+'</p>'+
                            '<p class="date">发表日期 '+date+'</p>'+
                        '</div>'+
                    '</li>';
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
    //产生不同随机数

    /**
     *
     * @param min 最小值
     * @param max 最大值
     * @param num 个数
     * @param span 跨度（相邻两个数字的间隔）
     * @returns {Array.<*>}
     */
    function createRandom(min, max,num,span) {
        var tempArr = [],
            resultArr= [],
            i = min,
            len = max + 1,
            span = span || 1,
            item,index,flag;
        for (i ; i < len; i = i+ span) {
            tempArr.push(i);
        }
        do{
            flag = true;
            index = Math.floor(Math.random() * tempArr.length);
            resultArr.push(tempArr[index]);
            tempArr.splice(index, 1);
            flag = ~~tempArr.length;
        }while (flag);
        return len > max ? resultArr.splice(len-max,num) : 0;
    }

//    格式化时间
    function formateNum(num) {
        return num >=10 ? num : '0'+num;
    }
});