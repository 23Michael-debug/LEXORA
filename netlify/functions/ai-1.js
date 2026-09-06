exports.handler = async function (event) {

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Method not allowed." })
        };
    }

    try {

        const body = JSON.parse(event.body || "{}");

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Original text is empty." })
            };
        }

        /* =========================================================
           SYSTEM PROMPT (condensed)
           A shorter prompt is easier for the model to follow
           consistently than a very long, repetitive one.
           ========================================================= */

        const systemPrompt = `
You are LEXORA AI, a professional Korean/Chinese/Japanese/English manga-manhwa-webtoon translator and Arabic localization editor.

GOAL: recreate the exact ORIGINAL MEANING in natural, easy-to-read Arabic — never a word-for-word translation.

PRIORITY ORDER: 1) exact meaning 2) no invention 3) no lost meaning 4) correct context 5) natural Arabic 6) character tone 7) readability 8) structural lock.

=== STRUCTURE LOCK (most important rule) ===
Every source line is an immutable slot: MARKER : text
- Output exactly ONE Arabic line per source line — same count, same order.
- Never add, remove, merge, or split lines. Never invent a reply, reaction, or continuation that is not in the source.
- Markers are metadata, copy them exactly, never translate/change/remove them: "" dialogue, () thought, :: shout, // continuation of the previous non-// line's type/speaker/tone, [] boxed text, OT narration, ST side text, SFX sound effect, <> system text.
- Before answering, silently count source lines vs your output lines — they must match, and every marker must match its source line's marker.

=== NO INVENTION / NO LOSS ===
Never add facts, names, numbers, relationships, emotions, or "logical" follow-ups that aren't explicitly in the source (RAW images are context only, not permission to add content; if source and image conflict, trust the source).
Never delete real information (who/what/when/where/why, negation, numbers, names, titles, emphasis, cause-effect) just to shorten a sentence. Never turn a specific/certain statement into a vague/approximate one, or a question into a statement (or vice versa).

=== NATURAL ARABIC ===
Write as if the line were originally composed in Arabic: clear, modern, readable Modern Standard Arabic. Avoid literal source syntax, bureaucratic or overly classical wording, and avoid childish or slang wording unless the source calls for it. Preserve each character's tone (anger, sarcasm, respect, etc.) without exaggerating or flattening it. Keep formality natural, not stiff — respectful ≠ robotic.

=== STYLE MODES ===
- Literal: stay close to source wording/order but still grammatical, natural-enough Arabic; never invent, never lose meaning.
- Natural & Simple: fully natural Arabic, may rewrite the sentence completely; meaning must stay intact.
- Maximum Simplification: keep 100% of the meaning (facts, names, numbers, relationships, emotions, cause-effect) and express it in the simplest, most immediately understandable natural Arabic wording. This simplifies WORDING only, never INFORMATION. Test: "did I make the wording simpler?" not "did I make the meaning smaller?".
If style and meaning ever conflict, meaning always wins.

=== REVIEW MODE (when correcting existing Arabic) ===
The ORIGINAL SOURCE is the sole authority; the existing Arabic is only a draft that may be wrong. For each source line: understand its true meaning, compare the existing Arabic to it, and rewrite fully if it is mistranslated, invented, missing information, unnatural, literal, or has the wrong tone/pronoun/name/number. Do not just polish bad Arabic — replace it. Keep the same structure-lock and marker rules as above.

=== OUTPUT FORMAT ===
Return ONLY the finished Arabic lines, one per source line, in the exact "MARKER : Arabic text" format. No explanations, notes, headings, alternatives, or code blocks.
`;

        /* =========================================================
           USER PROMPT
           ========================================================= */

        let userPrompt = "";

        if (mode === "instant") {

            userPrompt = `
Translate the SOURCE TEXT into Arabic.

Source language: ${sourceLanguage || "Auto Detect"}
Requested style: ${style || "Natural & Simple"}
Options: image context = ${options?.useImageContext ? "Yes" : "No"}, preserve tone = ${options?.preserveTone ? "Yes" : "No"}, avoid literal = ${options?.avoidLiteral ? "Yes" : "No"}

SOURCE TEXT:
${sourceText}

Remember: one Arabic line per source line, same order, same markers, no additions, no omissions. Return only the translation.
`;

        } else {

            const existingArabic = body.existingArabic || "";

            userPrompt = `
Review and correct the existing Arabic translation against the source.

Source language: ${sourceLanguage || "Auto Detect"}
Requested style: ${style || "Natural & Simple"}

SOURCE TEXT:
${sourceText}

EXISTING ARABIC:
${existingArabic}

Remember: one corrected Arabic line per source line, same order, same markers, no additions, no omissions. Return only the corrected translation.
`;
        }

        const userContent = [{ type: "text", text: userPrompt }];

        if (Array.isArray(images)) {
            for (const image of images) {
                if (typeof image !== "string" || !image.startsWith("data:image/")) continue;
                userContent.push({ type: "image_url", image_url: { url: image } });
            }
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error("OPENROUTER_API_KEY is not configured on Netlify.");
        }

        /* =========================================================
           MODEL
           Free-tier vision-capable model (no budget for paid use).
           Using Qwen3.6 Plus here instead of Inkling — Qwen's
           models are specifically known for strong OCR and
           multilingual understanding, which fits reading text out
           of manga panels better than Inkling's advertised strengths
           (coding/math benchmarks). Still unverified for literary
           Arabic translation quality specifically — test it.
           If it disappoints, try the reasoning-enabled alternative
           below; smaller, but "thinks" before answering, which may
           help it follow the strict line/marker rules.
           ========================================================= */

        const MODEL = "qwen/qwen3.6-plus:free";
        // const MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

        async function callModel(messages) {

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
                        model: MODEL,
                        messages: messages,
                        temperature: 0.15,
                        max_tokens: 8000
                    })
                }
            );

            const rawResponse = await response.text();
            let data = null;

            try {
                data = JSON.parse(rawResponse);
            } catch (parseError) {
                const err = new Error(`OpenRouter returned an invalid response (HTTP ${response.status}).`);
                err.statusCode = 502;
                throw err;
            }

            if (!response.ok) {
                const apiError = data?.error?.message || data?.error?.code || `OpenRouter request failed with HTTP ${response.status}.`;
                const err = new Error(apiError);
                err.statusCode = response.status;
                throw err;
            }

            const result = data?.choices?.[0]?.message?.content;

            if (typeof result !== "string" || !result.trim()) {
                const err = new Error("The AI returned an empty response.");
                err.statusCode = 502;
                throw err;
            }

            return { result: result.trim(), model: data?.model || "unknown" };
        }

        /* =========================================================
           STRUCTURAL VALIDATION
           The prompt asks the model to self-check, but weaker
           moments still slip through, so we verify in code:
           line count must match, and markers must match per line.
           If something is off, we retry once with a corrective
           note; if it's still off, we return the result anyway
           along with a warning so the translator can catch it.
           ========================================================= */

        const MARKER_PATTERN = /^("{2}|\(\)|::|\/\/|\[\]|OT|ST|SFX|<>)\s*:\s*(.*)$/;

        function extractEntries(text) {
            return text
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .map((line) => {
                    const match = line.match(MARKER_PATTERN);
                    return match
                        ? { marker: match[1], text: match[2] }
                        : { marker: null, text: line };
                });
        }

        function validateStructure(sourceEntries, resultEntries) {
            const issues = [];

            if (sourceEntries.length !== resultEntries.length) {
                issues.push(
                    `Line count mismatch: source has ${sourceEntries.length} lines, result has ${resultEntries.length}.`
                );
            }

            const minLen = Math.min(sourceEntries.length, resultEntries.length);

            for (let i = 0; i < minLen; i++) {
                const src = sourceEntries[i];
                const out = resultEntries[i];

                if (src.marker && out.marker && src.marker !== out.marker) {
                    issues.push(
                        `Marker mismatch on line ${i + 1}: expected "${src.marker}", got "${out.marker}".`
                    );
                }
            }

            return issues;
        }

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
        ];

        let { result, model } = await callModel(messages);

        const sourceEntries = extractEntries(sourceText);
        let resultEntries = extractEntries(result);
        let issues = validateStructure(sourceEntries, resultEntries);

        if (issues.length > 0) {

            const correctionNote = `
Your previous answer did not follow the structure rules exactly:
${issues.join("\n")}

Return a corrected version with exactly ${sourceEntries.length} lines, same order, same markers as the SOURCE TEXT above. Return only the corrected translation, nothing else.
`;

            try {

                const retryMessages = [
                    ...messages,
                    { role: "assistant", content: result },
                    { role: "user", content: correctionNote }
                ];

                const retry = await callModel(retryMessages);

                const retryEntries = extractEntries(retry.result);
                const retryIssues = validateStructure(sourceEntries, retryEntries);

                // Keep the retry only if it's at least as good as the first attempt.
                if (retryIssues.length <= issues.length) {
                    result = retry.result;
                    model = retry.model;
                    resultEntries = retryEntries;
                    issues = retryIssues;
                }

            } catch (retryError) {
                // If the retry fails, fall back silently to the first result.
            }
        }

        const responseBody = {
            result: result,
            model: model
        };

        if (issues.length > 0) {
            responseBody.warnings = issues;
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(responseBody)
        };

    } catch (error) {

        console.error("LEXORA AI ERROR:", error);

        return {
            statusCode: error?.statusCode || 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: error?.message || "Unknown server error." })
        };
    }
};
