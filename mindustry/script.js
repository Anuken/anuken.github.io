function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

window.onload = function() {
    var lazy = new LazyLoad();

    var mob = window.innerWidth <= 800 && window.innerHeight <= 600;

    var modal = document.getElementById('modal');

    modal.onclick = function(e){
        if(e.target == modal)
            modal.style.display='none'
    }

    var modalImg = document.getElementById("modalimg");
    var images = document.getElementsByClassName("zoomer");
    for(var img of images){
        if(!mob || hasClass(img, "gif"))
        img.onclick = function(){
            modal.style.display = "block";
            modalImg.src = this.src;
        }
    }

    var span = document.getElementsByClassName("close")[0];

    span.onclick = function() { 
        modal.style.display = "none";
    }

    var gifs = document.getElementsByClassName("gif");
    
    for(var gif of gifs){
        (function(img){
            //TODO display gif loading
            img.loaded = false;

            var loadtext = document.createElement("div");
            loadtext.className = "top";
            loadtext.append("Loading...");
            //img.parentNode.insertBefore(loadtext, img.nextSibling);

            img.onload = ()=>{
                if(img.loaded){
                    //TODO
                }
            };

            img.onmouseover = ()=>{
                img.src = img.src.replace("gif-still.png", "gif.gif");
            }

            img.onmouseleave = ()=>{
                img.src = img.src.replace("gif.gif", "gif-still.png");
            }

            img.onmouseleave();
        })(gif);
    }

}