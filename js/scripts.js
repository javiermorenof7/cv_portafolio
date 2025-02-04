// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Typed.js effect
function newTyped(){}
$(function(){
    $("#typed").typed({
        strings: ["Web Developer", "Tech Enthusiast", "Problem Solver"],
        typeSpeed: 90,
        backDelay: 700,
        contentType: "html",
        loop: true,
        resetCallback: function() { newTyped() }
    });
    $(".reset").click(function(){
        $("#typed").typed("reset");
    });
});

// Back to top button
let mybutton = document.getElementById("myBtn");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}