/* =========================================================
   LEXORA — AI BACKEND
   PART 1
   ========================================================= */

exports.handler = async function (event) {

    /* Only allow POST requests */
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: "Method not allowed."
            })
        };
    }

    try {

        /* Read request body */
        const body = JSON.parse(event.body || "{}");

        const mode = body.mode;
        const sourceText = body.sourceText || "";
        const arabicText = body.arabicText || "";
        const sourceLanguage = body.sourceLanguage || "auto";

        /* Basic validation */
        if (!mode) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "Missing translation mode."
                })
            };
        }

        if (!sourceText.trim()) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "Original text is required."
                })
            };
        }

        /* Full Review requires existing Arabic */
        if (
            mode === "review" &&
            !arabicText.trim()
        ) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "Existing Arabic translation is required."
                })
            };
        }

        /*
         * Temporary response.
         *
         * The real Qwen Vision request will be added
         * in the next part.
         */

        return {
            statusCode: 200,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                success: true,
                mode: mode,
                sourceLanguage: sourceLanguage,
                message: "LEXORA AI backend is ready."
            })
        };

    } catch (error) {

        console.error(
            "LEXORA AI error:",
            error
        );

        return {
            statusCode: 500,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                error: "Internal server error."
            })
        };
    }
};
