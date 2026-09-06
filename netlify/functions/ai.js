/* =========================================================
   LEXORA — AI BACKEND
   OpenRouter + Vision
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

        /* =====================================================
           READ REQUEST
           ===================================================== */

        const body =
            JSON.parse(event.body || "{}");


        const mode =
            body.mode || "instant";

        const sourceText =
            body.sourceText || "";

        const arabicText =
            body.arabicText || "";

        const sourceLanguage =
            body.sourceLanguage || "auto";

        const style =
            body.style || "natural";

        const images =
            Array.isArray(body.images)
                ? body.images
                : [];

        const options =
            body.options || {};


        /* =====================================================
           BASIC VALIDATION
           ===================================================== */

        if (!sourceText.trim()) {

            return {
                statusCode: 400,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    error:
                        "Original text is required."
                })
            };
        }


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
                    error:
                        "Existing Arabic translation is required."
                })
            };
        }


        /* =====================================================
           API KEY
           ===================================================== */

        const apiKey =
            process.env.OPENROUTER_API_KEY;


        if (!apiKey) {

            return {
                statusCode: 500,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    error:
                        "OpenRouter API key is not configured."
                })
            };
        }


        /* =====================================================
           SYSTEM PROMPT
           ===================================================== */

        const systemPrompt = `
You are LEXORA, an AI-powered visual translation and
translation-review assistant specialized in Korean, Chinese,
English, and Japanese manga, manhwa, and webtoons translated
into Arabic.

Your job is NOT to translate mechanically.

Your highest priorities are:

1. Preserve the exact meaning of the original.
2. Never invent information.
3. Never remove important meaning.
4. Use the RAW image as visual context whenever an image is provided.
5. Understand the scene, characters, expressions, actions, objects,
   speech bubbles, text placement, and visual context.
6. Use the original source text as the primary textual source.
7. Use the RAW image to verify and clarify the meaning of the text.
8. Never replace the original text with guesses based only on the image.
9. Avoid literal translation completely when natural Arabic expresses
   the same meaning better.
10. Make Arabic extremely natural, simple, clear, and fast to understand.
11. Preserve the character's tone, emotion, attitude, personality,
    and level of speech.
12. Keep names, abilities, titles, places, organizations, and important
    terminology consistent.
13. Do not add explanations or translator notes.
14. Return ONLY the final Arabic translation.
15. Preserve the original line order.
16. Preserve the marker/type structure whenever markers are present.

LEXORA MARKERS:

"": Dialogue
(): Thought
:: Shout
//: Connected bubble
[]: Boxed text
OT: Background narration
ST: Side text
SFX: Sound effect
<>: System text

These markers are meaningful metadata.

Never remove a marker.
Never invent a marker.
Never arbitrarily change a marker.

For dialogue:
Preserve the speaker's personality and tone.

For thoughts:
Make them sound like natural internal thoughts.

For shouts:
Use strong Arabic wording appropriate to the emotional intensity.

For connected bubbles:
Preserve the natural flow between connected speech bubbles.

For boxed text:
Preserve its informational or special presentation.

For OT:
Preserve its narration-like nature.

For ST:
Preserve its side-text or contextual nature.

For SFX:
Do not translate mechanically.
Choose a natural Arabic sound/action expression that fits the
visible scene.

For system text:
Preserve the system-like tone and terminology.

ARABIC STYLE:

- Natural Modern Standard Arabic.
- Extremely smooth and easy to read.
- Very simple wording.
- Fast comprehension.
- No unnecessary formality.
- No awkward literal expressions.
- No English expressions unless they are intentionally part
  of the source.
- No translator notes.
- No explanations.

When several Arabic phrasings are possible, choose the one that
sounds most natural to an Arabic manga/manhwa reader while
preserving the exact original meaning.

IMPORTANT:

The RAW image is context, not permission to invent dialogue.

If something is not clearly supported by the original text or
visual context, do not invent it.
`;


        /* =====================================================
           USER PROMPT
           ===================================================== */

        let userPrompt = "";


        /* =====================================================
           INSTANT TRANSLATION
           ===================================================== */

        if (mode === "instant") {

            userPrompt = `
Translate the following source text into natural Arabic.

Source language:
${sourceLanguage}

Requested style:
${style}

Visual context:
${images.length > 0
    ? "RAW manga/manhwa images are attached. Inspect them carefully."
    : "No RAW image was provided."
}

Original source text:
${sourceText}

Options:

Use image context:
${options.useImageContext ? "YES" : "NO"}

Preserve character tone:
${options.preserveTone ? "YES" : "NO"}

Avoid literal translation:
${options.avoidLiteral ? "YES" : "NO"}

Return ONLY the final Arabic translation.
`;
        }


        /* =====================================================
           FULL REVIEW
           ===================================================== */

        if (mode === "review") {

            userPrompt = `
Review the existing Arabic translation against the original text
and the RAW manga/manhwa images.

Source language:
${sourceLanguage}

RAW visual context:
${images.length > 0
    ? "RAW images are attached. Inspect them carefully before correcting the translation."
    : "No RAW images were provided."}

Original source text:
${sourceText}

Existing Arabic translation:
${arabicText}

Review priorities:

Check meaning:
${options.checkMeaning ? "YES" : "NO"}

Use RAW visual context:
${options.useImageContext ? "YES" : "NO"}

Make Arabic natural and simple:
${options.makeNatural ? "YES" : "NO"}

Preserve character tone:
${options.preserveTone ? "YES" : "NO"}

Avoid literal phrasing:
${options.avoidLiteral ? "YES" : "NO"}

Do not invent meaning:
${options.doNotInvent ? "YES" : "NO"}

Carefully check for:

- Wrong meaning.
- Missing meaning.
- Added meaning.
- Literal phrasing.
- Awkward Arabic.
- Incorrect tone.
- Incorrect terminology.
- Contextual mistakes.
- Misunderstanding caused by the visual scene.
- Incorrect interpretation of speech/thought/narration/SFX.
- Incorrect handling of markers.

Then rewrite the COMPLETE Arabic translation.

Do not explain your corrections.

Return ONLY the complete corrected Arabic translation.
`;
        }


        /* =====================================================
           BUILD MULTIMODAL MESSAGE
           ===================================================== */

        const userContent = [];


        userContent.push({
            type: "text",
            text: userPrompt
        });


        /*
         * Add RAW images after the textual instructions.
         *
         * The frontend already converts local images into
         * data URLs such as:
         *
         * data:image/jpeg;base64,...
         */

        for (const image of images) {

            if (
                typeof image !== "string" ||
                !image.startsWith("data:image/")
            ) {
                continue;
            }

            userContent.push({
                type: "image_url",

                image_url: {
                    url: image
                }
            });
        }


        /* =====================================================
           OPENROUTER REQUEST
           ===================================================== */

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${apiKey}`,

                    "Content-Type":
                        "application/json",

                    "HTTP-Referer":
                        "https://lexoratl.netlify.app",

                    "X-Title":
                        "LEXORA"
                },

                body: JSON.stringify({

                    /*
                     * OpenRouter Free Models Router.
                     *
                     * When images are included, OpenRouter
                     * automatically filters for models capable
                     * of image understanding.
                     */
                    model:
                        "openrouter/free",

                    messages: [

                        {
                            role: "system",

                            content:
                                systemPrompt
                        },

                        {
                            role: "user",

                            content:
                                userContent
                        }

                    ],

                    temperature:
                        0.2,

                    max_tokens:
                        8000
                })
            }
        );


        /* =====================================================
           READ RESPONSE
           ===================================================== */

        const data =
            await response.json();


        /* =====================================================
           OPENROUTER ERROR
           ===================================================== */

        if (!response.ok) {

            console.error(
                "OpenRouter error:",
                data
            );


            return {
                statusCode:
                    response.status,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    error:
                        data?.error?.message ||
                        "OpenRouter request failed."

                })
            };
        }


        /* =====================================================
           EXTRACT RESULT
           ===================================================== */

        const result =
            data?.choices?.[0]?.message?.content;


        if (!result) {

            return {
                statusCode: 500,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    error:
                        "The AI returned an empty response."
                })
            };
        }


        /* =====================================================
           SUCCESS
           ===================================================== */

        return {

            statusCode: 200,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                success: true,

                result:
                    result.trim(),

                model:
                    data?.model ||
                    "openrouter/free"

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
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                error:
                    error?.message ||
                    "Internal server error."

            })
        };
    }
};
