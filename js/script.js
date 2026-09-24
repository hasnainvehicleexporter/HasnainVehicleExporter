/* =========================================================
   HASNAIN VEHICLE EXPORTER
   Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    const mobileMenu = document.getElementById("mobileMenu");
    const mainNav = document.getElementById("mainNav");

    if (mobileMenu && mainNav) {

        mobileMenu.addEventListener("click", function () {

            const isOpen = mainNav.classList.toggle("active");

            mobileMenu.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            const icon = mobileMenu.querySelector("i");

            if (icon) {
                icon.className = isOpen
                    ? "fa-solid fa-xmark"
                    : "fa-solid fa-bars";
            }

        });

        /* Close menu when clicking a navigation link */

        const navLinks = mainNav.querySelectorAll("a");

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                mainNav.classList.remove("active");

                mobileMenu.setAttribute(
                    "aria-expanded",
                    "false"
                );

                const icon = mobileMenu.querySelector("i");

                if (icon) {
                    icon.className = "fa-solid fa-bars";
                }

            });

        });

    }


    /* =====================================================
       WHATSAPP REQUEST FORM
       ===================================================== */

    const whatsappForm =
        document.getElementById("whatsappForm");

    if (whatsappForm) {

        whatsappForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const name =
                    document.getElementById("name").value.trim();

                const country =
                    document.getElementById("country").value.trim();

                const phone =
                    document.getElementById("phone").value.trim();

                const requestType =
                    document.getElementById("requestType").value.trim();

                const vehicle =
                    document.getElementById("vehicle").value.trim();

                const budget =
                    document.getElementById("budget").value.trim();

                const message =
                    document.getElementById("message").value.trim();


                /*
                 * Basic validation
                 */

                if (
                    !name ||
                    !country ||
                    !phone ||
                    !requestType ||
                    !vehicle ||
                    !message
                ) {

                    alert(
                        "Please complete all required fields before sending your request."
                    );

                    return;

                }


                /*
                 * Create WhatsApp message
                 */

                let whatsappMessage =
                    "Hello Hasnain Vehicle Exporter,\n\n" +
                    "*NEW VEHICLE / PARTS REQUEST*\n\n" +

                    "*Name:* " +
                    name +
                    "\n" +

                    "*Country:* " +
                    country +
                    "\n" +

                    "*WhatsApp:* " +
                    phone +
                    "\n" +

                    "*Request Type:* " +
                    requestType +
                    "\n" +

                    "*Vehicle / Part Details:* " +
                    vehicle;


                if (budget) {

                    whatsappMessage +=
                        "\n" +
                        "*Budget:* " +
                        budget;

                }


                whatsappMessage +=
                    "\n\n" +
                    "*Message:*\n" +
                    message +

                    "\n\n" +
                    "Sent from Hasnain Vehicle Exporter website.";


                /*
                 * Encode message for WhatsApp
                 */

                const encodedMessage =
                    encodeURIComponent(
                        whatsappMessage
                    );


                /*
                 * WhatsApp number
                 *
                 * International format:
                 * +92 319 8148346
                 *
                 * WhatsApp URL:
                 * 923198148346
                 */

                const whatsappURL =
                    "https://wa.me/923198148346?text=" +
                    encodedMessage;


                /*
                 * Open WhatsApp
                 */

                window.open(
                    whatsappURL,
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

    }


    /* =====================================================
       ACTIVE NAVIGATION WHILE SCROLLING
       ===================================================== */

    const sections =
        document.querySelectorAll("section[id]");

    const navigationLinks =
        document.querySelectorAll(
            '.main-nav a[href^="#"]'
        );


    function updateActiveNavigation() {

        let currentSection = "";

        const scrollPosition =
            window.scrollY + 150;


        sections.forEach(function (section) {

            const sectionTop =
                section.offsetTop;

            const sectionHeight =
                section.offsetHeight;


            if (
                scrollPosition >= sectionTop &&
                scrollPosition <
                sectionTop + sectionHeight
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navigationLinks.forEach(function (link) {

            link.classList.remove("active");

            const href =
                link.getAttribute("href");

            if (
                href === "#" +
                currentSection
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
       HEADER SHADOW ON SCROLL
       ===================================================== */

    const header =
        document.querySelector(".site-header");


    function updateHeader() {

        if (!header) {
            return;
        }


        if (window.scrollY > 30) {

            header.style.boxShadow =
                "0 5px 25px rgba(0, 0, 0, 0.35)";

        } else {

            header.style.boxShadow =
                "none";

        }

    }


    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );


    updateHeader();


    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    const anchorLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    anchorLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetID =
                    link.getAttribute("href");


                if (
                    !targetID ||
                    targetID === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetID
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

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

                            otherDetail.removeAttribute(
                                "open"
                            );

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
            ".about-main-image, " +
            ".about-point, " +
            ".process-step, " +
            ".why-column, " +
            ".africa-column, " +
            ".africa-image, " +
            ".faq-list details"
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
                                    "is-visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.10,
                    rootMargin: "0px 0px -40px 0px"
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
       PROTECT EXTERNAL LINKS
       ===================================================== */

    const externalLinks =
        document.querySelectorAll(
            'a[target="_blank"]'
        );


    externalLinks.forEach(function (link) {

        const currentRel =
            link.getAttribute("rel") || "";

        if (
            !currentRel.includes("noopener")
        ) {

            link.setAttribute(
                "rel",
                "noopener noreferrer"
            );

        }

    });


    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    const currentYear =
        document.querySelector(
            ".current-year"
        );


    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       CONSOLE BRAND MESSAGE
       ===================================================== */

    console.log(
        "Hasnain Vehicle Exporter — Japan to Africa"
    );

});
