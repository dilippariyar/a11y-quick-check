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

    /* 2. INJECT VISUALLY HIDDEN STYLES */
    const s = d.createElement("style"),
        a = "!important";
    s.setAttribute("data-audit-style", c);
    s.textContent = `.${c}{position:absolute${a};width:1px${a};height:1px${a};margin:-1px${a};padding:0${a};overflow:hidden${a};clip:rect(0,0,0,0)${a};border:0${a};white-space:nowrap${a}}`;
    d.head.append(s);

    /* 3. DEFINE LANDMARK ARRAYS */
    const n = ["banner", "complementary", "contentinfo", "form", "main", "navigation", "region", "search"],
        r = ["main", "header", "footer", "nav", "aside"];

    /* 4. RUN THE AUDIT LOOP */
    d.querySelectorAll("h1,h2,h3,h4,h5,h6,main,header,footer,nav,aside,article,img,a,button,label,input,select,textarea,div[role],span[role]").forEach(e => {
        try {
            if ("true" === e.getAttribute("aria-hidden")) return;
            let t, i = e.tagName.toLowerCase(),
                A = e.getAttribute("role"),
                g = i.toUpperCase(),
                roleTxt = A ? `role="${A}"` : `<${g}>`;

            /* Check Headings */
            if (/^h\d$/.test(i)) {
                let s = i[1],
                    o = s - 1;
                t = o > 0 && !d.querySelector("h" + o) ? `AUDIT: <H${s}> Level ${s} ALERT: Missing H${o}!` : `AUDIT: <H${s}> Level ${s} Hierarchy OK.`
            }
            /* Check Landmarks */
            else if (r.includes(i) || A && n.includes(A)) {
                let s = A ? ` role="${A}"` : "";
                t = `A11y: [LANDMARK] <${g}>${s} Found.`
            }
            /* Check <img> */
            else if ("img" === i && !A) {
                let a = e.getAttribute("alt");
                t = null === a ? `AUDIT: <IMG> CRITICAL: Missing Alt Text!` : "" === a.trim() ? `AUDIT: <IMG> Decorative` : `AUDIT: <IMG> Alt: "${a.slice(0,30)}..."`
            }
            /* Check role="img" */
            else if ("img" === A) {
                let al = e.getAttribute("aria-label"),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = alby_id ? d.getElementById(alby_id)?.textContent.trim() : "",
                    hid = e.getAttribute("aria-hidden");
                t = "true" === hid ? `AUDIT: role="img" Hidden.` : al ? `AUDIT: role="img" Name: ARIA Found.` : alby_txt ? `AUDIT: role="img" Name: ARIA Found.` : `AUDIT: role="img" CRITICAL: No ARIA Label!`
            }
            /* Check Links & Buttons (Full WCAG 2.5.3) */
            else if (["a", "button"].includes(i) || ["link", "button"].includes(A)) {
                let vis = (e.textContent || "").trim(),
                    al = (e.getAttribute("aria-label") || "").trim(),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = (alby_id ? d.getElementById(alby_id)?.textContent : "").trim(),
                    accName = al || alby_txt;
                if (accName && vis) {
                    let na = accName.toLowerCase(),
                        nv = vis.toLowerCase();
                    t = na.includes(nv) ? `AUDIT: ${roleTxt} WCAG OK: ARIA name ("${accName.slice(0,20)}...") contains Text.` : `AUDIT: ${roleTxt} CRITICAL: ARIA name ("${accName.slice(0,20)}...") mismatches Text ("${vis.slice(0,20)}...")!`
                } else if (accName) {
                    t = `AUDIT: ${roleTxt} Name: ${al?`aria-label "${al.slice(0,30)}..."`:`aria-labelledby "${alby_txt.slice(0,30)}..."`}\``
                } else if (vis) {
                    t = `AUDIT: ${roleTxt} Name: Text Content "${vis.slice(0,30)}..."\`
                } else e.title ? t = `AUDIT: ${roleTxt} CRITICAL: Title only!` : t = `AUDIT: ${roleTxt} CRITICAL: No Name Found!`
            }
            /* Check Form Controls (Full WCAG 2.5.3) */
            else if (["input", "select", "textarea"].includes(i) || ["checkbox", "radio", "textbox", "listbox", "combobox"].includes(A)) {
                let s = A ? `role="${A}"` : `<${g}>`,
                    al = (e.getAttribute("aria-label") || "").trim(),
                    lfor_el = e.id && d.querySelector(`label[for="${e.id}"]`),
                    lfor_txt = (lfor_el ? lfor_el.textContent : "").trim(),
                    alby_id = e.getAttribute("aria-labelledby"),
                    alby_txt = (alby_id ? d.getElementById(alby_id)?.textContent : "").trim(),
                    accName = al || alby_txt;
                if (accName && lfor_txt) {
                    let na = accName.toLowerCase(),
                        nv = lfor_txt.toLowerCase();
                    t = na.includes(nv) ? `AUDIT: ${s} WCAG OK: ARIA name ("${accName.slice(0,20)}...") contains Label Text.` : `AUDIT: ${s} CRITICAL: ARIA name ("${accName.slice(0,20)}...") mismatches Label ("${lfor_txt.slice(0,20)}...")!`
                } else if (lfor_txt) {
                    t = `AUDIT: ${s} Label: <label for> "${lfor_txt.slice(0,30)}..."\`
                } else if (accName) {
                    t = `AUDIT: ${s} Label: ${al?`aria-label "${al.slice(0,30)}..."\`:\`aria-labelledby "${alby_txt.slice(0,30)}..."\`}\``
                } else e.placeholder ? t = `AUDIT: ${s} CRITICAL: Placeholder only!` : t = `AUDIT: ${s} CRITICAL: No Label Found!`
            }
            /* Check Labels */
            else if ("label" === i) {
                t = `AUDIT: <LABEL> Target: ${e.getAttribute("for")?`ID "${e.getAttribute("for")}"`:"Contained Input"} OK.`
            }

            /* 5. INJECT THE RESULT */
            if (t) {
                const b = d.createElement("strong");
                b.className = c;
                b.textContent = t;
                e.setAttribute(o, e.title || "");
                e.title = t;
                if (r.includes(i) || A && n.includes(A)) {
                    e.prepend(b);
                    const E = d.createElement("strong");
                    E.className = c;
                    E.textContent = `A11y: [LANDMARK] <${g}>${A?` role="${A}"`:""} End.`;
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
