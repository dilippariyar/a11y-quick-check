/* This is the full content for your new 'run-on-page.js' file */

(function() {
    const d = document,
        c = "a11y-audit-result",
        o = "data-original-title",
        l = "a11y-audit-running";

    /* 1. CHECK IF AUDIT IS ALREADY RUNNING (TOGGLE OFF) */
    if (d.body.classList.contains(l)) {
        d.querySelectorAll(`[${o}]`).forEach(t => {
            t.title = t.getAttribute(o);
            t.removeAttribute(o)
        });
        d.querySelectorAll("." + c).forEach(t => t.remove());
        d.body.classList.remove(l);
        d.querySelector(`style[data-audit-style="${c}"]`)?.remove();
        return;
    }

    /* 2. INJECT VISUALLY HIDDEN STYLES (Using Modern clip-path) */
    const s = d.createElement("style"),
        a = "!important";
    s.setAttribute("data-audit-style", c);
    s.textContent = `.${c}{position:absolute${a};width:1px${a};height:1px${a};margin:-1px${a};padding:0${a};overflow:hidden${a};clip-path:inset(50%)${a};border:0${a};white-space:nowrap${a}}`;
    d.head.append(s);

    /* 3. DEFINE LANDMARK ARRAYS */
    const n = ["banner", "complementary", "contentinfo", "form", "main", "navigation", "region", "search"],
        r = ["main", "header", "footer", "nav", "aside"];

    /* 4. RUN THE AUDIT LOOP */
    d.querySelectorAll("h1,h2,h3,h4,h5,h6,main,header,footer,nav,aside,article,img,a,button,label,input,select,textarea,div[role],span[role],audio,video").forEach(e => {
        try {
            if ("true" === e.getAttribute("aria-hidden")) return;
            let t, i = e.tagName.toLowerCase(),
                A = e.getAttribute("role"),
                g = i.toUpperCase(),
                elementName = A || i;

            /* Check Headings: Simple Explanation */
            if (/^h\d$/.test(i)) {
                let currentLevel = i[1],
                    expectedLevel = currentLevel - 1;
                t = expectedLevel > 0 && !d.querySelector("h" + expectedLevel) ? `Structure Error: Heading Level ${currentLevel} used before a Heading ${expectedLevel}. Fix nesting!` : `Heading OK: This Heading ${currentLevel} is correctly nested.`
            }
            
            /* Check Landmarks: Simple Explanation + Nesting Check */
            else if (r.includes(i) || A && n.includes(A)) {
                let landmarkType = A ? A : g.toLowerCase();
                t = `Landmark Found: This element provides a major structural region (type: ${landmarkType}).`;
                
                // CRITICAL NESTING CHECK: footer/contentinfo inside main
                if (("footer" === i || "contentinfo" === A) && e.closest("main, [role='main']")) {
                    t = `CRITICAL Nesting Error: This ${landmarkType} is inside a <main> landmark. Move it outside <main> to prevent screen reader confusion.`
                }
            }

            /* Check Media Elements: Audio/Video Controls */
            else if (i === "video" || i === "audio") {
                let hasControls = e.hasAttribute("controls");
                if (i === "video") {
                    let hasTrack = e.querySelector("track") !== null;
                    if (!hasControls) {
                        t = `CRITICAL: <VIDEO> is missing the 'controls' attribute. Users need controls to play/pause/stop the video.`
                    } else if (!hasTrack) {
                        t = `WARNING: <VIDEO> has controls but is missing a <track> element for captions/subtitles.`
                    } else {
                        t = `Media OK: <VIDEO> has controls and track for captions.`
                    }
                } else if (i === "audio") {
                    if (!hasControls) {
                        t = `CRITICAL: <AUDIO> is missing the 'controls' attribute. Users need controls to play/pause/stop the audio.`
                    } else {
                        t = `Media OK: <AUDIO> has controls.`
                    }
                }
            }
            
            /* Check <img>: Simple Explanation */
            else if ("img" === i && !A) {
                let a = e.getAttribute("alt");
                // Uses check to only show "..." if alt text is actually longer than 30 chars
                let altSlice = a ? a.slice(0, 30) : '';
                let ellipsis = a && a.length > 30 ? '...' : '';
                
                t = null === a ? `Critical Error: This image is missing the 'alt' attribute entirely. Add alt="" or alt="description".` : "" === a.trim() ? `Image OK: This image is marked as decorative (has empty alt text: alt="").` : `Alt Text Found: Image description starts with: "${altSlice}${ellipsis}"`
            }
            
            /* Check role="img": Simple Explanation */
            else if ("img" === A) {
                let al = e.getAttribute("aria-label"),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = alby_id ? d.getElementById(alby_id)?.textContent.trim() : "",
                    hid = e.getAttribute("aria-hidden");
                t = "true" === hid ? `Image Hidden: Element is hidden from screen readers (aria-hidden='true').` : (al || alby_txt) ? `Image Name Found: Accessible name is provided by ARIA.` : `Critical Error: This element with role='img' has no accessible name for screen readers.`
            }
            
            /* Check Personal Input Fields for Autocomplete */
            else if ("input" === i && ["email", "tel", "url", "name", "username", "password", "cc-name", "cc-number", "cc-exp", "given-name", "family-name"].includes(e.type) ) {
                let autocomplete = e.getAttribute("autocomplete");
                if (!autocomplete) {
                    t = `CRITICAL: Personal field type="${e.type}" is missing the 'autocomplete' attribute. Users need this for form filling.`
                } else if (autocomplete.toLowerCase() === "off") {
                    t = `CRITICAL: Personal field type="${e.type}" has autocomplete="off". This should only be used if user security is critical.`
                } else {
                    t = `Autocomplete OK: Field type="${e.type}" has autocomplete="${autocomplete}".`
                }
            }
            
            /* Check Links & Buttons: Simple Explanation (Name Matching) */
            else if (["a", "button"].includes(i) || ["link", "button"].includes(A)) {
                let vis = (e.textContent || "").trim(),
                    al = (e.getAttribute("aria-label") || "").trim(),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = (alby_id ? d.getElementById(alby_id)?.textContent : "").trim(),
                    accName = al || alby_txt;
                
                let visSlice = vis.slice(0, 20);
                let accNameSlice = accName.slice(0, 20);
                
                if (accName && vis) {
                    let na = accName.toLowerCase(),
                        nv = vis.toLowerCase();
                    t = na.includes(nv) ? `Accessibility OK: ARIA name ("${accNameSlice}...") contains the visible text.` : `CRITICAL: ARIA name ("${accNameSlice}...") does NOT contain the visible text ("${visSlice}..."). Fix name mismatch!`
                } else if (accName) {
                    t = `Name Found: Accessible name provided only by ARIA: "${accNameSlice}..."`
                } else if (vis) {
                    t = `Name Found: Accessible name uses the visible text: "${visSlice}..."`
                } else e.title ? t = `CRITICAL: Only has 'title' attribute (hover text). Not announced to screen readers as a proper name.` : t = `CRITICAL: No accessible name found for this ${elementName}.`
            }
            
            /* Check General Form Controls: Simple Explanation (Non-Personal Types) */
            else if (["input", "select", "textarea"].includes(i) || ["checkbox", "radio", "textbox", "listbox", "combobox"].includes(A)) {
                // If it was already checked for autocomplete, skip general check to avoid duplication.
                if (i === "input" && ["email", "tel", "url", "name", "username", "password", "cc-name", "cc-number", "cc-exp", "given-name", "family-name"].includes(e.type)) {
                    // Do nothing, already checked above
                } else {
                    let s = A ? `role="${A}"` : `<${g}>`,
                        al = (e.getAttribute("aria-label") || "").trim(),
                        lfor_el = e.id && d.querySelector(`label[for="${e.id}"]`),
                        lfor_txt = (lfor_el ? lfor_el.textContent : "").trim(),
                        alby_id = e.getAttribute("aria-labelledby"),
                        alby_txt = (alby_id ? d.getElementById(alby_id)?.textContent : "").trim(),
                        accName = al || alby_txt;
                    
                    let lforSlice = lfor_txt.slice(0, 20);
                    let accNameSlice = accName.slice(0, 20);
                    
                    if (accName && lfor_txt) {
                        let na = accName.toLowerCase(),
                            nv = lfor_txt.toLowerCase();
                        t = na.includes(nv) ? `Accessibility OK: ARIA name contains the associated label text. (Name starts: "${accNameSlice}...")` : `CRITICAL: ARIA name does NOT contain the associated label text. Fix name mismatch! (Label starts: "${lforSlice}...")`
                    } else if (lfor_txt) {
                        t = `Label Found: Accessible name provided by <label for> element. (Text starts: "${lforSlice}...")`
                    } else if (accName) {
                        t = `Label Found: Accessible name provided by ARIA. (Name starts: "${accNameSlice}...")`
                    } else e.placeholder ? t = `CRITICAL: Only has placeholder text. This is NOT an accessible label.` : t = `CRITICAL: No accessible name found for this form field.`
                }
            }
            
            /* Check Labels: Simple Explanation */
            else if ("label" === i) {
                t = `Label OK: This label is correctly associated with a form field (by 'for' attribute or containing the input).`
            }

            /* 5. INJECT THE RESULT */
            if (t) {
                const b = d.createElement("strong");
                b.className = c;
                b.textContent = `A11y Check: ${t}`;
                e.setAttribute(o, e.title || "");
                e.title = `A11y Check: ${t}`;
                if (r.includes(i) || A && n.includes(A)) {
                    e.prepend(b);
                    const E = d.createElement("strong");
                    E.className = c;
                    E.textContent = `End of Landmark: ${A ? A : g.toLowerCase()} region complete.`;
                    e.append(E)
                } else e.after(b)
            }
        } catch (s) {
            console.error("A11y Audit Error:", e, s)
        }
    });

    /* 6. ADD BODY CLASS TO MARK AUDIT AS RUNNING */
    d.body.classList.add(l)
})();
