document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // 1. COMMON HELPER FUNCTIONS
    // =========================================

    const normalize = (text = "") => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    };


    const showMessage = (element, message, success = true) => {

        if (!element) return;

        element.textContent = message;
        element.style.display = "block";
        element.style.color = success ? "#267A45" : "#C0392B";
        element.style.marginTop = "15px";

    };


    const getPropertySection = (title) => {

        const name = normalize(title);

        if (name.includes("penthouse")) return "luxury-penthouse";
        if (name.includes("family")) return "family-house";
        if (name.includes("villa")) return "modern-villa";
        if (name.includes("luxuryhouse")) return "luxury-house";

        if (name.includes("modernapartment")) {
            return "modern-apartment";
        }

        if (name.includes("apartment")) {
            return "luxury-apartment";
        }

        return "family-house";

    };


    // =========================================
    // 2. FAVORITES DATA
    // =========================================

    let favoriteProperties = [];

    try {

        favoriteProperties = JSON.parse(
            localStorage.getItem("capitalEstateFavorites")
        ) || [];

    } catch (error) {

        favoriteProperties = [];

    }


    let showOnlyFavorites = false;


    const getCardId = (card) => {

        const title =
            card.querySelector("h3")?.textContent.trim() || "";

        return normalize(title);

    };


    const saveFavorites = () => {

        try {

            localStorage.setItem(
                "capitalEstateFavorites",
                JSON.stringify(favoriteProperties)
            );

        } catch (error) {

            console.error("Unable to save favorites:", error);

        }

    };


    // =========================================
    // 3. NAVIGATION / HAMBURGER MENU
    // =========================================

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");


    if (menuToggle && navLinks) {

        menuToggle.setAttribute("aria-expanded", "false");


        menuToggle.addEventListener("click", (event) => {

            event.stopPropagation();

            navLinks.classList.toggle("active");

            const isOpen = navLinks.classList.contains("active");

            menuToggle.setAttribute("aria-expanded", isOpen);

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );

        });


        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

            });

        });


        document.addEventListener("click", (event) => {

            if (
                !navLinks.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {

                navLinks.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

            }

        });


        document.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {

                navLinks.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");

            }

        });

    }


    // =========================================
    // 4. HOMEPAGE PROPERTY SEARCH
    // =========================================

    const homeSearchForm = document.querySelector(".search-form");


    if (homeSearchForm) {

        homeSearchForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const location =
                document.querySelector("#location")?.value || "";

            const type =
                document.querySelector("#property-type")?.value || "";

            const price =
                document.querySelector("#price-range")?.value || "";


            const params = new URLSearchParams();

            if (location) params.set("location", location);

            if (type) params.set("type", type);

            if (price) params.set("price", price);


            window.location.href =
                `properties.html?${params.toString()}#all-properties`;

        });

    }


    // =========================================
    // 5. PROPERTIES PAGE FILTERING
    // =========================================

    const propertiesSearchForm = document.querySelector(
        ".properties-search-form"
    );

    const listingCards = document.querySelectorAll(".listing-card");

    const categoryCards = document.querySelectorAll(
        ".properties-category-card"
    );


    const locationFilter = document.querySelector(
        ".properties-search-form #location"
    );

    const typeFilter = document.querySelector(
        ".properties-search-form #property-type"
    );

    const priceFilter = document.querySelector(
        ".properties-search-form #price-range"
    );


    // Extract property price

    const getPrice = (text) => {

        const match = text.match(/([\d.]+)\s*crore/i);

        return match ? parseFloat(match[1]) : 0;

    };


    // Price filtering

    const matchesPrice = (price, selectedPrice) => {

        if (!selectedPrice) return true;

        const selected = normalize(selectedPrice);

        switch (selected) {

            case "under1crore":
                return price < 1;

            case "12crore":
                return price >= 1 && price < 2;

            case "25crore":
                return price >= 2 && price < 5;

            case "510crore":
                return price >= 5 && price <= 10;

            case "above10crore":
                return price > 10;

            default:
                return true;

        }

    };


    // Property type matching

    const matchesType = (title, selectedType) => {

        if (!selectedType) return true;

        const propertyTitle = normalize(title);
        const selected = normalize(selectedType);


        const typeKeywords = {

            familyhouse: ["familyhouse"],

            luxuryapartment: ["luxuryapartment"],

            luxuryhouse: ["luxuryhouse"],

            luxurypenthouse: ["luxurypenthouse"],

            modernvilla: ["modernvilla"],

            modernapartment: ["modernapartment"]

        };


        const keywords = typeKeywords[selected] || [selected];


        return keywords.some(keyword => {

            return propertyTitle.includes(keyword);

        });

    };


    // Location matching

    const matchesLocation = (locationText, selectedLocation) => {

        if (!selectedLocation) return true;

        return normalize(locationText).includes(
            normalize(selectedLocation)
        );

    };


    // No results message

    let noResults = document.querySelector(
        ".no-properties-message"
    );


    if (listingCards.length > 0) {

        if (!noResults) {

            noResults = document.createElement("p");

            noResults.className = "no-properties-message";

            noResults.textContent =
                "No properties found matching your search.";

            noResults.style.textAlign = "center";

            noResults.style.padding = "30px";

            noResults.style.display = "none";

            document.querySelector("#all-properties")?.appendChild(
                noResults
            );

        }

    }


    // Main filtering function

    const applyFilters = () => {

        if (listingCards.length === 0) return;

        const selectedLocation = locationFilter?.value || "";

        const selectedType = typeFilter?.value || "";

        const selectedPrice = priceFilter?.value || "";


        let visibleCount = 0;


        listingCards.forEach(card => {

            const locationText =
                card.querySelector(".listing-location")?.textContent || "";

            const title =
                card.querySelector(".listing-content h3")?.textContent || "";

            const priceText =
                card.querySelector(".listing-price h4")?.textContent || "";


            const price = getPrice(priceText);


            const locationMatch = matchesLocation(
                locationText,
                selectedLocation
            );


            const typeMatch = matchesType(
                title,
                selectedType
            );


            const priceMatch = matchesPrice(
                price,
                selectedPrice
            );


            const favoriteMatch =
                !showOnlyFavorites ||
                favoriteProperties.includes(getCardId(card));


            const isVisible =
                locationMatch &&
                typeMatch &&
                priceMatch &&
                favoriteMatch;


            card.style.display = isVisible ? "" : "none";


            if (isVisible) visibleCount++;

        });


        if (noResults) {

            noResults.style.display =
                visibleCount === 0 ? "block" : "none";

        }

    };


    // Search form submit

    if (propertiesSearchForm) {

        propertiesSearchForm.addEventListener("submit", (event) => {

            event.preventDefault();

            applyFilters();

            document.querySelector("#all-properties")?.scrollIntoView({
                behavior: "smooth"
            });

        });

    }


    // Live dropdown filtering

    [locationFilter, typeFilter, priceFilter].forEach(filter => {

        filter?.addEventListener("change", applyFilters);

    });


    // Read homepage search parameters

    const params = new URLSearchParams(window.location.search);


    if (locationFilter && params.has("location")) {

        const locationMap = {

            "f-6": "F-6 Islamabad",

            "f-7": "F-7 Islamabad",

            "e-11": "E-11 Islamabad",

            "dha-islamabad": "DHA Islamabad",

            "bahria-town": "Bahria Town"

        };


        locationFilter.value =
            locationMap[params.get("location")] || "";

    }


    if (typeFilter && params.has("type")) {

        const typeMap = {

            "family-house": "Family House",

            "luxury-apartment": "Luxury Apartment",

            "luxury-house": "Luxury House",

            "luxury-penthouse": "Luxury Penthouse",

            "modern-villa": "Modern Villa",

            "modern-apartment": "Modern Apartment"

        };


        typeFilter.value =
            typeMap[params.get("type")] || params.get("type");

    }


    if (priceFilter && params.has("price")) {

        const priceMap = {

            "under-1-crore": "Under 1 Crore",

            "1-2-crore": "1 - 2 Crore",

            "2-5-crore": "2 - 5 Crore",

            "5-10-crore": "5 - 10 Crore",

            "above-10-crore": "Above 10 Crore"

        };


        priceFilter.value =
            priceMap[params.get("price")] || "";

    }


    // =========================================
    // 6. PROPERTY CATEGORY CARDS
    // =========================================

    categoryCards.forEach(card => {

        card.style.cursor = "pointer";


        card.addEventListener("click", () => {

            const heading =
                card.querySelector("h3")?.textContent || "";


            const categoryMap = {

                familyhouses: "Family House",

                luxuryapartments: "Luxury Apartment",

                luxuryhouses: "Luxury House",

                luxurypenthouses: "Luxury Penthouse",

                modernvillas: "Modern Villa",

                modernapartments: "Modern Apartment"

            };


            const selectedCategory =
                categoryMap[normalize(heading)];


            if (!selectedCategory || !typeFilter) return;


            typeFilter.value = selectedCategory;


            // Reset favorite-only mode when selecting a category

            showOnlyFavorites = false;

            if (favoriteToggle) {

                favoriteToggle.textContent = "Show Favorites ♡";

            }


            applyFilters();


            document.querySelector("#all-properties")?.scrollIntoView({
                behavior: "smooth"
            });

        });

    });


    // =========================================
    // 7. FAVORITE PROPERTIES
    // =========================================

    const allPropertyCards = document.querySelectorAll(
        ".property-card, .listing-card"
    );


    allPropertyCards.forEach(card => {

        const cardId = getCardId(card);

        if (!cardId) return;


        const favoriteButton = document.createElement("button");

        favoriteButton.type = "button";

        favoriteButton.className = "favorite-property-btn";


        const updateFavoriteButton = () => {

            const isFavorite =
                favoriteProperties.includes(cardId);

            favoriteButton.innerHTML = isFavorite ? "♥" : "♡";

            favoriteButton.setAttribute(
                "aria-label",
                isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
            );

        };


        updateFavoriteButton();


        favoriteButton.style.cursor = "pointer";

        favoriteButton.style.fontSize = "23px";

        favoriteButton.style.background = "white";

        favoriteButton.style.border = "none";

        favoriteButton.style.borderRadius = "50%";

        favoriteButton.style.width = "42px";

        favoriteButton.style.height = "42px";

        favoriteButton.style.color = "#267A45";


        const imageContainer =
            card.querySelector(".property-image") ||
            card.querySelector(".listing-image") ||
            card.querySelector("img")?.parentElement ||
            card;


        if (getComputedStyle(imageContainer).position === "static") {

            imageContainer.style.position = "relative";

        }


        favoriteButton.style.position = "absolute";

        favoriteButton.style.top = "12px";

        favoriteButton.style.right = "12px";

        favoriteButton.style.zIndex = "5";


        imageContainer.appendChild(favoriteButton);


        favoriteButton.addEventListener("click", (event) => {

            event.preventDefault();

            event.stopPropagation();


            if (favoriteProperties.includes(cardId)) {

                favoriteProperties = favoriteProperties.filter(
                    id => id !== cardId
                );

            } else {

                favoriteProperties.push(cardId);

            }


            saveFavorites();

            updateFavoriteButton();


            // Keep search filters and favorite filter working together

            if (listingCards.length > 0) {

                applyFilters();

            } else {

                applyFavoriteFilter();

            }

        });

    });


    // Homepage favorites filtering

    const applyFavoriteFilter = () => {

        document.querySelectorAll(".property-card").forEach(card => {

            if (!showOnlyFavorites) {

                card.style.display = "";

                return;

            }


            card.style.display =
                favoriteProperties.includes(getCardId(card))
                    ? ""
                    : "none";

        });

    };


    // Show favorites button

    const favoriteToggle = document.createElement("button");

    favoriteToggle.type = "button";

    favoriteToggle.textContent = "Show Favorites ♡";

    favoriteToggle.className = "show-favorites-btn";

    favoriteToggle.style.padding = "10px 18px";

    favoriteToggle.style.margin = "15px 0";

    favoriteToggle.style.cursor = "pointer";


    if (listingCards.length > 0) {

        document.querySelector("#all-properties")?.prepend(
            favoriteToggle
        );

    }


    favoriteToggle.addEventListener("click", () => {

        showOnlyFavorites = !showOnlyFavorites;


        favoriteToggle.textContent = showOnlyFavorites
            ? "Show All Properties"
            : "Show Favorites ♡";


        if (listingCards.length > 0) {

            applyFilters();

        } else {

            applyFavoriteFilter();

        }

    });


    // Apply homepage favorite filter when needed

    if (document.querySelector(".property-card")) {

        // Favorites are shown normally until the user selects a filter.

        showOnlyFavorites = false;

    }


    // Apply homepage filters from URL, if applicable

    if (listingCards.length > 0 && params.toString()) {

        applyFilters();

    }


    // =========================================
    // 8. PROPERTY DETAILS LINKS
    // =========================================

    document.querySelectorAll(
        ".property-card, .listing-card"
    ).forEach(card => {

        const title =
            card.querySelector("h3")?.textContent || "";


        const detailsLink = card.querySelector(
            ".details-btn, .view-details-btn"
        );


        if (detailsLink) {

            const sectionId = getPropertySection(title);

            detailsLink.href =
                `property-details.html#${sectionId}`;

        }

    });


    // =========================================
    // 9. PROPERTY GALLERY LIGHTBOX
    // =========================================

    const galleryImages = Array.from(
        document.querySelectorAll(
            ".property-gallery-grid .interior-gallery-card img"
        )
    );


    if (galleryImages.length > 0) {

        let currentImageIndex = 0;


        const lightbox = document.createElement("div");

        lightbox.className = "gallery-lightbox";


        Object.assign(lightbox.style, {

            position: "fixed",

            inset: "0",

            background: "rgba(0,0,0,0.94)",

            display: "none",

            alignItems: "center",

            justifyContent: "center",

            flexDirection: "column",

            zIndex: "99999",

            padding: "20px"

        });


        // Main image

        const lightboxImage = document.createElement("img");


        Object.assign(lightboxImage.style, {

            maxWidth: "85%",

            maxHeight: "78vh",

            objectFit: "contain",

            borderRadius: "5px"

        });


        // Close button

        const closeButton = document.createElement("button");

        closeButton.innerHTML = "&times;";

        closeButton.setAttribute("aria-label", "Close gallery");


        Object.assign(closeButton.style, {

            position: "absolute",

            top: "15px",

            right: "25px",

            fontSize: "45px",

            color: "white",

            background: "none",

            border: "none",

            cursor: "pointer",

            zIndex: "10"

        });


        // Previous button

        const previousButton = document.createElement("button");

        previousButton.innerHTML = "&#10094;";

        previousButton.setAttribute("aria-label", "Previous image");


        // Next button

        const nextButton = document.createElement("button");

        nextButton.innerHTML = "&#10095;";

        nextButton.setAttribute("aria-label", "Next image");


        [previousButton, nextButton].forEach(button => {

            Object.assign(button.style, {

                position: "absolute",

                top: "50%",

                transform: "translateY(-50%)",

                fontSize: "30px",

                color: "white",

                background: "rgba(255,255,255,0.15)",

                border: "none",

                borderRadius: "50%",

                width: "50px",

                height: "50px",

                cursor: "pointer",

                zIndex: "10"

            });

        });


        previousButton.style.left = "20px";

        nextButton.style.right = "20px";


        // Image counter

        const imageCounter = document.createElement("p");

        Object.assign(imageCounter.style, {

            color: "white",

            fontSize: "15px",

            marginTop: "18px"

        });


        // Add elements

        lightbox.appendChild(lightboxImage);

        lightbox.appendChild(closeButton);

        lightbox.appendChild(previousButton);

        lightbox.appendChild(nextButton);

        lightbox.appendChild(imageCounter);

        document.body.appendChild(lightbox);


        // Display selected image

        const showGalleryImage = (index) => {

            if (index < 0) {

                currentImageIndex = galleryImages.length - 1;

            } else if (index >= galleryImages.length) {

                currentImageIndex = 0;

            } else {

                currentImageIndex = index;

            }


            const selectedImage = galleryImages[currentImageIndex];


            lightboxImage.src = selectedImage.src;

            lightboxImage.alt = selectedImage.alt;


            imageCounter.textContent =
                `${currentImageIndex + 1} / ${galleryImages.length}`;

        };


        // Open gallery

        const openLightbox = (index) => {

            showGalleryImage(index);

            lightbox.style.display = "flex";

            document.body.style.overflow = "hidden";

        };


        // Close gallery

        const closeLightbox = () => {

            lightbox.style.display = "none";

            lightboxImage.src = "";

            document.body.style.overflow = "";

        };


        // Click on gallery image

        galleryImages.forEach((img, index) => {

            img.style.cursor = "zoom-in";

            img.addEventListener("click", () => {

                openLightbox(index);

            });

        });


        // Previous image

        previousButton.addEventListener("click", () => {

            showGalleryImage(currentImageIndex - 1);

        });


        // Next image

        nextButton.addEventListener("click", () => {

            showGalleryImage(currentImageIndex + 1);

        });


        // Close button

        closeButton.addEventListener("click", closeLightbox);


        // Click outside image

        lightbox.addEventListener("click", (event) => {

            if (event.target === lightbox) {

                closeLightbox();

            }

        });


        // Keyboard controls

        document.addEventListener("keydown", (event) => {

            if (lightbox.style.display !== "flex") return;


            if (event.key === "Escape") {

                closeLightbox();

            }

            if (event.key === "ArrowRight") {

                showGalleryImage(currentImageIndex + 1);

            }

            if (event.key === "ArrowLeft") {

                showGalleryImage(currentImageIndex - 1);

            }

        });


        // Mobile swipe support

        let touchStartX = 0;


        lightbox.addEventListener("touchstart", (event) => {

            touchStartX = event.changedTouches[0].screenX;

        });


        lightbox.addEventListener("touchend", (event) => {

            const touchEndX = event.changedTouches[0].screenX;

            const difference = touchStartX - touchEndX;


            if (Math.abs(difference) < 50) return;


            if (difference > 0) {

                showGalleryImage(currentImageIndex + 1);

            } else {

                showGalleryImage(currentImageIndex - 1);

            }

        });

    }


    // =========================================
    // 10. CONTACT FORM VALIDATION
    // =========================================

    const contactForm = document.querySelector(".contact-form");


    if (contactForm) {

        const statusMessage = document.createElement("p");

        statusMessage.className = "contact-form-status";

        statusMessage.style.display = "none";

        contactForm.appendChild(statusMessage);


        contactForm.addEventListener("submit", (event) => {

            event.preventDefault();


            const fullName =
                document.querySelector("#fullName")?.value.trim() || "";

            const email =
                document.querySelector("#email")?.value.trim() || "";

            const phone =
                document.querySelector("#phone")?.value.trim() || "";

            const subject =
                document.querySelector("#subject")?.value || "";

            const message =
                document.querySelector("#message")?.value.trim() || "";


            // Required fields

            if (
                !fullName ||
                !email ||
                !phone ||
                !subject ||
                !message
            ) {

                showMessage(
                    statusMessage,
                    "Please complete all fields.",
                    false
                );

                return;

            }


            // Email validation

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                showMessage(
                    statusMessage,
                    "Please enter a valid email address.",
                    false
                );

                return;

            }


            // Phone validation

            const phonePattern = /^[+0-9\s()-]{7,20}$/;


            if (!phonePattern.test(phone)) {

                showMessage(
                    statusMessage,
                    "Please enter a valid phone number.",
                    false
                );

                return;

            }


            // Save form data

            const contactData = {

                fullName,

                email,

                phone,

                subject,

                message,

                submittedAt: new Date().toLocaleString()

            };


            let savedMessages = [];


            try {

                savedMessages = JSON.parse(
                    localStorage.getItem("capitalEstateMessages")
                ) || [];

            } catch (error) {

                savedMessages = [];

            }


            savedMessages.push(contactData);


            try {

                localStorage.setItem(
                    "capitalEstateMessages",
                    JSON.stringify(savedMessages)
                );

            } catch (error) {

                showMessage(
                    statusMessage,
                    "Unable to save your message in this browser.",
                    false
                );

                return;

            }


            showMessage(
                statusMessage,
                "Thank you! Your message has been saved successfully.",
                true
            );


            contactForm.reset();

        });

    }


    // =========================================
    // 11. SMOOTH SCROLLING
    // =========================================

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;


            const target = document.querySelector(targetId);

            if (!target) return;


            event.preventDefault();


            target.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        });

    });


    // =========================================
    // 12. BACK TO TOP BUTTON
    // =========================================

    const backToTop = document.createElement("button");

    backToTop.className = "back-to-top";

    backToTop.innerHTML = "↑";

    backToTop.setAttribute("aria-label", "Back to top");


    Object.assign(backToTop.style, {

        position: "fixed",

        bottom: "25px",

        right: "25px",

        width: "45px",

        height: "45px",

        borderRadius: "50%",

        border: "none",

        background: "#267A45",

        color: "white",

        fontSize: "24px",

        cursor: "pointer",

        display: "none",

        alignItems: "center",

        justifyContent: "center",

        zIndex: "999"

    });


    document.body.appendChild(backToTop);


    window.addEventListener("scroll", () => {

        backToTop.style.display =
            window.scrollY > 400 ? "flex" : "none";

    });


    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });


    // =========================================
    // 13. CONTACT PHONE & EMAIL LINKS
    // =========================================

    document.querySelectorAll(".contact-info-card").forEach(card => {

        const text = card.textContent.toLowerCase();


        if (text.includes("call us")) {

            const phoneText = card.querySelector("p");

            if (phoneText && !phoneText.querySelector("a")) {

                const phoneNumber = phoneText.textContent.trim();

                const phoneLink = document.createElement("a");

                phoneLink.href = "tel:+923001234567";

                phoneLink.textContent = phoneNumber;

                phoneText.replaceChildren(phoneLink);

            }

        }


        if (text.includes("email us")) {

            const emailText = card.querySelector("p");

            if (emailText && !emailText.querySelector("a")) {

                const emailAddress = emailText.textContent.trim();

                const emailLink = document.createElement("a");

                emailLink.href = "mailto:info@capitalestate.com";

                emailLink.textContent = emailAddress;

                emailText.replaceChildren(emailLink);

            }

        }

    });


    // =========================================
    // 14. FINAL CONSOLE MESSAGE
    // =========================================

    console.log(
        "Capital Estate JavaScript loaded successfully."
    );

});