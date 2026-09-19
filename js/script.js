/* =========================================================
   HASNAIN VEHICLE EXPORTER
========================================================= */


/* =========================
   MOBILE MENU
========================= */

const mobileMenu = document.getElementById("mobileMenu");
const mainNav = document.getElementById("mainNav");

if (mobileMenu && mainNav) {

    mobileMenu.addEventListener("click", function () {

        mainNav.classList.toggle("active");

        const icon = mobileMenu.querySelector("i");

        if (mainNav.classList.contains("active")) {

            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");

        } else {

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        }

    });


    document.querySelectorAll(".main-nav a").forEach(function (link) {

        link.addEventListener("click", function () {

            mainNav.classList.remove("active");

            const icon = mobileMenu.querySelector("i");

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        });

    });

}


/* =========================
   ACTIVE NAVIGATION
========================= */

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".main-nav a[href^='#']");

function updateActiveNavigation() {

    let current = "";

    sections.forEach(function (section) {

        const sectionTop =
            section.offsetTop - 150;

        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }

    });


    navLinks.forEach(function (link) {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + current
        ) {
            link.classList.add("active");
        }

    });

}

window.addEventListener(
    "scroll",
    updateActiveNavigation
);


/* =========================
   HEADER SCROLL
========================= */

const header =
    document.getElementById("siteHeader");

window.addEventListener("scroll", function () {

    if (window.scrollY > 30) {

        header.style.boxShadow =
            "0 4px 20px rgba(0,0,0,.25)";

    } else {

        header.style.boxShadow = "none";

    }

});


/* =========================
   FAQ
========================= */

const faqDetails =
    document.querySelectorAll(".faq-list details");

faqDetails.forEach(function (detail) {

    detail.addEventListener("toggle", function () {

        if (detail.open) {

            faqDetails.forEach(function (other) {

                if (
                    other !== detail &&
                    other.open
                ) {
                    other.removeAttribute("open");
                }

            });

        }

    });

});


/* =========================
   CURRENT YEAR
========================= */

const year =
    document.getElementById("year");

if (year) {

    year.textContent =
        new Date().getFullYear();

}


/* =========================
   EXTERNAL LINKS
========================= */

document
    .querySelectorAll('a[target="_blank"]')
    .forEach(function (link) {

        link.setAttribute(
            "rel",
            "noopener noreferrer"
        );

    });
