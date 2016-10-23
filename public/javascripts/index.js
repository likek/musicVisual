/**********************工具函数***************************/
function $(ele) {
    return document.querySelectorAll(ele);
}

function $random(start, end) {
    return Math.round(Math.random() * (end - start) + start);
}
/****************************web Audio类的封装*************************************/
function MusicBox(size, draw) {
    this.ac = new(window.AudioContext || window.webkitAudioContext)(); //创建AudioContext
    this.gainNode = this.ac[this.ac.createGain ? "createGain" : "createGainNode"](); //创建gainNode对象(主要用来操作音量)
    this.gainNode.connect(this.ac.destination);
    /*****************************************/
    this.analyser = this.ac.createAnalyser();
    this.analyser.fftSize = size * 2;
    this.analyser.connect(this.gainNode);
    this.itemSize = size;
    this.draw = draw;
    this.visualizer(); //立即开启动画
    this.soure = null;
}
MusicBox.prototype = {
        /**************************可视化函数***************************/
        visualizer: function () {
            var arr = new Uint8Array(this.analyser.frequencyBinCount); //需要用到的结果数组
            var analyser = this.analyser;
            var draw = this.draw;
            /*********H5动画函数对象**************/
            var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
            /*动画函数*/
            function v() {
                analyser.getByteFrequencyData(arr); //将本次的数据写入数组
                //console.log(arr);
                draw(arr); //绘制一次
                requestAnimationFrame(v);
            }
            requestAnimationFrame(v); //动画开始
        }
        , start: function (buffer) {
            console.log(this);
            /*解析成功时对数据处理*/
            this.bufferSource = this.ac.createBufferSource();
            this.volume = this.gainNode.gain.value;
            this.soure && this.soure[this.soure.stop ? 'stop' : 'noteOff'](); //前一次先停止
            this.bufferSource.buffer = buffer;
            this.bufferSource.connect(this.analyser); //无需再connect到destination
            this.bufferSource[this.bufferSource.start ? "start" : "noteOn"](0);
            this.soure = this.bufferSource;
        }
        , stop: function () {
            return this.bufferSource[this.bufferSource.stop ? 'stop' : 'noteOff']();
        }
        , decodeData: function (data, callback, err) {
            return this.ac.decodeAudioData(data, callback, err);
        }
    }
    /***********************************************************************************************/
;
/*
webAudio类用法：
var music = new MusicBox(64, draw);
其中draw函数必须包含一个参数arr，arr中存放了所有需要的音频数据；
arr的初始状态下，每个元素的值都为0;
arr的值由music.start(buffer)提供;
buffer可以通过music.decodeData()方法得到：
music.decodeData(xhr.response, function (buffer) {
        music.start(buffer);
    }, function (err) {
        console.log(err);
    })
*/
(function () {
    var music = new MusicBox(64, draw);
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
    var size = music.itemSize; //绘制数量
    var source = null; //存放钱一次播放的资源(解决快速点击时的bug)
    var count = 0; //存放当切换音乐的次数(解决快速点击时的bug)
    var box = $('#right')[0];
    var height, width; //右方区域宽高
    var cat = [];
    var canvas = document.createElement('canvas');
    box.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    /***************** canvas宽高自适应 *****宽高影响到渐变的范围设置******************/
    function resize() {
        height = box.clientHeight;
        width = box.clientWidth;
        canvas.width = width;
        canvas.height = height;
        initItem();
    };
    resize();
    var line = ctx.createLinearGradient(0, 0, 0, height); //左上角到右下角的渐变
    line.addColorStop(0, 'yellow');
    line.addColorStop(0.5, 'green');
    line.addColorStop(1, 'blue');
    window.onresize = resize;
    /*******给每一个动画元素添加初始状态*******/
    function initItem() {
        for (var i = 0; i < size; i++) {
            cat[i] = {
                x: $random(0, width)
                , y: $random(0, height)
                , catH: 0
                , color: ['rgb(' + $random(0, 255) + ',' + $random(0, 255) + ',' + $random(0, 255) + ')', 'rgba(' + $random(0, 255) + ',' + $random(0, 255) + ',' + $random(0, 255) + ',' + '.5)']
            };
        }
    }
    initItem();
    /*************************图形绘制*******************************/
    function draw(arr) {
        ctx.clearRect(0, 0, width, height);
        if (draw.type === 'col') {
            //        drawStart.column(width / size, line, arr);
            ctx.fillStyle = line; //设置整个画布渐变色
            var w = width / size; //每个柱子的宽
            var arr = arr;
            for (var i = 0; i < size; i++) {
                var h = arr[i] / 256 * height || 5; //每个柱子的高(给一个初始值)
                ctx.fillRect(w * i, height - h, w * 0.6, h); //柱子
                ctx.fillRect(w * i, height - cat[i].catH, w * 0.6, 5); //小帽
                cat[i].catH--; //小帽下落
                if (cat[i].catH < 0) {
                    cat[i].catH = 0; //落到底部
                }
                if (h > 0 && cat[i].catH < h + 5) { //如果h突然增高也会带动小帽增高
                    cat[i].catH = h + 5 > height ? height - 5 : h + 5; //不能超出顶部
                }
            }
        }
        else if (draw.type === 'cir') {
            for (var i = 0; i < size; i++) {
                var r = arr[i] / 256 * 50 || 5; //圆的半径
                var item = cat[i]; //每一个圆圈
                ctx.beginPath();
                ctx.arc(item.x, item.y, r, 0, 2 * Math.PI);
                var lineColor = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, r);
                lineColor.addColorStop(0, item.color[0]);
                lineColor.addColorStop(1, item.color[1]);
                ctx.fillStyle = lineColor; //改变填充色
                ctx.fill();
                item.x > 0 ? item.x-- : item.x = width; //x轴运动
                item.y > 0 ? item.y-- : item.y = height; //y轴运动
            }
        }
        else {
            var cx = width / 2
                , cy = height / 2;
            for (var i = 0; i < size; i++) {
                ctx.beginPath();
                ctx.arc(cx, cy, (i + 1) * 5, 0, 2 * Math.PI);
                ctx.strokeStyle = cat[i].color[1];
                ctx.lineWidth = arr[i] / 256 * 5;
                ctx.stroke();
            }
        }
    }
    draw.type = 'cir'; //绘制图形类型
    /**************************请求发送和请求处理函数*****************************/
    function load(url) {
        var n = ++count; //count是全局变量，因此每次点击都会正常的增加，n为局部变量，每次会深复制一份，有多个n
        xhr.abort(); //终止前一次xhr请求(万一钱一次请求还未完成时又发生一次点击)
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        /*××××××××××××××××请求处理完成时××××××××××××××××××*/
        xhr.onload = function () {
            if (n != count) return; //如果当前load函数内的n和全局的conut不等就return,即只播放最后一次点击的音乐
            /*×××××解析数据×××××*/
            music.decodeData(xhr.response, function (buffer) {
                if (n != count) return; //如果不是最后一次点击
                music.start(buffer);
            }, function (err) {
                /*错误处理*/
                console.log(err);
            })
        }
        xhr.send();
    }
    /*********改变音量***××××通过改变gainNode.gain.value××××****/
    function changeVolume(percent) {
        music.volume = percent * percent;
    }
    /*音量按钮change事件*/
    $('#volume')[0].onchange = function () {
        changeVolume(this.value / this.max);
    }
    $('#volume')[0].onchange; //让默认的音量大小立即生效
    $('#animation_type')[0].onchange = function () {
        draw.type = this.value; //改变绘制类型
    }
})();