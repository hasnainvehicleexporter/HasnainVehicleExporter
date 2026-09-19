/* =========================================================
   HASNAIN VEHICLE EXPORTER
   WEBSITE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileMenu = document.querySelector(".mobile-menu");
    const mainNav = document.querySelector(".main-nav");

    if (mobileMenu && mainNav) {

        mobileMenu.addEventListener("click", function () {

            mainNav.classList.toggle("active");

            const isOpen = mainNav.classList.contains("active");

            mobileMenu.setAttribute("aria-expanded", isOpen);

            mobileMenu.innerHTML = isOpen ? "&#10005;" : "&#9776;";

        });


        /* Close menu when navigation link is clicked */

        const navLinks = mainNav.querySelectorAll("a");

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                mainNav.classList.remove("active");

                mobileMenu.setAttribute("aria-expanded", "false");

                mobileMenu.innerHTML = "&#9776;";

            });

        });

    }


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    const header = document.querySelector(".site-header");

    if (header) {

        function updateHeader() {

            if (window.scrollY > 30) {

                header.style.boxShadow =
                    "0 5px 25px rgba(0,0,0,0.35)";

            } else {

                header.style.boxShadow = "none";

            }

        }

        updateHeader();

        window.addEventListener("scroll", updateHeader, {
            passive: true
        });

    }


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections = document.querySelectorAll("section[id]");

    const navigationLinks =
        document.querySelectorAll(".main-nav a[href^='#']");


    function updateActiveNavigation() {

        let currentSection = "";

        const scrollPosition =
            window.scrollY + 130;


        sections.forEach(function (section) {

            const sectionTop = section.offsetTop;

            const sectionHeight = section.offsetHeight;

            if (
                scrollPosition >= sectionTop &&
                scrollPosition < sectionTop + sectionHeight
            ) {

                currentSection = section.getAttribute("id");

            }

        });


        navigationLinks.forEach(function (link) {

            link.classList.remove("active");

            const target =
                link.getAttribute("href");

            if (
                target === "#" + currentSection
            ) {

                link.classList.add("active");

            }

        });

    }


    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        { passive: true }
    );

    updateActiveNavigation();


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetID =
                this.getAttribute("href");

            if (
                !targetID ||
                targetID === "#"
            ) {

                return;

            }


            const target =
                document.querySelector(targetID);

            if (!target) {

                return;

            }


            event.preventDefault();


            const headerHeight =
                header ? header.offsetHeight : 0;


            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight;


            window.scrollTo({

                top: targetPosition,

                behavior: "smooth"

            });

        });

    });


    /* =====================================================
       FAQ
    ===================================================== */

    const faqDetails =
        document.querySelectorAll(
            ".faq-list details"
        );


    faqDetails.forEach(function (detail) {

        detail.addEventListener(
            "toggle",
            function () {

                if (!detail.open) {

                    return;

                }


                faqDetails.forEach(
                    function (otherDetail) {

                        if (
                            otherDetail !== detail &&
                            otherDetail.open
                        ) {

                            otherDetail.open = false;

                        }

                    }
                );

            }
        );

    });


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".service-card, " +
            ".about-copy, " +
            ".about-middle, " +
            ".about-points, " +
            ".process-step, " +
            ".why-column, " +
            ".africa-column, " +
            ".africa-image, " +
            ".faq-intro, " +
            ".faq-list"
        );


    if (
        "IntersectionObserver" in window &&
        revealElements.length
    ) {

        const revealObserver =
            new IntersectionObserver(
                function (entries, observer) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "show"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            function (element) {

                element.classList.add(
                    "reveal"
                );

                revealObserver.observe(
                    element
                );

            }
        );

    }


    /* =====================================================
       WHATSAPP FORM
    ===================================================== */

    const whatsappForm =
        document.querySelector(
            "#whatsappForm"
        );


    if (whatsappForm) {

        whatsappForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    document.querySelector(
                        "#name"
                    )?.value.trim() || "";


                const country =
                    document.querySelector(
                        "#country"
                    )?.value.trim() || "";


                const phone =
                    document.querySelector(
                        "#whatsapp"
                    )?.value.trim() || "";


                const requestType =
                    document.querySelector(
                        "#requestType"
                    )?.value.trim() || "";


                const vehicle =
                    document.querySelector(
                        "#vehicle"
                    )?.value.trim() || "";


                const budget =
                    document.querySelector(
                        "#budget"
                    )?.value.trim() || "";


                const message =
                    document.querySelector(
                        "#message"
                    )?.value.trim() || "";


                let whatsappMessage =
                    "Hello Hasnain Vehicle Exporter,%0A%0A";


                whatsappMessage +=
                    "*New Website Inquiry*%0A%0A";


                whatsappMessage +=
                    "*Name:* " +
                    encodeURIComponent(name) +
                    "%0A";


                whatsappMessage +=
                    "*Country:* " +
                    encodeURIComponent(country) +
                    "%0A";


                whatsappMessage +=
                    "*WhatsApp:* " +
                    encodeURIComponent(phone) +
                    "%0A";


                whatsappMessage +=
                    "*Request:* " +
                    encodeURIComponent(requestType) +
                    "%0A";


                whatsappMessage +=
                    "*Vehicle / Part Details:* " +
                    encodeURIComponent(vehicle) +
                    "%0A";


                if (budget !== "") {

                    whatsappMessage +=
                        "*Budget:* " +
                        encodeURIComponent(budget) +
                        "%0A";

                } else {

                    whatsappMessage +=
                        "*Budget:* Not provided%0A";

                }


                whatsappMessage +=
                    "*Message:* " +
                    encodeURIComponent(message) +
                    "%0A%0A";


                whatsappMessage +=
                    "Sent from the Hasnain Vehicle Exporter website.";


                const whatsappNumber =
                    "923392207418";


                const whatsappURL =
                    "https://wa.me/" +
                    whatsappNumber +
                    "?text=" +
                    whatsappMessage;


                window.open(
                    whatsappURL,
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

    }


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );


    yearElements.forEach(
        function (element) {

            element.textContent =
                new Date().getFullYear();

        }
    );


    /* =====================================================
       ESC KEY - CLOSE MOBILE MENU
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                mainNav &&
                mainNav.classList.contains("active")
            ) {

                mainNav.classList.remove(
                    "active"
                );

                if (mobileMenu) {

                    mobileMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    mobileMenu.innerHTML =
                        "&#9776;";

                }

            }

        }
    );


    /* =====================================================
       PREVENT EMPTY BUTTON LINKS
    ===================================================== */

    document.querySelectorAll(
        'a[href="#"]'
    ).forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

            }
        );

    });

});
