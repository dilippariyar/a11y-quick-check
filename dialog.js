/* This is the full content for your new 'dialog.js' file */

(function(toolUrl) {
    const d = document;
    
    // Safety check for duplication
    if (d.getElementById('a11y-dialog-container')) { return; }

    const c = d.createElement('div');
    c.id = 'a11y-dialog-container';
    c.setAttribute('role', 'dialog');
    c.setAttribute('aria-modal', 'true');
    c.setAttribute('aria-labelledby', 'a11y-dialog-title');
    // Backdrop style
    c.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;';

    // 1. Inject Styles
    const s = d.createElement('style');
    s.textContent = `#a11y-dialog-box{background:#fff;color:#000 !important;padding:25px;border-radius:8px;max-width:450px;min-width:300px;font-family:Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,0.6);}
#a11y-dialog-title{font-size:1.5em;font-weight:bold;color:#000 !important;margin:0 0 10px;}
#a11y-dialog-box p{color:#333 !important;margin:0 0 25px;font-size:1em;line-height:1.4;}
#a11y-dialog-box button{background:#4f46e5;color:#fff !important;border:none;padding:10px 15px;font-size:1em;border-radius:5px;cursor:pointer;margin-right:10px;transition:background 0.3s;}
#a11y-dialog-box button#a11y-btn-close{background:#e54646; margin-right: 0;}
#a11y-dialog-box button:focus{outline:3px solid #005fcc;outline-offset:2px;}`;
    d.head.append(s);

    // 2. Build Dialog Content
    const b = d.createElement('div');
    b.id = 'a11y-dialog-box';
    b.innerHTML = `<h2 id="a11y-dialog-title">A11y Quick Check Audit</h2>
<p>
    **Audit Method:** Select where you want to view the audit results.
    <br><br>
    The tool checks for crucial issues like missing labels, broken heading structure, and incorrect ARIA usage.
</p>
<button id="a11y-btn-here">Analyze Here</button>
<button id="a11y-btn-newtab">Analyze in New Tab</button>
<button id="a11y-btn-close">Close (Esc)</button>`;
    
    c.append(b);
    d.body.append(c);

    const btnHere = d.getElementById('a11y-btn-here');
    const btnNewTab = d.getElementById('a11y-btn-newtab');
    const btnClose = d.getElementById('a11y-btn-close');
    
    // Get focusable elements for trapping
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableEls = Array.from(b.querySelectorAll(focusableSelector)).filter(el => !el.disabled);
    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];

    const closeDialog = () => { c.remove(); s.remove(); };

    // Button Handlers
    btnHere.onclick = () => {
        // Load the run-on-page.js script to execute the audit in the current tab
        const script = d.createElement('script');
        script.src = toolUrl + 'run-on-page.js?v=' + Date.now();
        d.head.append(script);
        closeDialog();
    };

    btnNewTab.onclick = () => {
        // Encode and open the HTML in the hosted page for a dedicated analysis view
        const code = encodeURIComponent(d.documentElement.outerHTML);
        window.open(toolUrl + '#code=' + code, '_blank');
        closeDialog();
    };

    btnClose.onclick = closeDialog;

    // 3. Focus Trapping and Escape Logic
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            closeDialog();
            e.preventDefault();
        } else if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab: If focus is on the first focusable element, move to last
                if (d.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else {
                // Tab: If focus is on the last focusable element, move to first
                if (d.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        }
    };

    c.addEventListener('keydown', handleKeydown);
    
    // Set initial focus
    if (firstFocusableEl) {
        firstFocusableEl.focus();
    }

})(window.A11yQuickCheckToolUrl);  
