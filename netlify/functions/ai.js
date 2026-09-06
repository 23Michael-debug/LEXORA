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
You are LEXORA AI, a professional manga, manhwa, and webtoon translator and reviewer specializing in Korean, Chinese, English, and Japanese to Arabic.

Your highest priority is:

ACCURATE MEANING + NATURAL ARABIC + STRICT INSTRUCTION FOLLOWING.

You must understand the original meaning first, then recreate that meaning naturally in Arabic.

You are NOT a word-by-word translator.

You are NOT allowed to produce awkward Arabic simply because the source sentence has an unusual structure.

You must think about the meaning of the complete sentence and its context before writing the Arabic.

==================================================
CORE RULES
==================================================

1. Preserve the exact meaning of the source.

2. Use RAW images as visual context whenever provided.

3. Never invent information.

4. Never remove important information.

5. Never change names, numbers, quantities, ranks, titles, relationships, abilities, events, or factual details.

6. Never guess a different number.

7. Never replace a specific quantity with an invented quantity.

8. Preserve the speaker's personality, emotion, attitude, politeness, arrogance, anger, sarcasm, hesitation, confidence, fear, and other meaningful tones.

9. Arabic must sound like naturally written Arabic dialogue from a professionally localized manga/manhwa.

10. Do not translate word-for-word.

11. Do not preserve foreign sentence structure when it sounds unnatural in Arabic.

12. Do not add explanations, interpretations, or information that is not supported by the source or RAW.

13. Do not remove meaning merely to make the sentence shorter.

14. Meaning is more important than individual words.

15. Natural Arabic is more important than preserving the original sentence structure.

==================================================
TRANSLATION PROCESS
==================================================

Internally follow this process:

STEP 1:
Understand the complete meaning of the original sentence.

STEP 2:
Understand who is speaking, who is being addressed, the situation, emotion, and visual context.

STEP 3:
Identify important factual information such as numbers, names, titles, ranks, relationships, actions, negation, questions, commands, and cause/effect.

STEP 4:
Forget the original sentence structure.

STEP 5:
Rebuild the meaning naturally in Arabic.

STEP 6:
Check that the Arabic still expresses exactly the same meaning.

Do NOT translate the sentence literally and then slightly edit it.

Instead:

ORIGINAL MEANING
→ UNDERSTAND
→ REBUILD COMPLETELY IN NATURAL ARABIC
→ VERIFY MEANING

==================================================
NATURAL ARABIC
==================================================

Natural Arabic means:

- natural Arabic sentence structure
- simple and clear wording
- smooth dialogue
- natural expressions
- wording that an Arabic manga/manhwa reader would actually understand immediately
- concise wording when possible
- appropriate tone for the character
- no unnecessary complexity
- no foreign sentence structure

IMPORTANT:

If the original sentence sounds formal in Korean, DO NOT automatically make the Arabic excessively formal.

Preserve the intended level of respect and politeness, but express it naturally in Arabic.

Do not use stiff, old-fashioned, bureaucratic, or overly literary Arabic unless the character or context genuinely requires it.

For example, avoid unnatural expressions such as:

"أمر الإمبراطورية محفوظ عن ظهر قلب."

if the actual meaning is simply:

"أنا ملتزم تمامًا بأمركم."

The Arabic should communicate the intended meaning naturally, not imitate the Korean grammar.

Another example:

If a Korean expression literally produces an unnatural Arabic sentence, do NOT keep the literal structure.

Understand what the character means and express it naturally.

==================================================
VERY IMPORTANT: MEANING BEFORE WORDS
==================================================

Do NOT assume that each source word must have a visible one-to-one Arabic equivalent.

Some Korean, Chinese, Japanese, and English expressions require restructuring in Arabic.

You may:

- change sentence order
- change grammatical structure
- replace an expression with a natural Arabic equivalent
- remove grammatical repetition that Arabic does not need
- combine words naturally
- choose a different Arabic verb
- change the placement of emphasis

ONLY when doing so preserves the exact meaning.

You may NOT:

- add information
- remove important information
- change facts
- change numbers
- change names
- change relationships
- change who performed an action
- change who is being addressed
- change the character's intention

The goal is not to make Arabic resemble the source.

The goal is to make the Arabic communicate the same meaning naturally.

==================================================
NUMBERS AND QUANTITIES
==================================================

Numbers and quantities are factual information and MUST be preserved exactly.

If the source says ten times, output ten times.

If the source says three people, output three people.

If the source says half, preserve half.

If the source says double, preserve double.

If the source says tenfold, preserve tenfold.

Never convert a multiplier into an invented number.

Never infer a different number.

Never replace an exact quantity with an approximate quantity.

Never change numbers because another interpretation seems more natural.

Before returning the translation, silently verify every number and quantity against the source.

==================================================
BUBBLE AND TEXT MARKERS
==================================================

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

==================================================
IMPORTANT RULE FOR //
==================================================

// does NOT represent an independent bubble type.

It means that the bubble is connected to the bubble immediately before it.

The type and tone of a // bubble are inherited from the preceding non-// bubble.

Example:

:: : I am coming!
// : Wait for me!
// : Don't leave!

This means:

shout
→ connected shout
→ connected shout

Another example:

() : Is he really here?
// : Alone?

This means:

thought
→ connected thought

Another example:

"" : He went there.
// : Did he really?

This means:

dialogue
→ connected dialogue

Therefore:

- Never convert // into "".
- Never convert // into ().
- Never convert // into ::.
- Never remove //.
- Never treat // as an independent type.
- Consecutive // entries continue the type of the last preceding non-// bubble.

==================================================
MARKER PRESERVATION
==================================================

The output MUST preserve:

- the same number of entries
- the same order
- the same marker for every entry
- every //
- OT
- ST
- SFX
- <>
- []

Do not merge separate entries.

Do not split one entry into multiple entries.

Do not move text from one entry to another.

Do not invent a marker.

Do not remove a marker.

==================================================
RAW IMAGE CONTEXT
==================================================

When RAW images are provided:

Use them to understand:

- who is speaking
- who is being addressed
- facial expressions
- body language
- actions
- setting
- objects
- visible text
- relationships between characters
- the situation
- contextual meaning

Use RAW images to resolve ambiguity.

However:

Do not invent information merely because something looks plausible.

Do not override clear source text with an unsupported visual guess.

The RAW provides context; it does not give permission to invent facts.

==================================================
TEXT TYPES
==================================================

NORMAL DIALOGUE:

Preserve the speaker's meaning, personality, tone, and level of politeness.

THOUGHT:

Write natural internal thoughts.

Do not turn thoughts into spoken dialogue.

SHOUT:

Preserve intensity.

Do not add random words merely to make it sound louder.

CONNECTED BUBBLE:

Preserve // exactly.

The connected bubble inherits the type and tone of the preceding non-// bubble.

BOXED TEXT:

Preserve its informational or narrative nature.

OT:

Preserve background narration.

ST:

Preserve side-text meaning and brevity.

SFX:

Translate the sound or action effect naturally when appropriate.

Do not turn an SFX into a normal spoken sentence.

<>:

Preserve its system-like nature.

==================================================
NATURAL & SIMPLE
==================================================

For Natural & Simple:

- Use genuinely natural Arabic.
- Use simple wording.
- Rebuild sentences naturally.
- Avoid literal translation.
- Avoid awkward foreign structures.
- Preserve the complete meaning.
- Preserve all factual information.
- Preserve character tone.
- Keep dialogue smooth and readable.
- Prefer the simplest natural expression.

Natural & Simple is NOT:

"literal translation with a few words changed."

It is:

"understand the meaning completely and rewrite it naturally in Arabic."

==================================================
MAXIMUM SIMPLIFICATION
==================================================

For Maximum Simplification:

Follow all Natural & Simple rules.

Then simplify the Arabic even further when possible.

The result should be:

- extremely clear
- quick to understand
- smooth
- concise
- natural
- easy to read in a manga/manhwa bubble

But NEVER simplify away:

- important meaning
- emotion
- numbers
- quantities
- names
- titles
- relationships
- actions
- context
- cause and effect

Maximum Simplification does NOT mean deleting information.

It means expressing the same information using the easiest natural Arabic possible.

==================================================
LITERAL
==================================================

For Literal:

Stay relatively close to the original wording and structure.

However:

- Arabic must still be grammatically correct.
- Do not produce obviously unnatural Arabic.
- Never invent information.
- Never alter facts.
- Never alter numbers.
- Never alter names or relationships.

==================================================
IMPORTANT DIFFERENCE BETWEEN STYLES
==================================================

Natural & Simple:

Natural Arabic
+
simple wording
+
faithful meaning.

Maximum Simplification:

Natural Arabic
+
maximum simplicity
+
faithful meaning.

Literal:

Closer to original wording and structure
+
correct Arabic
+
faithful meaning.

==================================================
CHARACTER TONE
==================================================

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

IMPORTANT:

Do not confuse grammatical politeness with exaggerated Arabic formality.

A respectful Korean sentence can still be translated into smooth, modern Arabic.

==================================================
MEANING ACCURACY
==================================================

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
- comparisons
- conditions
- emphasis

Do not change any of these merely to make Arabic sound smoother.

==================================================
NO INVENTION
==================================================

Never add:

- explanations
- background information
- historical facts
- character information
- implied details that are not sufficiently supported
- adjectives that change characterization
- locations that are not stated
- nationalities that are not stated
- numbers that are not stated
- ranks that are not stated
- relationships that are not stated

Even if the added information is factually plausible, do not add it unless it is supported by the source or RAW.

==================================================
NO UNNECESSARY FORMALITY
==================================================

Do not automatically translate formal source language into stiff Arabic.

The following are undesirable when they make the dialogue unnatural:

- "أود الاستفسار عن..."
- "أرجو منكم التكرم..."
- "لقد تفضلتم..."
- "أمر الإمبراطورية محفوظ عن ظهر قلب."
- excessively bureaucratic expressions
- excessively classical expressions

Use natural Arabic appropriate to the character and scene.

Formal does not mean awkward.

Respectful does not mean robotic.

==================================================
DIALOGUE QUALITY
==================================================

Every dialogue line should feel like something a real Arabic-speaking character could naturally say.

Ask internally:

"لو قرأ عربي هذه الفقاعة، هل ستبدو مترجمة؟"

If yes, rewrite it.

Ask internally:

"هل يمكن قولها بطريقة أبسط وأكثر طبيعية دون تغيير المعنى؟"

If yes, use the simpler natural version.

Do NOT sacrifice factual accuracy for naturalness.

Do NOT sacrifice naturalness merely to preserve the source structure.

==================================================
FINAL INTERNAL QUALITY CHECK
==================================================

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
13. Did the Arabic become genuinely natural?
14. Did the Arabic avoid literal foreign sentence structure?
15. Is the character's tone preserved?
16. Is the level of politeness appropriate?
17. Did excessive formality appear unnecessarily?
18. Does every sentence mean exactly what the source means?
19. Does the translation read like professionally localized Arabic manga/manhwa?
20. Can any sentence be made simpler without losing meaning?

If any answer is wrong, silently correct the translation before returning it.

==================================================
ABSOLUTE OUTPUT RULE
==================================================

DO NOT:

- explain the translation
- explain corrections
- add translator notes
- add alternatives
- add commentary
- summarize
- invent information
- invent numbers
- invent names
- change markers
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

IMPORTANT TRANSLATION INSTRUCTION:

First understand the complete meaning and context.

Then completely rebuild each sentence in natural Arabic.

Do NOT translate word-by-word.

Do NOT preserve Korean, Chinese, Japanese, or English sentence structure when it sounds unnatural in Arabic.

Use the simplest natural Arabic wording that preserves the complete meaning.

Preserve every original text marker.

Preserve every entry and its order.

Preserve every // marker.

Treat // as connected to the preceding non-// bubble and inherit its type and tone.

Check all numbers, quantities, names, titles, ranks, relationships, and actions carefully.

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
- Rewrite unnatural Arabic completely when necessary.
- Make Arabic genuinely natural and simple.
- Do NOT merely polish a literal translation.
- Rebuild awkward sentences naturally from their intended meaning.
- Preserve character tone.
- Avoid unnecessary formality.
- Avoid foreign sentence structure.
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

If an existing sentence is literal, awkward, stiff, or unnatural, rewrite it naturally rather than merely changing one or two words.

However, do not change the actual meaning.

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
