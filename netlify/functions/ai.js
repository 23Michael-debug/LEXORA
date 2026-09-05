/* =========================================================
   LEXORA — AI BACKEND
   OpenRouter
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

        const mode = body.mode || "instant";
        const sourceText = body.sourceText || "";
        const arabicText = body.arabicText || "";
        const sourceLanguage = body.sourceLanguage || "auto";
        const style = body.style || "natural";

        /* Basic validation */
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

        /* Check API key */
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "OpenRouter API key is not configured."
                })
            };
        }

        /* =====================================================
           SYSTEM INSTRUCTIONS
           ===================================================== */

        const systemPrompt = `
You are LEXORA, an AI-powered visual translation and review assistant
specialized in Korean, Chinese, English, and Japanese manga, manhwa,
and webtoons translated into Arabic.

Your highest priorities are:

1. Preserve the exact meaning of the original text.
2. Never invent information that does not exist in the original.
3. Never remove important meaning.
4. Avoid literal translation completely when natural Arabic expresses
   the same meaning better.
5. Make Arabic extremely natural, simple, clear, and fast to understand.
6. Preserve the character's tone, emotion, attitude, and level of speech.
7. Keep names, abilities, titles, places, and important terminology
   consistent.
8. Do not add explanations or commentary.
9. Return ONLY the final Arabic translation.
10. Preserve the original line and marker structure whenever markers
    are present.

LEXORA understands these markers:

"": Dialogue
(): Thought
:: Shout
//: Connected bubble
[]: Boxed text
OT: Background narration
ST: Side text
SFX: Sound effect
<>: System text

Treat these markers as meaningful metadata.
Do not remove, invent, or arbitrarily change them.

For SFX, choose a natural Arabic equivalent that fits the visual scene
and action instead of translating the sound mechanically.

For OT and ST, preserve their narrative/informational nature.

For system text, preserve the system-like tone.

Arabic style:
- Natural Modern Standard Arabic.
- Very simple and smooth.
- No unnecessary formal wording.
- No awkward literal expressions.
- No translator notes.
- No explanations.
`;

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

Source text:
${sourceText}

Return ONLY the Arabic translation.
`;
        }

        /* =====================================================
           FULL REVIEW
           ===================================================== */

        if (mode === "review") {

            userPrompt = `
Review the existing Arabic translation against the original text.

Source language:
${sourceLanguage}

Original text:
${sourceText}

Existing Arabic translation:
${arabicText}

Correct the Arabic translation wherever necessary.

Check carefully for:
- Wrong meaning.
- Missing meaning.
- Added meaning.
- Literal phrasing.
- Awkward Arabic.
- Incorrect tone.
- Incorrect terminology.
- Contextual mistakes.

Then rewrite it into the clearest and most natural Arabic possible.

Do not explain your corrections.

Return ONLY the complete corrected Arabic translation.
`;
        }

        /* =====================================================
           OPENROUTER REQUEST
           ===================================================== */

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://lexoratl.netlify.app",
                    "X-Title": "LEXORA"
                },

                body: JSON.stringify({

                    /*
                     * OpenRouter Free Models Router.
                     * It automatically selects a suitable free model.
                     */
                    model: "openrouter/free",

                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: userPrompt
                        }
                    ],

                    temperature: 0.2,

                    max_tokens: 8000
                })
            }
        );

        const data = await response.json();

        /* OpenRouter error */
        if (!response.ok) {

            console.error(
                "OpenRouter error:",
                data
            );

            return {
                statusCode: response.status,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error:
                        data?.error?.message ||
                        "OpenRouter request failed."
                })
            };
        }

        /* Extract AI response */
        const result =
            data?.choices?.[0]?.message?.content;

        if (!result) {

            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "The AI returned an empty response."
                })
            };
        }

        /* Success */
        return {
            statusCode: 200,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                success: true,
                result: result.trim(),
                model: data?.model || "openrouter/free"
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
