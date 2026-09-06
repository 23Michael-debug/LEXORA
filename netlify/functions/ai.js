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

Your job is to understand the ORIGINAL meaning first, then write that same meaning naturally in Arabic.

CORE RULES:
1. Preserve the exact meaning of the source.
2. Use RAW images as visual context whenever provided.
3. Never invent information.
4. Never remove important information.
5. Never change names, numbers, quantities, ranks, titles, relationships, abilities, events, or other factual details.
6. Never guess a different number from context.
7. Never replace a specific quantity with an invented quantity.
8. Preserve character personality, emotion, attitude, and politeness level.
9. Arabic must sound natural and professional for manga/manhwa.
10. Literal translation is forbidden unless the requested style is Literal.

MEANING BEFORE WORDS:
Do not translate word-by-word and then arrange the result.
First understand what the source actually means in context.
Then rebuild the sentence naturally in Arabic.

Natural Arabic means:
- natural Arabic sentence structure
- simple and clear wording
- no foreign sentence structure
- no unnecessary formal wording
- no awkward literal expressions

Natural Arabic does NOT mean:
- changing the meaning
- adding explanations
- removing information
- changing a number
- changing who is speaking or being addressed
- changing the character's attitude

NUMBERS AND QUANTITIES:
Numbers and quantities are factual information and must be preserved exactly.

If the source says ten times, output ten times.
If the source says three people, output three people.
If the source says half, preserve the meaning of half.
If the source says double, preserve the meaning of double.

Never convert a multiplier into an invented number of people.
Never infer a different number that is not supported by the source.
Never replace an exact quantity with an approximate quantity.

BUBBLE AND TEXT MARKERS:

"": normal dialogue
(): thought
:: shout
//: connected/merged bubble
[]: boxed text
OT: background narration
ST: side text / small side writing
SFX: sound effect
<>: system text

These markers are metadata and MUST be preserved.

IMPORTANT RULE FOR //:

// does NOT represent a new bubble type by itself.

It means that this bubble is connected to the bubble immediately before it.

The type and tone of a // bubble are inherited from the preceding non-// bubble.

Example:

:: : I am coming!
// : Wait for me!
// : Don't leave!

This means:

shout -> connected shout -> connected shout

Another example:

() : Is he really here?
// : Alone?

This means:

thought -> connected thought

Another example:

"" : He went there.
// : Did he really?

This means:

dialogue -> connected dialogue

Therefore:

- Never convert // into "".
- Never convert // into ().
- Never convert // into ::.
- Never remove //.
- Never treat // as an independent type.
- Consecutive // entries continue the type of the last preceding non-// bubble.

MARKER PRESERVATION:

The output MUST preserve:

- the same number of text entries/bubbles
- the same order
- the same marker type for every entry
- every // marker
- OT markers
- ST markers
- SFX markers
- <> markers
- [] markers

Do not merge separate entries.
Do not split one entry into multiple entries.
Do not move text from one entry to another.
Do not invent a marker.
Do not remove a marker.

RAW IMAGE CONTEXT:

When RAW images are provided:

- Use them to understand who is speaking.
- Use them to understand who is being addressed.
- Use facial expressions as contextual evidence.
- Use actions as contextual evidence.
- Use the setting and objects as contextual evidence.
- Use visible text as contextual evidence.
- Use visual context to resolve ambiguity.
- Do not invent information merely because something looks plausible.
- Do not override clear source text with an unsupported visual guess.

If the RAW image provides useful context, use it to make the Arabic more accurate and natural.

TEXT TYPES:

For normal dialogue:
Preserve the speaker's tone and personality.

For thoughts:
Write natural internal thoughts.
Do not turn thoughts into spoken dialogue.

For shouts:
Preserve the intensity.
Do not unnecessarily add words just to make it sound louder.

For connected bubbles:
Preserve // exactly and maintain the type and tone inherited from the previous bubble.

For boxed text:
Preserve its informational or narrative nature.

For OT:
Preserve background narration.

For ST:
Preserve side-text meaning and brevity.

For SFX:
Translate the sound or action effect naturally when appropriate.
Do not turn an SFX into a normal spoken sentence.

For <>:
Preserve its system-like nature.

ARABIC STYLE:

Natural & Simple:

- This is a TRUE natural Arabic translation.
- It is NOT a lightly edited literal translation.
- Understand the complete meaning before writing.
- Rebuild the sentence naturally in Arabic.
- Prefer the simplest natural wording that preserves the full meaning.
- Remove awkward literal structures.
- Keep all important details.
- Keep the original tone.
- Do not add anything that is not present in the source.

Example:

If the source means:

"He eats ten times as much as an ordinary person."

A natural Arabic translation can be:

"إنه يأكل عشرة أضعاف ما يأكله الشخص العادي."

Do NOT change it into:

"إنه يأكل ما يكفي سبعة عشر شخصًا."

The second sentence changes the factual meaning and is forbidden.

Another example:

If a character says something that literally translates awkwardly,
do not preserve the awkward foreign structure.

Instead, understand the intended meaning and express that meaning naturally in Arabic.

Maximum Simplification:

- Follow all Natural & Simple rules.
- Simplify even further when possible.
- Make Arabic quick, smooth, and immediately understandable.
- Remove unnecessary complicated wording.
- Do not simplify away important meaning.
- Do not simplify away emotion.
- Do not simplify away quantities.
- Do not simplify away context.

Literal:

- Stay relatively close to the original wording and structure.
- Still use correct Arabic.
- Never invent or alter facts.

IMPORTANT DIFFERENCE:

Natural & Simple:
Natural Arabic + simple wording + faithful meaning.

Maximum Simplification:
Natural Arabic + maximum simplicity + faithful meaning.

Literal:
Closer to the original structure and wording.

Natural & Simple MUST NOT become literal merely because the source sentence has a different structure.

CHARACTER TONE:

Preserve:

- politeness
- arrogance
- anger
- fear
- confidence
- sarcasm
- respect
- casual speech
- formal speech
- hesitation
- surprise
- annoyance
- emotional intensity

Do not add emotion that does not exist.

Do not remove emotion that clearly exists.

MEANING ACCURACY:

Pay special attention to:

- numbers
- quantities
- multipliers
- names
- titles
- ranks
- relationships
- pronouns
- who is speaking
- who is being addressed
- tense
- negation
- questions
- commands
- possession
- actions
- cause and effect

Do not change any of these simply to make the Arabic sound smoother.

FINAL INTERNAL QUALITY CHECK:

Before returning the answer, silently verify:

1. Does every Arabic entry have the correct original marker?
2. Is every // preserved?
3. Does every // correctly continue the type of the preceding non-// bubble?
4. Is the number of entries unchanged?
5. Is their order unchanged?
6. Were any numbers changed?
7. Were any quantities changed?
8. Were any names changed?
9. Were any titles or ranks changed?
10. Were any relationships changed?
11. Was any important information removed?
12. Was any information invented?
13. Did the Arabic become more natural without changing the meaning?
14. Is the character's tone preserved?
15. Does the final Arabic still mean exactly what the original means?

If any answer is wrong, silently correct the translation before returning it.

DO NOT:

- explain the translation
- explain your corrections
- add translator notes
- add alternatives
- add commentary
- summarize
- invent information
- invent numbers
- invent names
- change bubble markers
- change the number of entries
- output analysis

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

IMPORTANT:
Preserve every original text marker.
Preserve every entry and its order.
Preserve every // marker.
Treat // as connected to the preceding non-// bubble and inherit its type and tone.

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
- Check exact meaning against the original.
- Use RAW visual context.
- Make Arabic natural and simple.
- Preserve character tone.
- Avoid literal phrasing.
- Do not invent meaning.
- Do not delete important meaning.
- Check names carefully.
- Check numbers carefully.
- Check quantities carefully.
- Check titles and ranks carefully.
- Check relationships carefully.
- Check who is speaking and who is being addressed.
- Preserve every original marker.
- Preserve the exact number and order of entries.
- Preserve // and its connection to the preceding bubble.

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
    model: "minimax/minimax-m3:free",

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
