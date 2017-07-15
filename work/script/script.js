var slideIndex = 1;
showSlides();

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

var slideIndexLuPO = 1;
showSlidesLuPO();

function plusSlidesLuPO(n) {
  showSlidesLuPO(slideIndexLuPO += n);
}

function currentSlideLuPO(n) {
  showSlidesLuPO(slideIndexLuPO = n);
}

function showSlidesLuPO(n) {
  var i;
  var slides = document.getElementsByClassName("mySlidesLuPO");
  var dots = document.getElementsByClassName("dotLuPO");
  if (n > slides.length) {slideIndexLuPO = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndexLuPO-1].style.display = "block";
  dots[slideIndexLuPO-1].className += " active";
}

var slideIndexLiA = 1;
showSlidesLiA();

function plusSlidesLiA(n) {
  showSlidesLiA(slideIndexLiA += n);
}

function currentSlideLiA(n) {
  showSlidesLiA(slideIndexLiA = n);
}

function showSlidesLiA(n) {
  var i;
  var slides = document.getElementsByClassName("mySlidesLiA");
  var dots = document.getElementsByClassName("dotLiA");
  if (n > slides.length) {slideIndexLiA = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndexLiA-1].style.display = "block";
  dots[slideIndexLiA-1].className += " active";
}
