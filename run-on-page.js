/* This is the full content for your new 'run-on-page.js' file */

(function() {
    const d = document,
        c = "a11y-audit-result",
        o = "data-original-title",
        l = "a11y-audit-running";

    /* Global state for page integrity checks */
    let h1ErrorReported = false;
    const navNames = new Set();
    const structuralTags = ["table", "thead", "tbody", "tfoot", "tr", "th", "td", "ol", "ul", "dl", "li", "form"];
    const allQuerySelectors = "h1,h2,h3,h4,h5,h6,main,header,footer,nav,aside,article,img,a,button,label,input,select,textarea,div[role],span[role],audio,video," + structuralTags.join(',');

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

    /* 4. GLOBAL CHECKS (Lang and Skip Link) */

    // Helper to inject a message at the start of the body
    const injectGlobalMessage = (msg) => {
        const msgEl = d.createElement("strong");
        msgEl.className = c;
        msgEl.textContent = msg;
        d.body.prepend(msgEl);
    };

    // A. HTML Language Check
    const htmlEl = d.documentElement;
    const langAttr = htmlEl.getAttribute('lang');
    if (!langAttr || langAttr.trim() === '') {
        injectGlobalMessage(`AUDIT: CRITICAL: HTML Missing 'lang' attribute. Screen readers cannot determine page language.`);
    } else {
         injectGlobalMessage(`AUDIT: Language OK: HTML lang="${langAttr}".`);
    }

    // B. Skip to Main Content Link Check
    const skipLink = d.querySelector('a[href^="#"]');
    let hasValidSkipLink = false;
    
    if (skipLink) {
        const targetId = skipLink.getAttribute('href').substring(1);
        const validTarget = d.getElementById(targetId) || d.querySelector(`main#${targetId}`) || d.querySelector(`[role="main"]#${targetId}`);
        
        if (targetId && validTarget) {
            const focusableElements = Array.from(d.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"], [tabindex="-1"]'));
            if (focusableElements[0] === skipLink || focusableElements[1] === skipLink) {
                 hasValidSkipLink = true;
                 injectGlobalMessage(`AUDIT: Skip Link OK: Found link targeting #${targetId} as an early focusable element.`);
            }
        }
    }

    if (!hasValidSkipLink) {
        injectGlobalMessage(`AUDIT: CRITICAL: Skip Link Missing or Invalid Target. Add a "Skip to Main Content" link as the first focusable element.`);
    }
    
    /* 5. RUN THE ELEMENT-SPECIFIC AUDIT LOOP */
    d.querySelectorAll(allQuerySelectors).forEach(e => {
        try {
            if ("true" === e.getAttribute("aria-hidden")) return;
            let t, i = e.tagName.toLowerCase(),
                A = e.getAttribute("role"),
                g = i.toUpperCase(),
                elementName = A || i;

            /* Check Headings: H1 Uniqueness Logic */
            if (/^h\d$/.test(i)) {
                let currentLevel = i[1],
                    expectedLevel = currentLevel - 1;
                
                if (currentLevel === '1') {
                    if (d.querySelectorAll('h1').length > 1) {
                        t = `AUDIT: CRITICAL: <H1> Duplicated. Only one <H1> should be used per page.`
                    } else {
                        t = `AUDIT: <H1> Found. Only one H1 detected.`
                    }
                } else if (expectedLevel > 0 && !d.querySelector("h" + expectedLevel)) {
                    if (!h1ErrorReported) {
                         t = `AUDIT: CRITICAL: <H${currentLevel}> Structure Error: H${currentLevel} used before H${expectedLevel}.`;
                         h1ErrorReported = true; // Report only the first hierarchy error
                    }
                } else {
                    t = `AUDIT: <H${currentLevel}> Hierarchy OK.`
                }
            }
            
            /* Check Landmarks: Concise Result + Nesting Check + Nav Uniqueness */
            else if (r.includes(i) || A && n.includes(A)) {
                let landmarkType = A ? A : g.toLowerCase();
                
                // CRITICAL NESTING CHECK: footer/contentinfo inside main
                if (("footer" === i || "contentinfo" === A) && e.closest("main, [role='main']")) {
                    t = `AUDIT: CRITICAL: Landmark Nesting Error: <main> contains <${landmarkType}>.`
                } else {
                    t = `AUDIT: Landmark <${A ? 'role="' + A + '"' : i}> Found.`
                }

                // NAVIGATION UNIQUENESS CHECK
                if (i === 'nav' || A === 'navigation') {
                    const accName = e.getAttribute('aria-label') || e.getAttribute('aria-labelledby');
                    if (d.querySelectorAll('nav, [role="navigation"]').length > 1) {
                        if (!accName) {
                            t = `AUDIT: CRITICAL: Multiple <nav> elements found. This navigation requires a unique 'aria-label' or 'aria-labelledby'.`;
                        } else if (navNames.has(accName)) {
                            t = `AUDIT: CRITICAL: Multiple <nav> elements found. This 'aria-label' ("${accName}") is duplicated.`;
                        } else {
                            navNames.add(accName);
                            t = `AUDIT: <nav> Found: Unique name "${accName}" OK.`;
                        }
                    }
                }
            }
            
            /* Check Media Elements: Audio/Video Controls */
            else if (i === "video" || i === "audio") {
                let hasControls = e.hasAttribute("controls");
                if (i === "video") {
                    let hasTrack = e.querySelector("track") !== null;
                    if (!hasControls) {
                        t = `AUDIT: CRITICAL: <video> Missing 'controls' attribute.`
                    } else if (!hasTrack) {
                        t = `AUDIT: WARNING: <video> Missing <track> element for captions/subtitles.`
                    } else {
                        t = `AUDIT: <video> Controls & Captions OK.`
                    }
                } else if (i === "audio") {
                    if (!hasControls) {
                        t = `AUDIT: CRITICAL: <audio> Missing 'controls' attribute.`
                    } else {
                        t = `AUDIT: <audio> Controls OK.`
                    }
                }
            }
            
            /* Check <img>: No Truncation */
            else if ("img" === i && !A) {
                let a = e.getAttribute("alt");
                t = null === a ? `AUDIT: CRITICAL: <img> Missing 'alt' attribute.` : "" === a.trim() ? `AUDIT: <img> Decorative (alt="").` : `AUDIT: <img> Alt Found: "${a}".`
            }
            
            /* Check role="img": No Truncation */
            else if ("img" === A) {
                let al = e.getAttribute("aria-label"),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = alby_id ? d.getElementById(alby_id)?.textContent.trim() : "",
                    hid = e.getAttribute("aria-hidden");
                let nameSource = al ? `aria-label: "${al}"` : `aria-labelledby: "${alby_txt}"`;
                t = "true" === hid ? `AUDIT: role="img" Hidden (aria-hidden='true').` : (al || alby_txt) ? `AUDIT: role="img" Name Found: ${nameSource}.` : `AUDIT: CRITICAL: role="img" Missing Accessible Name.`
            }
            
            /* Check Personal Input Fields for Autocomplete */
            else if ("input" === i && ["email", "tel", "url", "name", "username", "password", "cc-name", "cc-number", "cc-exp", "given-name", "family-name"].includes(e.type) ) {
                let autocomplete = e.getAttribute("autocomplete");
                if (!autocomplete) {
                    t = `AUDIT: CRITICAL: <input type="${e.type}"> Missing 'autocomplete' attribute.`
                } else if (autocomplete.toLowerCase() === "off") {
                    t = `AUDIT: CRITICAL: <input type="${e.type}"> has autocomplete="off". Check security needs.`
                } else {
                    t = `AUDIT: <input type="${e.type}"> Autocomplete OK: "${autocomplete}".`
                }
            }
            
            /* Check Links & Buttons: No Truncation (Name Matching) */
            else if (["a", "button"].includes(i) || ["link", "button"].includes(A)) {
                let vis = (e.textContent || "").trim(),
                    al = (e.getAttribute("aria-label") || "").trim(),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = (alby_id ? d.getElementById(alby_id)?.textContent : "").trim(),
                    accName = al || alby_txt;
                
                if (accName && vis) {
                    let na = accName.toLowerCase(),
                        nv = vis.toLowerCase();
                    let nameSource = al ? 'aria-label' : 'aria-labelledby';
                    t = na.includes(nv) ? `AUDIT: <${elementName}> Name OK: ${nameSource} contains text ("${vis}").` : `AUDIT: CRITICAL: <${elementName}> Name Mismatch: ${nameSource} ("${accName}") doesn't contain text ("${vis}").`
                } else if (accName) {
                    let nameSource = al ? 'aria-label' : 'aria-labelledby';
                    t = `AUDIT: <${elementName}> Name from ${nameSource}: "${accName}".`
                } else if (vis) {
                    t = `AUDIT: <${elementName}> Name from Text: "${vis}".`
                } else e.title ? t = `AUDIT: CRITICAL: <${elementName}> Only 'title' attribute. No accessible name.` : t = `AUDIT: CRITICAL: <${elementName}> Missing Accessible Name.`
            }
            
            /* Check General Form Controls: No Truncation */
            else if (["input", "select", "textarea"].includes(i) || ["checkbox", "radio", "textbox", "listbox", "combobox"].includes(A)) {
                // Skip if already checked for autocomplete
                if (i === "input" && ["email", "tel", "url", "name", "username", "password", "cc-name", "cc-number", "cc-exp", "given-name", "family-name"].includes(e.type)) {
                    // Do nothing
                } else {
                    let s = A ? `role="${A}"` : `<${g}>`,
                        al = (e.getAttribute("aria-label") || "").trim(),
                        lfor_el = e.id && d.querySelector(`label[for="${e.id}"]`),
                        lfor_txt = (lfor_el ? lfor_el.textContent : "").trim(),
                        alby_id = e.getAttribute("aria-labelledby"),
                        alby_txt = (alby_id ? d.getElementById(alby_id)?.textContent : "").trim(),
                        accName = al || alby_txt;
                    
                    let nameSource = al ? 'aria-label' : 'aria-labelledby';
                    
                    if (accName && lfor_txt) {
                        let na = accName.toLowerCase(),
                            nv = lfor_txt.toLowerCase();
                        t = na.includes(nv) ? `AUDIT: ${s} Label OK: ${nameSource} contains <label for> text ("${lfor_txt}").` : `AUDIT: CRITICAL: ${s} Label Mismatch: ${nameSource} doesn't contain <label for> text ("${lfor_txt}").`
                    } else if (lfor_txt) {
                        t = `AUDIT: ${s} Label from <label for> OK: "${lfor_txt}".`
                    } else if (accName) {
                        t = `AUDIT: ${s} Label from ${nameSource} OK: "${accName}".`
                    } else e.placeholder ? t = `AUDIT: CRITICAL: ${s} Placeholder only. Not an accessible label.` : t = `AUDIT: CRITICAL: ${s} Missing Accessible Label.`
                }
            }
            
            /* Check Labels: Concise Result */
            else if ("label" === i) {
                t = `AUDIT: <LABEL> Associated OK.`
            }

            /* Check Structural Tags: List, Table, Form Markers */
            else if (structuralTags.includes(i)) {
                t = `AUDIT: Structural Tag Found: <${i.toUpperCase()}>.`
            }

            /* 6. INJECT THE RESULT */
            if (t) {
                const b = d.createElement("strong");
                b.className = c;
                b.textContent = t; 
                e.setAttribute(o, e.title || "");
                e.title = t; 

                // Structural and Landmark elements get START and END markers
                if (r.includes(i) || A && n.includes(A) || structuralTags.includes(i)) {
                    e.prepend(b);
                    const E = d.createElement("strong");
                    E.className = c;
                    E.textContent = `End of Tag: <${i.toUpperCase()}> complete.`;
                    
                    // Special case for Landmarks
                    if (r.includes(i) || A && n.includes(A)) {
                        E.textContent = `End of Landmark: ${A ? A : g.toLowerCase()} region complete.`;
                    }
                    e.append(E);
                } else {
                    e.after(b);
                }
            }
        } catch (s) {
            console.error("A11y Audit Error:", e, s)
        }
    });

    /* 7. ADD BODY CLASS TO MARK AUDIT AS RUNNING */
    d.body.classList.add(l)
})();
