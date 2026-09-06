exports.handler = async function (event) {

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

        const body =
            JSON.parse(event.body || "{}");

        const {
            mode,
            sourceText,
            sourceLanguage,
            style,
            images,
            options
        } = body;


        if (!sourceText || !sourceText.trim()) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "Original text is empty."
                })
            };
        }


        const systemPrompt = `
You are LEXORA AI, a professional visual translator and reviewer for Korean, Chinese, English, and Japanese manga, manhwa, and webtoons.

Your highest priority is:

1. Preserve the exact meaning of the original.
2. Use the RAW images as visual context whenever provided.
3. Never invent information.
4. Never remove important information.
5. Never change numbers, quantities, names, relationships, ranks, titles, abilities, or other factual details.
6. Never guess a different number from the original.
7. Never replace a specific quantity with an invented quantity.
8. Preserve the speaker's personality, emotion, attitude, and level of politeness.
9. Produce natural Arabic that reads like professionally translated manga/manhwa.
10. Avoid literal translation completely unless the Literal style is explicitly selected.

IMPORTANT NUMBERS AND QUANTITIES:
- Numbers and quantities must be translated accurately.
- Multipliers must remain accurate.
- Expressions such as "ten times", "three times", "half", "double", "hundreds", etc. must never be changed into another quantity.
- If the source says ten times, the Arabic must say ten times.
- Never infer a different number from context.
- If the source contains an unusual or possibly mistyped number, preserve what the source actually means rather than inventing another number.

IMPORTANT CONTEXT:
The RAW image is evidence for visual context.
Use it to understand:
- who is speaking
- who is being addressed
- facial expressions
- actions
- objects
- scene context
- text placement
- whether text is dialogue, thought, narration, SFX, system text, etc.

Do not invent information merely because it appears visually plausible.

BUBBLE / TEXT MARKERS:
The original text may contain these markers:

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

Preserve the marker type and its intended meaning.
Do not randomly convert thoughts into dialogue.
Do not convert narration into dialogue.
Do not remove or invent markers.

For SFX:
Translate the meaning naturally when appropriate.
Do not force SFX into a normal spoken sentence.

For OT and ST:
Keep them as narration/side text rather than turning them into dialogue.

ARABIC STYLE:

Natural & Simple:
- Natural Arabic is mandatory.
- Make the sentence easy and smooth.
- Do NOT copy Korean/Chinese/Japanese sentence structure.
- Rebuild the Arabic sentence naturally when necessary.
- Remove unnecessary awkwardness caused by literal translation.
- Keep all important meaning.
- Do not add information that does not exist in the source.
- This is NOT a literal translation mode.

Maximum Simplification:
- Apply the same rules as Natural & Simple.
- Simplify as much as possible.
- Make every sentence quick and easy to understand.
- Remove unnecessary formal or complicated wording when it does not affect meaning.
- Keep the original meaning, tone, and important details.

Literal:
- Stay relatively close to the original wording and structure.
- Still produce grammatically correct Arabic.
- Never invent information.

VERY IMPORTANT:
Natural Arabic does not mean changing the meaning.

For example:
If the original means:
"He eats ten times as much as an ordinary person."

Do NOT translate it as:
"He eats enough for seventeen people."

The number and meaning must remain accurate.

Another example:
If context clearly shows someone is surprised that a person ate a huge amount alone, preserve that meaning naturally in Arabic rather than translating each word mechanically.

DO NOT:
- explain your translation
- add notes
- add commentary
- add translator comments
- add alternative translations
- add quotation marks that were not requested
- add information from your own knowledge
- invent names or numbers
- summarize instead of translating

Return ONLY the finished Arabic translation/review.
`;


        let userPrompt = "";


        if (mode === "instant") {

            userPrompt = `
Translate the following source text into Arabic.

Source language:
${sourceLanguage || "Auto Detect"}

Requested style:
${style || "Natural & Simple"}

Options:
- Use image context: ${options?.useImageContext ? "Yes" : "No"}
- Preserve character tone: ${options?.preserveTone ? "Yes" : "No"}
- Avoid literal translation: ${options?.avoidLiteral ? "Yes" : "No"}

SOURCE TEXT:
${sourceText}

Translate it now.
Return ONLY the Arabic result.
`;

        } else {

            const existingArabic =
                body.existingArabic || "";

            userPrompt = `
Review and correct the existing Arabic translation using the original source text and RAW images.

Source language:
${sourceLanguage || "Auto Detect"}

Review priorities:
- Check meaning against the original.
- Use RAW visual context.
- Make Arabic natural and simple.
- Preserve character tone.
- Avoid literal phrasing.
- Do not invent meaning.
- Do not delete important meaning.
- Check names, numbers, quantities, titles, relationships, and context carefully.

SOURCE TEXT:
${sourceText}

EXISTING ARABIC TRANSLATION:
${existingArabic}

Correct the Arabic translation.

Do not explain the corrections.
Do not add comments.
Return ONLY the corrected Arabic translation.
`;
        }


        const userContent = [
            {
                type: "text",
                text: userPrompt
            }
        ];


        if (Array.isArray(images)) {

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
        }


        const apiKey =
            process.env.OPENROUTER_API_KEY;


        if (!apiKey) {
            throw new Error(
                "OPENROUTER_API_KEY is not configured on Netlify."
            );
        }


        const response =
            await fetch(
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
                        model: "openrouter/free",

                        messages: [
                            {
                                role: "system",
                                content: systemPrompt
                            },
                            {
                                role: "user",
                                content: userContent
                            }
                        ],

                        temperature: 0.2,

                        max_tokens: 8000
                    })
                }
            );


        /*
         * Read the response safely.
         * This lets LEXORA show the actual API error
         * instead of the vague "Invalid response".
         */
        const rawResponse =
            await response.text();


        let data = null;

        try {
            data =
                JSON.parse(rawResponse);
        } catch (parseError) {

            return {
                statusCode: 502,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    error:
                        `OpenRouter returned an invalid response (HTTP ${response.status}).`
                })
            };
        }


        if (!response.ok) {

            const apiError =
                data?.error?.message ||
                data?.error?.code ||
                `OpenRouter request failed with HTTP ${response.status}.`;

            return {
                statusCode: response.status,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    error: apiError
                })
            };
        }


        const result =
            data?.choices?.[0]?.message?.content;


        if (
            typeof result !== "string" ||
            !result.trim()
        ) {

            return {
                statusCode: 502,

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


        return {
            statusCode: 200,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                result: result.trim(),
                model:
                    data?.model || "unknown"
            })
        };


    } catch (error) {

        console.error(
            "LEXORA AI ERROR:",
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
                    "Unknown server error."
            })
        };
    }
};
