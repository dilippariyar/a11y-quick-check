/* This is the full content for your fixed 'dialog.js' file */

(function(toolUrl) {
    const d = document;
    
    // Safety check for duplication
    if (d.getElementById('a11y-dialog-container')) { return; }

    const c = d.createElement('div');
    c.id = 'a11y-dialog-container';
    c.setAttribute('role', 'dialog');
    c.setAttribute('aria-modal', 'true');
    c.setAttribute('aria-labelledby', 'a11y-dialog-title');
    c.setAttribute('aria-describedby', 'a11y-dialog-instructions a11y-sited-tester-info a11y-disclaimer a11y-mode-selector'); 
    
    // Backdrop style
    c.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;';

    // 1. Inject Styles (Only adding styles for the new radio group)
    const s = d.createElement('style');
    s.textContent = `
/* ... (Existing styles remain unchanged) ... */
#a11y-dialog-box{
    background:#111827; /* Dark background */
    color:#f3f4f6 !important; /* Light text */
    padding:35px; /* More padding */
    border-radius:15px;
    max-width:600px; /* Larger size */
    min-width:400px;
    font-family:Verdana, Geneva, sans-serif;
    box-shadow:0 15px 50px rgba(79, 70, 229, 0.7); /* Vibrant shadow */
    border: 4px solid #4f46e5; /* Strong accent border */
    font-size: 1.2em; /* Bigger base font size */
}
#a11y-dialog-title{
    font-size:2.0em; /* Extra large heading */
    font-weight:bold;
    color:#f3f4f6 !important;
    margin:0 0 20px;
    outline: none;
}
#a11y-dialog-box p{
    color:#e5e7eb !important;
    margin:0 0 28px;
    line-height:1.7; /* Increased line height for readability */
}
#a11y-dialog-box button{
    background:#4f46e5; /* Primary Button */
    color:#fff !important;
    border:none;
    padding:15px 25px; /* Largest buttons */
    font-size:1.2em;
    border-radius:8px;
    cursor:pointer;
    margin-right:20px;
    transition:background 0.3s, box-shadow 0.3s;
    font-weight: bold;
}
#a11y-dialog-box button#a11y-btn-close{
    background:#dc2626; /* Red Close Button */
    margin-right: 0;
}
#a11y-dialog-box button:focus{
    outline:5px solid #00c0ff; /* Super strong focus indicator */
    outline-offset:3px;
    box-shadow: 0 0 10px #00c0ff;
}
#a11y-dialog-instructions, #a11y-sited-tester-info {
    color: #a5b4fc !important; /* Lighter blue/purple for instruction text */
    font-size: 1.0em;
    margin-top: 10px;
    display: block;
}
/* Disclaimer Alert Styling */
#a11y-disclaimer {
    border: 1px solid #dc2626;
    background-color: #450a0a;
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;
    color: #fca5a5 !important;
    font-size: 1.0em;
    margin-top: 20px;
    margin-bottom: 0px !important;
    line-height: 1.4;
}
/* New Radio Group Styling */
#a11y-mode-selector {
    margin: 30px 0;
    padding: 15px;
    border: 2px solid #4f46e5;
    border-radius: 8px;
    background-color: #0d121c;
}
#a11y-mode-selector label {
    margin-right: 25px;
    display: inline-block;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: normal;
    color: #f3f4f6 !important;
}
#a11y-mode-selector input[type="radio"] {
    margin-right: 8px;
    transform: scale(1.5); /* Larger radio buttons for easier selection */
}

/* Background Blur Implementation */
body.a11y-dialog-open > *:not(#a11y-dialog-container):not(style) {
    filter: blur(6px) brightness(0.6); /* Stronger blur and darken background */
    transition: filter 0.4s ease-out;
    pointer-events: none;
}
    `;
    d.head.append(s);

    // 2. Build Dialog Content
    const b = d.createElement('div');
    b.id = 'a11y-dialog-box';
    b.innerHTML = `
<h2 id="a11y-dialog-title" tabindex="-1">A11y Quick Check Audit Tool</h2>
<p>
    Welcome to the A11y Quick Check bookmarklet. This tool executes a quick, non-destructive, semantic accessibility audit on the current webpage by injecting invisible, screen reader-friendly messages directly next to any detected issue.
</p>
<div id="a11y-mode-selector" role="radiogroup" aria-labelledby="a11y-mode-title">
    <strong id="a11y-mode-title" style="display:block; margin-bottom: 12px; font-size: 1.2em;">Select Audit Mode:</strong>
    <label for="mode-full">
        <input type="radio" id="mode-full" name="auditMode" value="fullAudit.js" checked>
        Full Audit (All Messages)
    </label>
    <label for="mode-error-only">
        <input type="radio" id="mode-error-only" name="auditMode" value="errorOnlyAudit.js">
        Error Only Audit (Low Noise, Screen Reader Focus)
    </label>
</div>

<p id="a11y-sited-tester-info">
    Sited testers can read the audit result for any element by hovering the mouse over the element. Screen reader users can read the invisible audit message by moving down through the content.
</p>
<p id="a11y-disclaimer">
    <strong style="color: inherit;">ALERT: Do not rely 100% on this tool as it only analyses the HTML code.</strong>
</p>
<button id="a11y-btn-here">Analyze Page in Selected Mode</button>
<button id="a11y-btn-newtab">Analyze in New Tab (External Tool)</button>
<button id="a11y-btn-close">Close Dialog</button>
<span id="a11y-dialog-instructions" aria-hidden="true">
    Press the Escape key to close this dialog without running the audit.
</span>`;
    
    c.append(b);
    d.body.append(c);
    d.body.classList.add('a11y-dialog-open'); 

    const btnHere = d.getElementById('a11y-btn-here');
    const btnNewTab = d.getElementById('a11y-btn-newtab');
    const btnClose = d.getElementById('a11y-btn-close');
    const dialogTitle = d.getElementById('a11y-dialog-title');
    
    // Get focusable elements for trapping
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    // Re-query focusable elements to include the new radio buttons
    const focusableEls = [dialogTitle, ...Array.from(b.querySelectorAll(focusableSelector)).filter(el => !el.disabled)];
    
    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1]; 

    const closeDialog = () => { 
        c.remove(); 
        s.remove(); 
        d.body.classList.remove('a11y-dialog-open');
    };

    // Button Handlers
    btnHere.onclick = () => {
        // --- KEY LOGIC CHANGE ---
        const selectedMode = d.querySelector('input[name="auditMode"]:checked').value;
        const script = d.createElement('script');
        script.src = toolUrl + selectedMode + '?v=' + Date.now();
        d.head.append(script);
        closeDialog();
    };

    btnNewTab.onclick = () => {
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
                if (d.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else {
                if (d.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        }
    };

    c.addEventListener('keydown', handleKeydown);
    
    // Set initial focus to the heading
    if (dialogTitle) {
        dialogTitle.focus();
    }

})(window.A11yQuickCheckToolUrl);
