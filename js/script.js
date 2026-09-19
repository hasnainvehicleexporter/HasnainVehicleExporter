/* =========================================================
   HASNAIN VEHICLE EXPORTER
   Main JavaScript
   ========================================================= */


/* =========================
   MOBILE NAVIGATION
   ========================= */

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {

        nav.classList.toggle("active");

        const isOpen = nav.classList.contains("active");

        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );

    });


    /* Close menu after clicking a navigation link */

    const navLinks = nav.querySelectorAll("a");

    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            nav.classList.remove("active");

            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

        });

    });

}


/* =========================
   WHATSAPP FORM
   ========================= */

const whatsappForm = document.getElementById("whatsappForm");

if (whatsappForm) {

    whatsappForm.addEventListener("submit", function (event) {

        event.preventDefault();


        /* Get form values */

        const name =
            document.getElementById("name").value.trim();

        const country =
            document.getElementById("country").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const requestType =
            document.getElementById("requestType").value.trim();

        const details =
            document.getElementById("details").value.trim();

        const budget =
            document.getElementById("budget").value.trim();

        const message =
            document.getElementById("message").value.trim();


        /* Basic validation */

        if (
            !name ||
            !country ||
            !phone ||
            !requestType ||
            !details ||
            !message
        ) {

            alert(
                "Please complete all required fields before sending your request."
            );

            return;
        }


        /* Optional budget */

        const budgetText = budget
            ? budget
            : "Not provided";


        /* Create WhatsApp message */

        const whatsappMessage =

`Hello Hasnain Vehicle Exporter,

I would like to make an inquiry.

Name: ${name}

Country: ${country}

My WhatsApp Number: ${phone}

Request Type: ${requestType}

Vehicle / Part Details:
${details}

Budget:
${budgetText}

Message:
${message}

Please provide me with more information.

Thank you.`;


        /* Encode message */

        const encodedMessage =
            encodeURIComponent(whatsappMessage);


        /* WhatsApp number */

        const whatsappNumber =
            "923392207418";


        /* WhatsApp URL */

        const whatsappURL =
            `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;


        /* Open WhatsApp */

        window.open(
            whatsappURL,
            "_blank",
            "noopener,noreferrer"
        );

    });

}


/* =========================
   HEADER SCROLL EFFECT
   ========================= */

const header = document.querySelector(".header");

if (header) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            header.style.background =
                "rgba(5, 5, 5, 0.98)";

        } else {

            header.style.background =
                "rgba(8, 8, 8, 0.94)";

        }

    });

}


/* =========================
   CURRENT YEAR
   ========================= */

const currentYear =
    document.querySelector(".footer-bottom p");

if (currentYear) {

    currentYear.textContent =
        `© ${new Date().getFullYear()} Hasnain Vehicle Exporter. All rights reserved.`;

}


/* =========================
   EXTERNAL LINKS
   ========================= */

document.querySelectorAll('a[target="_blank"]').forEach((link) => {

    link.setAttribute(
        "rel",
        "noopener noreferrer"
    );

});
