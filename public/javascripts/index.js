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
var gainNode = ac[ac.createGain ? "createGain" : "createGainNode"]();
gainNode.connect(ac.destination);
/**************************请求发送和请求处理函数*****************************/
function load(url) {
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    /*××××××××××××××××请求处理完成时××××××××××××××××××*/
    xhr.onload = function () {
        /*×××××解析数据×××××*/
        ac.decodeAudioData(xhr.response, function (buffer) {
            /*解析成功时对数据处理*/
            var bufferSource = ac.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(gainNode);
            //            bufferSource.connect(ac.destination);
            /*立即播放*/
            bufferSource[bufferSource.start ? "start" : "noteOn"](0);
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