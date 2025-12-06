/* --- START: errorOnlyAudit.js (The Low-Noise/Screen Reader Optimized Audit) --- */

(function() {
    const d = document,
        c = "a11y-audit-result",
        o = "data-original-title",
        l = "a11y-audit-running";

    /* Global state for page integrity checks */
    let h1ErrorFound = false;
    let h1Count = 0;          
    let lastUsedHeadingLevel = 0; 
    const navNames = new Set();
    
    // Landmark ARIA Roles (n) and Native Tags (r)
    const n = ["banner", "complementary", "contentinfo", "form", "main", "navigation", "region", "search"]; 
    const r = ["main", "header", "footer", "nav", "aside", "section", "article"]; 
    
    // Structural Tags (Keep "Found/End" for these)
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

    // --- GLOBAL CHECKS ONLY OUTPUT CRITICAL ERRORS ---
    // A. HTML Language Check
    const langAttr = d.documentElement.getAttribute('lang');
    if (!langAttr || langAttr.trim() === '') {
        injectGlobalMessage(`AUDIT: CRITICAL: HTML Missing 'lang' attribute. Screen readers cannot determine page language.`);
    }

    // B. Skip to Main Content Link Check
    const skipLink = d.querySelector('a[href^="#"]');
    let hasValidSkipLink = false;
    
    if (skipLink) {
        const targetId = skipLink.getAttribute('href').substring(1);
        const validTarget = d.getElementById(targetId) || d.querySelector(`main#${targetId}`) || d.querySelector(`[role="main"]#${targetId}`);
        
        if (targetId && validTarget) {
            const focusableElements = Array.from(d.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')).filter(el => {
                 const style = window.getComputedStyle(el);
                 if (style.display === 'none' || style.visibility === 'hidden') return false;
                 if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;
                 return true;
            });
            
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
         h1Count = allH1s.length; 
    }

    /* 4. RUN THE ELEMENT-SPECIFIC AUDIT LOOP */
    d.querySelectorAll(allQuerySelectors).forEach(e => {
        try {
            // Early exit for aria-hidden="true"
            if ("true" === e.getAttribute("aria-hidden")) return;
            
            let t, // The audit message (only set if CRITICAL, WARNING, or Structural/Landmark)
                i = e.tagName.toLowerCase(),
                A = e.getAttribute("role"),
                g = i.toUpperCase(),
                elementName = A || i;

            /* Check Headings: ONLY OUTPUT ERRORS */
            if (/^h\d$/.test(i) || A === 'heading') {
                let currentLevel;
                let isCritical = false;
                
                // 1. Determine the level and element name
                if (A === 'heading') {
                    const ariaLevel = e.getAttribute('aria-level');
                    const parsedLevel = parseInt(ariaLevel);
                    
                    if (!ariaLevel) {
                        t = `AUDIT: CRITICAL: role="heading" Missing 'aria-level' attribute.`;
                        isCritical = true;
                        currentLevel = 2;
                    } else if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 6) {
                        t = `AUDIT: CRITICAL: role="heading" Invalid 'aria-level' value ("${ariaLevel}"). Must be 1-6.`;
                        isCritical = true;
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
                        if (!h1ErrorFound) { 
                            const expectedLevel = lastUsedHeadingLevel + 1;
                            t = `AUDIT: CRITICAL: ${elementName} Hierarchy Error: Level ${currentLevel} skips required Level ${expectedLevel}. (After Level ${lastUsedHeadingLevel})`;
                            h1ErrorFound = true; 
                            isCritical = true;
                        }
                    }
                    // NO 'Hierarchy OK' messages are generated here. Silence = compliance.
                }
                
                // 4. Update the tracker for the next check
                if (!isCritical) {
                    lastUsedHeadingLevel = currentLevel;
                }
            }
            
            /* Check Landmarks: ONLY OUTPUT ERRORS + BOUNDARIES */
            else if (r.includes(i) || (A && n.includes(A))) {
                let landmarkType = `<${g}>`; 
                let al = e.getAttribute('aria-label');
                let alby_id = e.getAttribute('aria-labelledby');
                let accName = al || (alby_id ? d.getElementById(alby_id)?.textContent.trim() : "");
                let isRegion = i === 'section' || A === 'region';

                if (A && n.includes(A)) {
                    landmarkType = r.includes(i) ? `<${g} role="${A.toUpperCase()}">` : `<${i.toUpperCase()} role="${A.toUpperCase()}">`; 
                }
                
                // CRITICAL ERRORS
                if (isRegion && !accName) {
                    t = `AUDIT: CRITICAL: Landmark ${landmarkType} Missing Accessible Name. Requires 'aria-label' or 'aria-labelledby'.`;
                } 
                else if (("footer" === i || "contentinfo" === A) && e.closest("main, [role='main']")) {
                    t = `AUDIT: CRITICAL: Landmark Nesting Error: <main> contains ${landmarkType}.`
                } 
                else if ((i === 'nav' || A === 'navigation') && d.querySelectorAll('nav, [role="navigation"]').length > 1 && !accName) {
                    t = `AUDIT: CRITICAL: Multiple <nav> elements found. This navigation requires a unique 'aria-label' or 'aria-labelledby'.`;
                }
                // If no critical error, set 't' to produce boundary message (e.g., "Found")
                if (!t) {
                    t = `AUDIT: Landmark ${landmarkType} Found.`;
                }
            }
            
            /* Check Media Elements: ONLY OUTPUT ERRORS/WARNINGS */
            else if (i === "video" || i === "audio") {
                let hasControls = e.hasAttribute("controls");
                if (i === "video") {
                    let hasTrack = e.querySelector("track") !== null;
                    if (!hasControls) {
                        t = `AUDIT: CRITICAL: <video> Missing 'controls' attribute.`
                    } else if (!hasTrack) {
                        t = `AUDIT: WARNING: <video> Missing <track> element for captions/subtitles.`
                    }
                } else if (i === "audio") {
                    if (!hasControls) {
                        t = `AUDIT: CRITICAL: <audio> Missing 'controls' attribute.`
                    }
                }
                // NO 'OK' messages are generated here.
            }
            
            /* Check <img> and role="img": ONLY OUTPUT ERRORS/WARNINGS */
            else if (i === "img" || A === "img") {
                let altText = e.getAttribute("alt");
                let name_al = e.getAttribute("aria-label");
                let name_alby_id = e.getAttribute("aria-labelledby");
                
                // Accessible Name Calculation (prioritizing ARIA)
                let accName = name_al || (name_alby_id ? d.getElementById(name_alby_id)?.textContent.trim() : "") || (altText !== null && altText !== "" ? altText : null);
                
                if (A === "img" || i === "img") {
                    if (e.getAttribute("aria-hidden") === "true") {
                        // Hidden is usually fine (decorative)
                    } else if (altText === "") {
                         // Decorative is fine (silent = compliance)
                    } else if (!accName) {
                         t = `AUDIT: CRITICAL: <${g}> Missing 'alt' attribute or Accessible Name.`;
                    }
                }
                // NO 'Alt Found' or 'Decorative OK' messages are generated here.
            }
            
            /* Check <SVG>: ONLY OUTPUT ERRORS/WARNINGS */
            else if ("svg" === i) {
                let name = e.getAttribute("aria-label") || e.querySelector("title")?.textContent || "";
                let role = e.getAttribute("role");

                if (role === "img" && !name) {
                    t = `AUDIT: CRITICAL: <SVG role="img"> Missing Accessible Name.`;
                } else if (!role && e.getAttribute("aria-hidden") !== "true") {
                    t = `AUDIT: WARNING: <SVG> Missing role="img" or role="presentation". Check accessibility intent.`;
                }
            }
            
            /* Check Input Fields: ONLY OUTPUT ERRORS */
            else if (["input", "select", "textarea"].includes(i) || ["checkbox", "radio", "textbox", "listbox", "combobox"].includes(A)) {
                let s = A ? `role="${A}"` : `<${g}>`,
                    al = (e.getAttribute("aria-label") || "").trim(),
                    lfor_el = e.id && d.querySelector(`label[for="${e.id}"]`),
                    lfor_txt = (lfor_el ? lfor_el.textContent : "").trim(),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = (alby_id ? d.getElementById(alby_id)?.textContent : "").trim(),
                    accName = al || alby_txt;
                
                // CRITICAL: Autocomplete Checks (Personal Inputs)
                if (i === "input" && ["email", "tel", "url", "name", "username", "password", "cc-name", "cc-number", "cc-exp", "given-name", "family-name"].includes(e.type)) {
                    let autocomplete = e.getAttribute("autocomplete");
                    if (!autocomplete) {
                        t = `AUDIT: CRITICAL: <input type="${e.type}"> Missing 'autocomplete' attribute.`
                    } else if (autocomplete.toLowerCase() === "off") {
                        t = `AUDIT: CRITICAL: <input type="${e.type}"> has autocomplete="off". Check security needs.`
                    }
                }

                // CRITICAL: Label Checks (General Inputs)
                if (!t) {
                    if (e.placeholder && !lfor_txt && !accName) {
                        t = `AUDIT: CRITICAL: ${s} Placeholder only. Not an accessible label.`;
                    } else if (!lfor_txt && !accName) {
                        t = `AUDIT: CRITICAL: ${s} Missing Accessible Label.`;
                    }
                }
                // NO 'Label OK' messages are generated here.
            }
            
            /* Check Links & Buttons: ONLY OUTPUT ERRORS */
            else if (["a", "button"].includes(i) || ["link", "button"].includes(A)) {
                let vis = (e.textContent || "").trim().replace(/\s+/g, ' '), 
                    al = (e.getAttribute("aria-label") || "").trim(),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = (alby_id ? d.getElementById(alby_id)?.textContent : "").trim(),
                    accName = al || alby_txt;
                
                let elementNameTag = A ? `role="${A}"` : `<${g}>`;
                
                if (!accName && !vis) {
                    e.title ? t = `AUDIT: CRITICAL: ${elementNameTag} Only 'title' attribute. No accessible name.` : t = `AUDIT: CRITICAL: ${elementNameTag} Missing Accessible Name.`
                } else if (accName && vis) {
                    let na = accName.toLowerCase(),
                        nv = vis.toLowerCase();
                    if (!na.includes(nv)) {
                        t = `AUDIT: CRITICAL: ${elementNameTag} Name Mismatch: Accessible name doesn't contain visible text ("${vis}").`
                    }
                }
                // NO 'Name OK' messages are generated here.
            }

            /* Check Structural Tags (List/Table): OUTPUT BOUNDARIES + NESTING ERRORS */
            else if (structuralTags.includes(i) || A === 'list' || A === 'listitem') {
                const isListContainer = i === 'ul' || i === 'ol' || A === 'list';
                
                // ADVANCED NESTING CHECK: Non-list content inside a list container
                if (isListContainer) {
                    // Check direct children for non-li/non-listitem roles/tags
                    const children = Array.from(e.children);
                    for (const child of children) {
                        const childI = child.tagName.toLowerCase();
                        const childA = child.getAttribute('role');
                        if (childI !== 'li' && childA !== 'listitem' && childI !== 'script' && childI !== 'style') {
                             // Set WARNING on the non-list element, not the list itself.
                             // This is complex for a run-on-page script, so we'll output the error on the container.
                             if (!t) {
                                  t = `AUDIT: WARNING: ${g} contains non-list content (e.g., <${childI}>). Lists must only contain <li> or listitem roles.`;
                             }
                        }
                    }
                }

                // OUTPUT BOUNDARIES (Found message)
                if (!t) {
                    const listRole = A === 'list' ? ` role="list"` : '';
                    t = `AUDIT: <${g}${listRole}> Found.`; 
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
                    
                    let closeText = `AUDIT: <${g}> End.`;

                    // More detailed closing text for landmarks
                    if (r.includes(i) || (A && n.includes(A))) {
                         let roleAttr = A ? ` role="${A.toUpperCase()}"` : '';
                         closeText = `AUDIT: Landmark <${g}${roleAttr}> End.`;
                    } else if (A === 'list' || A === 'listitem') {
                         closeText = `AUDIT: <${g} role="${A.toUpperCase()}"> End.`;
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

/* --- END: errorOnlyAudit.js --- */
