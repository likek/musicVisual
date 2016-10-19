/**********************工具函数***************************/
function $(ele) {
    return document.querySelectorAll(ele);
}
var lis = $('#list li'); //音乐列表
lis[0].className = 'selected'; //默认第一首歌被选中
/*×××××××××××××××××××××歌曲的点击事件××××××××××××××××××××××××*/
for (var i = 0; i < lis.length; i++) {
    lis[i].onclick = function () {
        for (var j = 0; j < lis.length; j++) {
            lis[j].className = '';
        }
        this.className = 'selected';　 //被点音乐添加样式
        load('/media/' + this.title); //发送资源请求
    }
}
var xhr = new XMLHttpRequest(); //创建xhr对象
var ac = new(window.AudioContext || window.webkitAudioContext)(); //创建AudioContext
var gainNode = ac[ac.createGain ? "createGain" : "createGainNode"](); //创建gainNode对象(主要用来操作音量)
gainNode.connect(ac.destination);
var source = null; //存放钱一次播放的资源(解决快速点击时的bug)
var count = 0; //存放当切换音乐的次数(解决快速点击时的bug)
/**************************请求发送和请求处理函数*****************************/
function load(url) {
    source && source[source.stop ? 'stop' : 'noteOff'](); //前一次先停止
    var n = ++count; //count是全局变量，因此每次点击都会正常的增加，n为局部变量，每次会深复制一份，有多个n
    xhr.abort(); //终止前一次xhr请求(万一钱一次请求还未完成时又发生一次点击)
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    /*××××××××××××××××请求处理完成时××××××××××××××××××*/
    xhr.onload = function () {
        if (n != count) return; //如果当前load函数内的n和全局的conut不等就return,即只播放最后一次点击的音乐
        /*×××××解析数据×××××*/
        ac.decodeAudioData(xhr.response, function (buffer) {
            if (n != count) return; //如果不是最后一次点击
            /*解析成功时对数据处理*/
            var bufferSource = ac.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(gainNode); //无需再connect到destination
            //            bufferSource.connect(ac.destination);
            /*立即播放*/
            bufferSource[bufferSource.start ? "start" : "noteOn"](0);
            source = bufferSource;
        }, function (err) {
            /*错误处理*/
            console.log(err);
        })
    }
    xhr.send();
}
/*********改变音量***××××通过改变gainNode.gain.value××××****/
function changeVolume(percent) {
    gainNode.gain.value = percent * percent;
}
/*音量按钮change事件*/
$('#volume')[0].onchange = function () {
    changeVolume(this.value / this.max);
}
$('#volume')[0].onchange; //让默认的音量大小立即生效