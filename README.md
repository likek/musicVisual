# musicVisul
音乐可视化小练习(使用NodeJS , webAudio API , Canvas)
## 使用
1.项目依赖安装完成后，在/public/目录下创建media目录，将音乐文件放置在/public/media目录
2.运行npm start命令，打开本地3000端口
## 源码中webAudio类的使用
* var music = new MusicBox(64, draw);
* 其中64表示需要绘制的图形数量，draw函数必须包含一个参数arr，arr中存放了所有需要的音频数据；
* arr的初始状态下，每个元素的值都为0;
* arr的值由music.start(buffer)提供;
* buffer可以通过music.decodeData()方法得到：　　

`music.decodeData(xhr.response, function (buffer) {　　

    music.start(buffer);　　
    
}, function (err) {　　

    console.log(err);　　
    
})`
* 上面函数中xhr.response为后台获取到的音频数据