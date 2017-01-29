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
                    "backgroundImage": "url("+showImage+")",
                }).fadeIn();
            })
        }, 200);
    }, function () {
        clearTimeout(timer);
    });

// 小集体动态化

});