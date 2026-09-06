/* =========================================================
   LEXORA — APP.JS
   PART 1
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

// Mode buttons
const modeCards = document.querySelectorAll(".mode-card");

const instantMode = document.getElementById("instantMode");
const reviewMode = document.getElementById("reviewMode");


// Theme
const themeBtn = document.getElementById("themeBtn");


// Settings
const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");

const settingsPanel =
    document.getElementById("settingsPanel");

const settingsOverlay =
    document.getElementById("settingsOverlay");


// Instant Translate
const instantSource =
    document.getElementById("instantSource");

const instantLanguage =
    document.getElementById("instantLanguage");

const instantStyle =
    document.getElementById("instantStyle");

const instantResult =
    document.getElementById("instantResult");

const instantCharCount =
    document.getElementById("instantCharCount");

const instantResultCount =
    document.getElementById("instantResultCount");

const clearInstant =
    document.getElementById("clearInstant");

const copyInstant =
    document.getElementById("copyInstant");

const exportInstant =
    document.getElementById("exportInstant");

const instantTranslateBtn =
    document.getElementById("instantTranslateBtn");

const instantStatus =
    document.getElementById("instantStatus");


// Instant RAW images
const instantImages =
    document.getElementById("instantImages");

const instantBrowse =
    document.getElementById("instantBrowse");

const instantDropzone =
    document.getElementById("instantDropzone");

const instantImageList =
    document.getElementById("instantImageList");


// Full Review
const reviewImages =
    document.getElementById("reviewImages");

const reviewBrowse =
    document.getElementById("reviewBrowse");

const reviewDropzone =
    document.getElementById("reviewDropzone");

const reviewImageList =
    document.getElementById("reviewImageList");

const reviewSource =
    document.getElementById("reviewSource");

const reviewArabic =
    document.getElementById("reviewArabic");

const reviewSourceCount =
    document.getElementById("reviewSourceCount");

const reviewArabicCount =
    document.getElementById("reviewArabicCount");

const clearReviewSource =
    document.getElementById("clearReviewSource");

const clearReviewArabic =
    document.getElementById("clearReviewArabic");

const reviewChapterBtn =
    document.getElementById("reviewChapterBtn");

const reviewStatus =
    document.getElementById("reviewStatus");

const reviewResultSection =
    document.getElementById("reviewResultSection");

const reviewResult =
    document.getElementById("reviewResult");

const reviewResultCount =
    document.getElementById("reviewResultCount");

const copyReview =
    document.getElementById("copyReview");

const exportReview =
    document.getElementById("exportReview");


// Settings
const defaultStyle =
    document.getElementById("defaultStyle");

const defaultTone =
    document.getElementById("defaultTone");

const defaultNatural =
    document.getElementById("defaultNatural");


/* =========================================================
   STATE
   ========================================================= */

let instantImageFiles = [];

let reviewImageFiles = [];

let currentMode = "instant";


/* =========================================================
   MODE SWITCHING
   ========================================================= */

modeCards.forEach((card) => {

    card.addEventListener("click", () => {

        const mode = card.dataset.mode;

        if (!mode) return;

        currentMode = mode;


        modeCards.forEach((item) => {
            item.classList.remove("active");
        });

        card.classList.add("active");


        if (mode === "instant") {

            instantMode.classList.add("active");
            reviewMode.classList.remove("active");

        } else {

            instantMode.classList.remove("active");
            reviewMode.classList.add("active");

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});


/* =========================================================
   CHARACTER COUNTERS
   ========================================================= */

function updateInstantCount() {

    const length =
        instantSource.value.length;

    instantCharCount.textContent =
        `${length} characters`;
}


function updateReviewSourceCount() {

    const length =
        reviewSource.value.length;

    reviewSourceCount.textContent =
        `${length} characters`;
}


function updateReviewArabicCount() {

    const length =
        reviewArabic.value.length;

    reviewArabicCount.textContent =
        `${length} characters`;
}


function updateInstantResultCount() {

    const text =
        instantResult.innerText.trim();

    const length =
        text.length;

    instantResultCount.textContent =
        `${length} characters`;
}


function updateReviewResultCount() {

    const text =
        reviewResult.innerText.trim();

    const length =
        text.length;

    reviewResultCount.textContent =
        `${length} characters`;
}


instantSource.addEventListener(
    "input",
    updateInstantCount
);

reviewSource.addEventListener(
    "input",
    updateReviewSourceCount
);

reviewArabic.addEventListener(
    "input",
    updateReviewArabicCount
);


/* =========================================================
   CLEAR BUTTONS
   ========================================================= */

clearInstant.addEventListener("click", () => {

    instantSource.value = "";

    instantResult.innerHTML = `
        <span class="placeholder">
            Your Arabic translation will appear here...
        </span>
    `;

    updateInstantCount();
    updateInstantResultCount();

    instantStatus.textContent =
        "Ready";
});


clearReviewSource.addEventListener(
    "click",
    () => {

        reviewSource.value = "";

        updateReviewSourceCount();
    }
);


clearReviewArabic.addEventListener(
    "click",
    () => {

        reviewArabic.value = "";

        updateReviewArabicCount();
    }
);


/* =========================================================
   SETTINGS PANEL
   ========================================================= */

function openSettings() {

    settingsPanel.classList.add("active");

    settingsOverlay.classList.add("active");

    settingsPanel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeSettingsPanel() {

    settingsPanel.classList.remove("active");

    settingsOverlay.classList.remove("active");

    settingsPanel.setAttribute(
        "aria-hidden",
        "true"
    );
}


settingsBtn.addEventListener(
    "click",
    openSettings
);

closeSettings.addEventListener(
    "click",
    closeSettingsPanel
);

settingsOverlay.addEventListener(
    "click",
    closeSettingsPanel
);


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeSettingsPanel();
        }

    }
);


/* =========================================================
   THEME
   ========================================================= */

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );

        const isLight =
            document.body.classList.contains(
                "light"
            );

        localStorage.setItem(
            "lexora-theme",
            isLight
                ? "light"
                : "dark"
        );

        themeBtn.textContent =
            isLight
                ? "Dark"
                : "Theme";
    }
);


const savedTheme =
    localStorage.getItem(
        "lexora-theme"
    );


if (savedTheme === "light") {

    document.body.classList.add(
        "light"
    );

    themeBtn.textContent =
        "Dark";
}


/* =========================================================
   FILE HELPERS
   ========================================================= */

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );

    const size =
        bytes /
        Math.pow(
            1024,
            index
        );

    return (
        size.toFixed(
            index === 0 ? 0 : 1
        ) +
        " " +
        units[index]
    );
}


function createFileElement(
    file,
    index,
    removeCallback
) {

    const item =
        document.createElement("div");

    item.className =
        "image-item";


    const name =
        document.createElement("span");

    name.textContent =
        file.name;


    const size =
        document.createElement("small");

    size.textContent =
        ` ${formatFileSize(file.size)}`;


    const remove =
        document.createElement("button");

    remove.type =
        "button";

    remove.textContent =
        "×";

    remove.className =
        "text-btn";


    remove.addEventListener(
        "click",
        () => {

            removeCallback(index);
        }
    );


    item.appendChild(name);

    item.appendChild(size);

    item.appendChild(remove);


    return item;
}
/* =========================================================
   LEXORA — APP.JS
   PART 2
   ========================================================= */

/* FILE INPUTS */
instantBrowse.addEventListener("click", () => {
    instantImages.click();
});

reviewBrowse.addEventListener("click", () => {
    reviewImages.click();
});

/* ADD IMAGES */
function addInstantImages(files) {
    const newFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
    );

    instantImageFiles = [...instantImageFiles, ...newFiles];
    renderInstantImages();
}

function addReviewImages(files) {
    const newFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
    );

    reviewImageFiles = [...reviewImageFiles, ...newFiles];
    renderReviewImages();
}

/* RENDER IMAGE LISTS */
function renderInstantImages() {
    instantImageList.innerHTML = "";

    instantImageFiles.forEach((file, index) => {
        const item = createFileElement(
            file,
            index,
            removeInstantImage
        );

        instantImageList.appendChild(item);
    });
}

function renderReviewImages() {
    reviewImageList.innerHTML = "";

    reviewImageFiles.forEach((file, index) => {
        const item = createFileElement(
            file,
            index,
            removeReviewImage
        );

        reviewImageList.appendChild(item);
    });
}

/* REMOVE IMAGES */
function removeInstantImage(index) {
    instantImageFiles.splice(index, 1);
    renderInstantImages();
}

function removeReviewImage(index) {
    reviewImageFiles.splice(index, 1);
    renderReviewImages();
}

/* INPUT CHANGE EVENTS */
instantImages.addEventListener("change", () => {
    addInstantImages(instantImages.files);
    instantImages.value = "";
});

reviewImages.addEventListener("change", () => {
    addReviewImages(reviewImages.files);
    reviewImages.value = "";
});

/* DRAG & DROP */
function setupDropzone(dropzone, addFiles) {
    ["dragenter", "dragover"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            dropzone.classList.add("dragging");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            dropzone.classList.remove("dragging");
        });
    });

    dropzone.addEventListener("drop", (event) => {
        const files = event.dataTransfer.files;

        if (files && files.length > 0) {
            addFiles(files);
        }
    });
}

setupDropzone(
    instantDropzone,
    addInstantImages
);

setupDropzone(
    reviewDropzone,
    addReviewImages
);

/* =========================================================
   CLIPBOARD
   ========================================================= */

async function copyText(text) {
    if (!text || !text.trim()) {
        return false;
    }

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        let success = false;

        try {
            success = document.execCommand("copy");
        } catch (copyError) {
            success = false;
        }

        document.body.removeChild(textarea);

        return success;
    }
}

/* COPY INSTANT RESULT */
copyInstant.addEventListener("click", async () => {
    const text = instantResult.innerText.trim();

    if (!text) {
        instantStatus.textContent = "Nothing to copy";
        return;
    }

    const success = await copyText(text);

    instantStatus.textContent = success
        ? "Copied"
        : "Copy failed";

    setTimeout(() => {
        instantStatus.textContent = "Ready";
    }, 2000);
});

/* COPY REVIEW RESULT */
copyReview.addEventListener("click", async () => {
    const text = reviewResult.innerText.trim();

    if (!text) {
        reviewStatus.textContent = "Nothing to copy";
        return;
    }

    const success = await copyText(text);

    reviewStatus.textContent = success
        ? "Copied"
        : "Copy failed";

    setTimeout(() => {
        reviewStatus.textContent = "Ready";
    }, 2000);
});

/* =========================================================
   WORD EXPORT
   ========================================================= */

function exportAsWord(text, filename) {
    if (!text || !text.trim()) {
        return false;
    }

    const safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>LEXORA</title>
</head>
<body>
${safeText}
</body>
</html>
`;

    const blob = new Blob(
        [html],
        {
            type: "application/msword"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return true;
}

/* EXPORT INSTANT */
exportInstant.addEventListener("click", () => {
    const text = instantResult.innerText.trim();

    if (!text) {
        instantStatus.textContent = "Nothing to export";
        return;
    }

    exportAsWord(
        text,
        "LEXORA-Translation.doc"
    );

    instantStatus.textContent = "Word file exported";

    setTimeout(() => {
        instantStatus.textContent = "Ready";
    }, 2500);
});

/* EXPORT REVIEW */
exportReview.addEventListener("click", () => {
    const text = reviewResult.innerText.trim();

    if (!text) {
        reviewStatus.textContent = "Nothing to export";
        return;
    }

    exportAsWord(
        text,
        "LEXORA-Reviewed-Translation.doc"
    );

    reviewStatus.textContent = "Word file exported";

    setTimeout(() => {
        reviewStatus.textContent = "Ready";
    }, 2500);
});
/* =========================================================
   LEXORA — APP.JS
   PART 3
   TRANSLATION & REVIEW ENGINE
   ========================================================= */

/* INSTANT OPTIONS */
const instantContext = document.getElementById("instantContext");
const instantTone = document.getElementById("instantTone");
const instantAvoidLiteral =
    document.getElementById("instantAvoidLiteral");

/* REVIEW OPTIONS */
const reviewMeaning =
    document.getElementById("reviewMeaning");

const reviewContext =
    document.getElementById("reviewContext");

const reviewNatural =
    document.getElementById("reviewNatural");

const reviewTone =
    document.getElementById("reviewTone");

const reviewLiteral =
    document.getElementById("reviewLiteral");

const reviewNoInvent =
    document.getElementById("reviewNoInvent");


/* =========================================================
   STATUS HELPERS
   ========================================================= */

function setInstantStatus(message) {
    instantStatus.textContent = message;
}

function setReviewStatus(message) {
    reviewStatus.textContent = message;
}


/* =========================================================
   REAL AI ENGINE — OPENROUTER
   ========================================================= */

/* =========================================================
   LARGE RAW IMAGE PROCESSING
   Automatically prepares very tall manga pages
   before sending them to the Vision AI.
   ========================================================= */

const LEXORA_IMAGE_MAX_HEIGHT = 2200;
const LEXORA_IMAGE_OVERLAP = 180;
const LEXORA_IMAGE_MAX_WIDTH = 1400;
const LEXORA_IMAGE_QUALITY = 0.84;


/*
 * Load an image file safely.
 */
function loadImageFile(file) {

    return new Promise((resolve, reject) => {

        const objectURL =
            URL.createObjectURL(file);

        const image =
            new Image();

        image.onload = () => {

            URL.revokeObjectURL(objectURL);

            resolve(image);
        };

        image.onerror = () => {

            URL.revokeObjectURL(objectURL);

            reject(
                new Error(
                    `Could not process image: ${file.name}`
                )
            );
        };

        image.src = objectURL;
    });
}


/*
 * Convert canvas into a compressed image.
 */
function canvasToDataURL(canvas) {

    return canvas.toDataURL(
        "image/jpeg",
        LEXORA_IMAGE_QUALITY
    );
}


/*
 * Prepare one RAW image.
 *
 * Short images are compressed normally.
 * Very tall images are automatically split
 * into overlapping sections.
 */
async function prepareImageForAI(file) {

    const image =
        await loadImageFile(file);

    const originalWidth =
        image.naturalWidth;

    const originalHeight =
        image.naturalHeight;

    if (
        !originalWidth ||
        !originalHeight
    ) {
        throw new Error(
            `Invalid image dimensions: ${file.name}`
        );
    }


    /*
     * Never upscale the original image.
     */
    const outputWidth =
        Math.min(
            originalWidth,
            LEXORA_IMAGE_MAX_WIDTH
        );


    /*
     * Keep the original aspect ratio.
     */
    const scale =
        outputWidth /
        originalWidth;

    const scaledHeight =
        Math.round(
            originalHeight * scale
        );


    /*
     * Normal image:
     * compress it without splitting.
     */
    if (
        scaledHeight <=
        LEXORA_IMAGE_MAX_HEIGHT
    ) {

        const canvas =
            document.createElement("canvas");

        canvas.width =
            outputWidth;

        canvas.height =
            scaledHeight;

        const ctx =
            canvas.getContext("2d");

        ctx.imageSmoothingEnabled = true;

        ctx.imageSmoothingQuality =
            "high";

        ctx.drawImage(
            image,
            0,
            0,
            outputWidth,
            scaledHeight
        );

        return [
            canvasToDataURL(canvas)
        ];
    }


    /*
     * Very tall image:
     * split it vertically.
     */
    const sourceSectionHeight =
        Math.floor(
            LEXORA_IMAGE_MAX_HEIGHT /
            scale
        );

    const sourceOverlap =
        Math.floor(
            LEXORA_IMAGE_OVERLAP /
            scale
        );


    const parts = [];

    let sourceTop = 0;


    while (
        sourceTop <
        originalHeight
    ) {

        const remaining =
            originalHeight -
            sourceTop;

        const sourceHeight =
            Math.min(
                sourceSectionHeight,
                remaining
            );

        const renderedHeight =
            Math.round(
                sourceHeight *
                scale
            );


        const canvas =
            document.createElement("canvas");

        canvas.width =
            outputWidth;

        canvas.height =
            renderedHeight;


        const ctx =
            canvas.getContext("2d");

        ctx.imageSmoothingEnabled = true;

        ctx.imageSmoothingQuality =
            "high";


        ctx.drawImage(
            image,
            0,
            sourceTop,
            originalWidth,
            sourceHeight,
            0,
            0,
            outputWidth,
            renderedHeight
        );


        parts.push(
            canvasToDataURL(canvas)
        );


        /*
         * Stop when the bottom is reached.
         */
        if (
            sourceTop +
            sourceHeight >=
            originalHeight
        ) {
            break;
        }


        /*
         * Keep a small overlap between sections.
         */
        const nextTop =
            sourceTop +
            sourceHeight -
            sourceOverlap;


        /*
         * Safety guard.
         */
        if (
            nextTop <=
            sourceTop
        ) {
            break;
        }

        sourceTop =
            nextTop;
    }


    return parts;
}


/*
 * Prepare every selected RAW image automatically.
 *
 * Original file order is preserved.
 * If one image becomes multiple sections,
 * those sections remain together and ordered.
 */
async function imagesToDataURLs(files) {

    if (
        !files ||
        files.length === 0
    ) {
        return [];
    }


    const preparedImages = [];


    for (
        let index = 0;
        index < files.length;
        index++
    ) {

        const file =
            files[index];


        const parts =
            await prepareImageForAI(file);


        preparedImages.push(
            ...parts
        );
    }


    return preparedImages;
}

async function callLexoraAI(payload) {

    const response =
        await fetch(
            "/.netlify/functions/ai",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(payload)
            }
        );


    const rawResponse =
        await response.text();


    let data = null;


    try {
        data =
            JSON.parse(rawResponse);

    } catch (error) {

        throw new Error(
            `AI server returned an invalid response (HTTP ${response.status}).`
        );
    }


    if (!response.ok) {

        throw new Error(
            data?.error ||
            `AI server error (HTTP ${response.status}).`
        );
    }


    if (
        typeof data?.result !== "string" ||
        !data.result.trim()
    ) {

        throw new Error(
            "The AI returned an empty response."
        );
    }


    return data.result.trim();
    }


/* =========================================================
   INSTANT TRANSLATION
   ========================================================= */

async function translateInstant() {

    const sourceText =
        instantSource.value.trim();

    if (!sourceText) {
        setInstantStatus(
            "Enter the original text first."
        );

        instantSource.focus();
        return;
    }

    instantTranslateBtn.disabled = true;

    setInstantStatus(
        "Translating..."
    );

    instantResult.innerHTML = `
        <div class="result-message">
            <strong>LEXORA AI</strong>
            <p>Translating your text...</p>
        </div>
    `;

    updateInstantResultCount();

     try {

    const images =
        instantContext.checked
            ? await imagesToDataURLs(
                instantImageFiles
            )
            : [];

    const result =
        await callLexoraAI({

            mode: "instant",

            sourceText: sourceText,

            sourceLanguage:
                instantLanguage.value,

            style:
                instantStyle.value,

            images: images,

            options: {
                useImageContext:
                    instantContext.checked,

                preserveTone:
                    instantTone.checked,

                avoidLiteral:
                    instantAvoidLiteral.checked
            }

        });


        instantResult.textContent =
            result;

        updateInstantResultCount();

        setInstantStatus(
            "Translation complete"
        );

    } catch (error) {

        console.error(
            "LEXORA translation error:",
            error
        );

        instantResult.innerHTML = `
            <div class="result-message">
                <strong>LEXORA AI</strong>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;

        updateInstantResultCount();

        setInstantStatus(
            "Translation failed"
        );

    } finally {

        instantTranslateBtn.disabled = false;
    }
}


/* =========================================================
   FULL REVIEW
   ========================================================= */

async function reviewChapter() {

    const sourceText =
        reviewSource.value.trim();

    const arabicText =
        reviewArabic.value.trim();


    if (!sourceText) {

        setReviewStatus(
            "Enter the original text first."
        );

        reviewSource.focus();
        return;
    }


    if (!arabicText) {

        setReviewStatus(
            "Enter the existing Arabic translation."
        );

        reviewArabic.focus();
        return;
    }


    reviewChapterBtn.disabled = true;

    setReviewStatus(
        "Reviewing..."
    );


    reviewResultSection.classList.add(
        "active"
    );


    reviewResult.innerHTML = `
        <div class="result-message">
            <strong>LEXORA AI</strong>
            <p>Reviewing your translation...</p>
        </div>
    `;

    updateReviewResultCount();


    try {

    const images =
        reviewContext.checked
            ? await imagesToDataURLs(
                reviewImageFiles
            )
            : [];

    const result =
        await callLexoraAI({

            mode: "review",

            sourceText: sourceText,

            arabicText: arabicText,

            sourceLanguage:
                reviewLanguageValue(),

            images: images,

            options: {

                checkMeaning:
                    reviewMeaning.checked,

                useImageContext:
                    reviewContext.checked,

                makeNatural:
                    reviewNatural.checked,

                preserveTone:
                    reviewTone.checked,

                avoidLiteral:
                    reviewLiteral.checked,

                doNotInvent:
                    reviewNoInvent.checked
            }

        });


        reviewResult.textContent =
            result;

        updateReviewResultCount();

        setReviewStatus(
            "Review complete"
        );


    } catch (error) {

        console.error(
            "LEXORA review error:",
            error
        );

        reviewResult.innerHTML = `
            <div class="result-message">
                <strong>LEXORA AI</strong>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;

        updateReviewResultCount();

        setReviewStatus(
            "Review failed"
        );


    } finally {

        reviewChapterBtn.disabled = false;
    }
}


/* =========================================================
   HELPERS
   ========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


/*
 * The Full Review language selector may have
 * a different ID depending on the HTML version.
 *
 * Try the known possibilities safely.
 */

function reviewLanguageValue() {

    const element =
        document.getElementById(
            "reviewLanguage"
        );

    if (element) {
        return element.value;
    }

    return "auto";
}


/* =========================================================
   TRANSLATE BUTTON
   ========================================================= */

instantTranslateBtn.addEventListener(
    "click",
    translateInstant
);


/* =========================================================
   REVIEW BUTTON
   ========================================================= */

reviewChapterBtn.addEventListener(
    "click",
    reviewChapter
);

/* =========================================================
   SETTINGS
   ========================================================= */

function saveSettings() {

    const settings = {
        style: defaultStyle.value,
        tone: defaultTone.checked,
        natural: defaultNatural.checked
    };

    localStorage.setItem(
        "lexora-settings",
        JSON.stringify(settings)
    );
}


function loadSettings() {

    const saved =
        localStorage.getItem("lexora-settings");

    if (!saved) {
        return;
    }

    try {

        const settings = JSON.parse(saved);

        if (settings.style) {
            defaultStyle.value = settings.style;
            instantStyle.value = settings.style;
        }

        if (typeof settings.tone === "boolean") {
            defaultTone.checked = settings.tone;
        }

        if (typeof settings.natural === "boolean") {
            defaultNatural.checked = settings.natural;
        }

    } catch (error) {

        console.warn(
            "Could not load LEXORA settings."
        );
    }
}


/* SAVE SETTINGS WHEN CHANGED */

defaultStyle.addEventListener(
    "change",
    () => {

        instantStyle.value =
            defaultStyle.value;

        saveSettings();
    }
);

defaultTone.addEventListener(
    "change",
    () => {

        if (instantTone) {
            instantTone.checked =
                defaultTone.checked;
        }

        saveSettings();
    }
);

defaultNatural.addEventListener(
    "change",
    () => {

        if (instantAvoidLiteral) {
            instantAvoidLiteral.checked =
                defaultNatural.checked;
        }

        saveSettings();
    }
);


/* LOAD SETTINGS */

loadSettings();


/* =========================================================
   INITIAL UI STATE
   ========================================================= */

updateInstantCount();
updateReviewSourceCount();
updateReviewArabicCount();
updateInstantResultCount();
updateReviewResultCount();

renderInstantImages();
renderReviewImages();
