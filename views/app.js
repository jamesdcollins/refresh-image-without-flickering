let _data = "";
setInterval(() => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            if (_data != data) {
                _data = data;
                var pic = document.getElementById("picture");
                pic.src = data.name;
                pic.style.marginLeft = data.start_x+"px";
                pic.style.marginTop = data.start_y+"px";
                pic.style.width = data.width+"px";
                pic.style.height = data.height+"px";
                var rect = document.getElementById('rect');
                rect.style.left = data.rect_start_x+"px";
                rect.style.top = data.rect_start_y+"px";
                rect.style.width = data.rect_width+"px";
                rect.style.height = data.rect_height+"px";
            }
        }
    }
    xhttp.open('GET', 'http://localhost:3000/name', true);
    xhttp.send();
}, 500)