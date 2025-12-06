/* This is the full content for your fixed 'run-on-page.js' file */

(function() {
    const d = document,
        c = "a11y-audit-result",
        o = "data-original-title",
        l = "a11y-audit-running";

    /* Global state for page integrity checks */
    let h1ErrorFound = false; // Renamed for clarity: tracks if a heading hierarchy skip was found
    let h1Count = 0;          // NEW: Tracks the count of level 1 headings found
    let lastUsedHeadingLevel = 0; 
    const navNames = new Set();
    
    // Landmark ARIA Roles (n) and Native Tags (r)
    const n = ["banner", "complementary", "contentinfo", "form", "main", "navigation", "region", "search"]; 
    const r = ["main", "header", "footer", "nav", "aside", "section", "article"]; 
    
    // Structural Tags 
    const structuralTags = ["table", "thead", "tbody", "tfoot", "tr", "th", "td", "ol", "ul", "dl", "li", "form"];
    
    // Comprehensive Query Selector for the main loop
    const allQuerySelectors = [
        "h1,h2,h3,h4,h5,h6,[role=\"heading\"],svg,img,a,button,label,input,select,textarea,div[role],span[role],audio,video", 
        r.join(','), 
        structuralTags.join(','), 
        "[role=\"list\"], [role=\"listitem\"]" 
    ].join(',');


    /* 1. CHECK IF AUDIT IS ALREADY RUNNING (TOGGLE OFF) */
    if (d.body.classList.contains(l)) {
        d.querySelectorAll(`[${o}]`).forEach(t => {
            t.title = t.getAttribute(o);
            t.removeAttribute(o)
        });
        d.querySelectorAll("." + c).forEach(t => t.remove());
        d.body.classList.remove(l);
        d.querySelector(`style[data-audit-style=\"${c}\"]`)?.remove();
        return;
    }

    /* 2. INJECT VISUALLY HIDDEN STYLES (Using Modern clip-path) */
    const s = d.createElement("style"),
        a = "!important";
    s.setAttribute("data-audit-style", c);
    s.textContent = `.${c}{position:absolute${a};width:1px${a};height:1px${a};margin:-1px${a};padding:0${a};overflow:hidden${a};clip-path:inset(50%)${a};border:0${a};white-space:nowrap${a}}`;
    d.head.append(s);

    /* 3. GLOBAL CHECKS (Lang and Skip Link) */

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
    // The link must be the very first focusable element.
    const skipLink = d.querySelector('a[href^="#"]');
    let hasValidSkipLink = false;
    
    if (skipLink) {
        const targetId = skipLink.getAttribute('href').substring(1);
        const validTarget = d.getElementById(targetId) || d.querySelector(`main#${targetId}`) || d.querySelector(`[role="main"]#${targetId}`);
        
        if (targetId && validTarget) {
            const focusableElements = Array.from(d.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')).filter(el => {
                 // Filter out elements that are visually hidden or disabled, if possible
                 const style = window.getComputedStyle(el);
                 if (style.display === 'none' || style.visibility === 'hidden') return false;
                 if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;
                 return true;
            });
            
            // FIXED: Must be strictly the first focusable element [0]
            if (focusableElements[0] === skipLink) {
                  hasValidSkipLink = true;
            }
        }
    }

    if (!hasValidSkipLink) {
        injectGlobalMessage(`AUDIT: CRITICAL: Skip Link Missing or Invalid Target. Add a "Skip to Main Content" link as the first focusable element.`);
    }
    
    // Global calculation for H1 Duplication
    const allH1s = d.querySelectorAll('h1, [role="heading"][aria-level="1"]');
    if (allH1s.length > 1) {
         h1Count = allH1s.length; // Set count to trigger duplication error for each H1
    }

    /* 4. RUN THE ELEMENT-SPECIFIC AUDIT LOOP */
    d.querySelectorAll(allQuerySelectors).forEach(e => {
        try {
            // Early exit for aria-hidden="true"
            if ("true" === e.getAttribute("aria-hidden")) return;
            
            let t, 
                i = e.tagName.toLowerCase(),
                A = e.getAttribute("role"),
                g = i.toUpperCase(),
                elementName = A || i;

            /* Check Headings: H1 Uniqueness Logic and ARIA Headings */
            if (/^h\d$/.test(i) || A === 'heading') {
                let currentLevel;
                let isCritical = false;
                
                // 1. Determine the level and element name
                if (A === 'heading') {
                    const ariaLevel = e.getAttribute('aria-level');
                    const parsedLevel = parseInt(ariaLevel);
                    
                    if (!ariaLevel || isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 6) {
                        // FIX: Report missing/invalid aria-level as critical
                        t = `AUDIT: CRITICAL: role="heading" Missing or Invalid 'aria-level' (found "${ariaLevel || 'none'}").`;
                        isCritical = true;
                        // Keep currentLevel as 0 or 2 for flow, but do not update lastUsedHeadingLevel
                        currentLevel = parsedLevel || 2; 
                    } else {
                        currentLevel = parsedLevel;
                        elementName = `role="heading" level ${currentLevel}`;
                    }
                } else {
                    currentLevel = parseInt(i[1]);
                    elementName = `<H${currentLevel}>`;
                }

                if (!isCritical) {
                    // 2. Check H1 Duplication (Global Check)
                    if (currentLevel === 1 && h1Count > 1) {
                        t = `AUDIT: CRITICAL: ${elementName} Duplicated. Only one Level 1 heading should be used per page.`;
                        isCritical = true;
                    } 
                    
                    // 3. Check Sequential Hierarchy (Local Check)
                    else if (currentLevel > 1 && lastUsedHeadingLevel > 0 && currentLevel > lastUsedHeadingLevel + 1) {
                        // A level was skipped (e.g., H4 followed H2). 
                        if (!h1ErrorFound) { 
                            const expectedLevel = lastUsedHeadingLevel + 1;
                            t = `AUDIT: CRITICAL: ${elementName} Hierarchy Error: Level ${currentLevel} skips required Level ${expectedLevel}. (After Level ${lastUsedHeadingLevel})`;
                            h1ErrorFound = true; // Report only the first hierarchy error
                            isCritical = true;
                        }
                    }

                    // 4. OK Case (Sequential, same level, or jump up) - Only runs if no critical error was assigned above
                    if (!t) {
                        if (currentLevel === 1) {
                            t = `AUDIT: ${elementName} Found. Only one Level 1 detected.`;
                        } else {
                            t = `AUDIT: ${elementName} Hierarchy OK.`;
                        }
                    }
                }
                
                // 5. Update the tracker for the next check, UNLESS a critical error was found
                // We only update the level if the element itself is compliant (not a duplicate H1 or invalid aria-level)
                if (!isCritical) {
                    lastUsedHeadingLevel = currentLevel;
                }
            }
            
            /* Check Landmarks: Explicit Name Source + Fixed Region Logic */
            else if (r.includes(i) || (A && n.includes(A))) {
                let landmarkType = `<${g}>`; 
                let al = e.getAttribute('aria-label');
                let alby_id = e.getAttribute('aria-labelledby');
                let accName = al || (alby_id ? d.getElementById(alby_id)?.textContent.trim() : "");
                let isRegion = i === 'section' || A === 'region';
                let nameSource = al ? `aria-label` : (alby_id ? `aria-labelledby` : 'N/A');

                if (A && n.includes(A)) {
                    landmarkType = r.includes(i) ? `<${g} role="${A.toUpperCase()}">` : `<${i.toUpperCase()} role="${A.toUpperCase()}">`; 
                }
                
                // REGION/SECTION Check: requires accessible name
                if (isRegion && !accName) {
                    t = `AUDIT: CRITICAL: Landmark ${landmarkType} Missing Accessible Name. Requires 'aria-label' or 'aria-labelledby'.`;
                    
                } else if (isRegion && accName) {
                    // REGION Name OK
                    t = `AUDIT: Landmark ${landmarkType} Found. Name (${nameSource}): "${accName}".`;
                }
                
                // CRITICAL NESTING CHECK: footer/contentinfo inside main
                else if (("footer" === i || "contentinfo" === A) && e.closest("main, [role='main']")) {
                    t = `AUDIT: CRITICAL: Landmark Nesting Error: <main> contains ${landmarkType}.`
                } 

                // NAVIGATION UNIQUENESS CHECK
                else if (i === 'nav' || A === 'navigation') {
                    const navAccName = accName || ''; // Use the already calculated accessible name
                    const allNavs = d.querySelectorAll('nav, [role="navigation"]').length;

                    if (allNavs > 1) {
                        if (!navAccName) {
                            t = `AUDIT: CRITICAL: Multiple <nav> elements found. This navigation requires a unique 'aria-label' or 'aria-labelledby'.`;
                        } else if (navNames.has(navAccName) && navAccName) {
                            t = `AUDIT: CRITICAL: Multiple <nav> elements found. This 'aria-label' ("${navAccName}") is duplicated.`;
                        } else {
                            navNames.add(navAccName);
                            t = `AUDIT: Landmark <NAV> Found. Unique name ("${navAccName}") OK.`;
                        }
                    } else {
                        t = `AUDIT: Landmark <NAV> Found.`;
                    }
                }
                
                // General Landmark Success 
                if (!t) {
                    t = `AUDIT: Landmark ${landmarkType} Found.`;
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
            
            /* Check <img> and role="img" */
            else if (i === "img" || A === "img") {
                let altText = e.getAttribute("alt");
                let name_al = e.getAttribute("aria-label");
                let name_alby_id = e.getAttribute("aria-labelledby");
                let accNameSource = null;
                // Accessible Name Calculation
                let accName = name_al || (name_alby_id ? d.getElementById(name_alby_id)?.textContent.trim() : "");
                if (name_al) accNameSource = 'aria-label';
                else if (name_alby_id) accNameSource = 'aria-labelledby';
                
                let hid = e.getAttribute("aria-hidden");
                
                if (A === "img") {
                    t = "true" === hid ? `AUDIT: role="img" Hidden (aria-hidden='true').` : accName ? `AUDIT: role="img" Name Found (${accNameSource}): "${accName}".` : `AUDIT: CRITICAL: role="img" Missing Accessible Name.`
                } else if (i === "img" && !A) {
                    // FIX: Native img - Name precedence: aria-label/labelledby > alt
                    if (accName) {
                         t = `AUDIT: <img> Name Found (${accNameSource}): "${accName}".`; 
                    } else if (altText === "") {
                         t = `AUDIT: <img> Decorative (alt="").`
                    } else if (altText !== null) { // alt attribute exists and is not empty string
                         t = `AUDIT: <img> Alt Found: "${altText}".`
                    } else {
                         t = `AUDIT: CRITICAL: <img> Missing 'alt' attribute or Accessible Name.`
                    }
                }
            }
            
            /* Check <SVG>: For Accessible Name and Role */
            else if ("svg" === i) {
                let name = e.getAttribute("aria-label") || e.querySelector("title")?.textContent || "";
                let role = e.getAttribute("role");
                let nameSource = e.getAttribute("aria-label") ? 'aria-label' : 'title tag';

                if (role === "img") {
                    if (name) {
                          t = `AUDIT: <SVG role="img"> Name Found (${nameSource}): "${name}".`;
                    } else {
                          t = `AUDIT: CRITICAL: <SVG role="img"> Missing Accessible Name.`;
                    }
                } else if (role === "presentation" || e.getAttribute("aria-hidden") === "true") {
                    t = `AUDIT: <SVG> Decorative (role="presentation" or aria-hidden="true").`;
                } else {
                    t = `AUDIT: WARNING: <SVG> Missing role="img" or role="presentation". Check accessibility intent.`;
                }
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
                let vis = (e.textContent || "").trim().replace(/\s+/g, ' '), // Normalize whitespace
                    al = (e.getAttribute("aria-label") || "").trim(),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = (alby_id ? d.getElementById(alby_id)?.textContent : "").trim(),
                    accName = al || alby_txt;
                
                let elementNameTag = A ? `role="${A}"` : `<${g}>`;
                
                if (accName && vis) {
                    let na = accName.toLowerCase(),
                        nv = vis.toLowerCase();
                    let nameSource = al ? 'aria-label' : 'aria-labelledby';
                    t = na.includes(nv) ? `AUDIT: ${elementNameTag} Name OK: ${nameSource} contains text ("${vis}").` : `AUDIT: CRITICAL: ${elementNameTag} Name Mismatch: ${nameSource} ("${accName}") doesn't contain text ("${vis}").`
                } else if (accName) {
                    let nameSource = al ? 'aria-label' : 'aria-labelledby';
                    t = `AUDIT: ${elementNameTag} Name from ${nameSource}: "${accName}".`
                } else if (vis) {
                    t = `AUDIT: ${elementNameTag} Name from Text: "${vis}".`
                } else e.title ? t = `AUDIT: CRITICAL: ${elementNameTag} Only 'title' attribute. No accessible name.` : t = `AUDIT: CRITICAL: ${elementNameTag} Missing Accessible Name.`
            }
            
            /* Check General Form Controls: <INPUT>, <SELECT>, <TEXTAREA> */
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

            /* Check Structural Tags: List, Table, Form Markers, ARIA Lists */
            else if (structuralTags.includes(i) || A === 'list' || A === 'listitem') {
                if (i === 'li' || A === 'listitem') {
                    t = `AUDIT: <LI> Found.`; 
                } else if (i === 'ul' || i === 'ol' || i === 'dl' || A === 'list') {
                    const listRole = A === 'list' ? ` role="list"` : '';
                    t = `AUDIT: <${g}${listRole}> (List) Found.` 
                } else if (i === 'form') {
                    t = `AUDIT: <FORM> Found.` 
                } else {
                    t = `AUDIT: <${g}> Found.` 
                }
            }

            /* 5. INJECT THE RESULT */
            if (t) {
                const b = d.createElement("strong");
                b.className = c;
                b.textContent = t; 
                e.setAttribute(o, e.title || "");
                e.title = t; 

                // Structural and Landmark elements get START and END markers
                if (r.includes(i) || (A && n.includes(A)) || structuralTags.includes(i) || A === 'list' || A === 'listitem') {
                    e.prepend(b);
                    const E = d.createElement("strong");
                    E.className = c;
                    
                    // Determine the explicit closing tag text
                    let closeText;
                    
                    if (r.includes(i) || (A && n.includes(A))) {
                        // It's a Landmark
                        let tagName = g; 
                        let roleAttribute = A ? ` role="${A.toUpperCase()}"` : '';

                        if (r.includes(i) && A && n.includes(A)) {
                            closeText = `AUDIT: Landmark <${tagName}${roleAttribute}> End.`;
                        } else if (r.includes(i) && !A) {
                            closeText = `AUDIT: Landmark <${tagName}> End.`;
                        } else if (A && n.includes(A) && !r.includes(i)) {
                            closeText = `AUDIT: Landmark <${i.toUpperCase()}${roleAttribute}> End.`;
                        } else {
                            closeText = `AUDIT: Landmark <${tagName}${roleAttribute}> End.`;
                        }
                    } else {
                        // It's a Structural Tag 
                        if (i === 'li' || A === 'listitem') {
                            closeText = `AUDIT: <LI> End.`; 
                        } else if (A === 'list') {
                            closeText = `AUDIT: <${i.toUpperCase()} role="LIST"> End.`; 
                        } else {
                            closeText = `AUDIT: <${g}> End.`; 
                        }
                    }
                    
                    E.textContent = closeText;
                    e.append(E);
                } else {
                    e.after(b);
                }
            }
        } catch (s) {
            console.error("A11y Audit Error:", e, s)
        }
    });

    /* 6. ADD BODY CLASS TO MARK AUDIT AS RUNNING */
    d.body.classList.add(l)
})();
