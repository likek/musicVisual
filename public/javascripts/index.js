function $(ele) {
    return document.querySelectorAll(ele);
}
var lis = $('#list li');
lis[0].className = 'selected';
for (var i = 0; i < lis.length; i++) {
    lis[i].onclick = function () {
        for (var j = 0; j < lis.length; j++) {
            lis[j].className = '';
        }
        this.className = 'selected';
        load('/media/' + this.title);
    }
}
var xhr = new XMLHttpRequest();

function load(url) {
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        console.log(xhr.response);
    }
    xhr.send();
}