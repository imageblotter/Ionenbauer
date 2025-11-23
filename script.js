const SETTINGS = { maxSlots: 7 };

const CATIONS = [
    { sym: "Na", name: "Natrium", charge: +1 },
    { sym: "Li", name: "Lithium", charge: +1 },
    { sym: "K", name: "Kalium", charge: +1 },
    { sym: "Ca", name: "Calcium", charge: +2 },
    { sym: "Mg", name: "Magnesium", charge: +2 },
    { sym: "Al", name: "Aluminium", charge: +3 },
    { sym: "NH₄", name: "Ammonium", charge: +1, poly: true },
    { sym: "Fe", name: "Eisen(III)", charge: +3 },
    { sym: "Cu", name: "Kupfer(II)", charge: +2 },
    { sym: "Zn", name: "Zink", charge: +2 },
    { sym: "Ag", name: "Silber", charge: +1 },
    { sym: "Pb", name: "Blei(II)", charge: +2 },
    { sym: "Sn", name: "Zinn(II)", charge: +2 },
    { sym: "Ba", name: "Barium", charge: +2 },
    { sym: "Sr", name: "Strontium", charge: +2 }
];

const ANIONS = [
    { sym: "Cl", name: "Chlorid", charge: -1 },
    { sym: "Br", name: "Bromid", charge: -1 },
    { sym: "I", name: "Iodid", charge: -1 },
    { sym: "F", name: "Fluorid", charge: -1 },
    { sym: "O", name: "Oxid", charge: -2 },
    { sym: "S", name: "Sulfid", charge: -2 },
    { sym: "NO₃", name: "Nitrat", charge: -1, poly: true },
    { sym: "SO₄", name: "Sulfat", charge: -2, poly: true },
    { sym: "CO₃", name: "Carbonat", charge: -2, poly: true },
    { sym: "PO₄", name: "Phosphat", charge: -3, poly: true },
    { sym: "OH", name: "Hydroxid", charge: -1, poly: true },
    { sym: "CN", name: "Cyanid", charge: -1, poly: true },
    { sym: "MnO₄", name: "Permanganat", charge: -1, poly: true },
    { sym: "CrO₄", name: "Chromat", charge: -2, poly: true },
    { sym: "Cr₂O₇", name: "Dichromat", charge: -2, poly: true }
];

// State
let placed = Array(SETTINGS.maxSlots).fill(null);

// DOM Elements
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const cationPool = $("#cationPool");
const anionPool = $("#anionPool");
const slotsContainer = $("#slots");
const beaker = $("#beaker");
const feedbackText = $("#feedbackText");
const feedbackIcon = $("#feedbackIcon");
const resultsContainer = $("#results");

// Utility Functions
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function superscriptCharge(charge) {
    const n = Math.abs(charge);
    const sign = charge > 0 ? "+" : "−";
    return `<sup>${n === 1 ? "" : n}${sign}</sup>`;
}

function createIonHTML(ion) {
    return `<span class="chem font-bold text-lg">${ion.sym}${superscriptCharge(ion.charge)}</span>`;
}

// Initialization
function init() {
    fillPools();
    buildSlots();
    renderSlots();
    setupEventListeners();
}

function fillPools() {
    cationPool.innerHTML = "";
    anionPool.innerHTML = "";
    const c4 = shuffle(CATIONS).slice(0, 4);
    const a4 = shuffle(ANIONS).slice(0, 4);

    c4.forEach(ion => cationPool.appendChild(createToken(ion, 'cation')));
    a4.forEach(ion => anionPool.appendChild(createToken(ion, 'anion')));
}

function createToken(ion, type) {
    const btn = document.createElement('button');
    btn.className = `token group relative w-full aspect-square rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-1`;

    // Color coding based on charge type
    const colorClass = type === 'cation' ? 'text-blue-600' : 'text-emerald-600';
    const bgHover = type === 'cation' ? 'hover:border-blue-200 hover:bg-blue-50' : 'hover:border-emerald-200 hover:bg-emerald-50';

    bgHover.split(' ').forEach(cls => btn.classList.add(cls));

    btn.innerHTML = `
    <div class="${colorClass}">${createIonHTML(ion)}</div>
    <span class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">${ion.name}</span>
  `;

    // Data attributes for logic
    btn.dataset.sym = ion.sym;
    btn.dataset.name = ion.name;
    btn.dataset.charge = ion.charge;
    btn.dataset.poly = ion.poly || false;
    btn.dataset.type = type;

    // Pointer Events for Drag and Drop
    setupDraggable(btn, ion, type);

    return btn;
}

function buildSlots() {
    slotsContainer.innerHTML = "";
    placed = Array(SETTINGS.maxSlots).fill(null);
    const R = 38; // Radius in percent
    const n = SETTINGS.maxSlots;

    for (let i = 0; i < n; i++) {
        const angle = (-90 + (360 / n) * i) * Math.PI / 180;
        const left = 50 + R * Math.cos(angle);
        const top = 50 + R * Math.sin(angle);

        const slot = document.createElement('div');
        slot.className = "slot absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-dashed border-slate-300 bg-white/50 grid place-items-center cursor-pointer hover:bg-white transition-colors";
        slot.style.left = `${left}%`;
        slot.style.top = `${top}%`;
        slot.dataset.index = i;

        slot.addEventListener('click', () => clearSlot(i));

        slotsContainer.appendChild(slot);
    }
}

function renderSlots() {
    const slots = $$("#slots .slot");
    slots.forEach((slot, i) => {
        const ion = placed[i];
        if (ion) {
            const colorClass = ion.type === 'cation' ? 'text-blue-600' : 'text-emerald-600';
            slot.innerHTML = `<div class="${colorClass} animate-pop">${createIonHTML(ion)}</div>`;
            slot.dataset.filled = "true";
            slot.classList.remove("border-dashed", "border-slate-300", "bg-white/50");
            slot.classList.add("border-solid", "bg-white", "shadow-sm");
            if (ion.type === 'cation') slot.classList.add("border-blue-200");
            else slot.classList.add("border-emerald-200");
        } else {
            slot.innerHTML = "";
            slot.dataset.filled = "false";
            slot.className = "slot absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-dashed border-slate-300 bg-white/50 grid place-items-center cursor-pointer hover:bg-white transition-colors";
            // Re-apply positioning
            const R = 38, n = SETTINGS.maxSlots;
            const angle = (-90 + (360 / n) * i) * Math.PI / 180;
            slot.style.left = `${50 + R * Math.cos(angle)}%`;
            slot.style.top = `${50 + R * Math.sin(angle)}%`;
        }
    });
}

// Logic
function placeIntoFirstEmpty(ion, type) {
    const idx = placed.findIndex(x => x === null);
    if (idx === -1) {
        setFeedback(false, "Das Feld ist voll (max. 7 Ionen).");
        shake(beaker);
        return;
    }
    placed[idx] = { ...ion, type };
    renderSlots();
    clearFeedback();
}

function clearSlot(i) {
    if (placed[i]) {
        placed[i] = null;
        renderSlots();
        clearFeedback();
    }
}

function clearBoard() {
    placed.fill(null);
    renderSlots();
    clearFeedback();
    resultsContainer.innerHTML = "";
}

// Drag and Drop (Pointer Events)
let activeDrag = null;

function setupDraggable(el, ion, type) {
    el.addEventListener('pointerdown', e => {
        e.preventDefault(); // Prevent scrolling on touch

        // Create Avatar
        const rect = el.getBoundingClientRect();
        const avatar = el.cloneNode(true);
        avatar.style.width = `${rect.width}px`;
        avatar.style.height = `${rect.height}px`;
        avatar.classList.add('drag-avatar');
        document.body.appendChild(avatar);

        activeDrag = {
            el: el,
            avatar: avatar,
            ion: ion,
            type: type,
            startX: e.clientX,
            startY: e.clientY,
            hasMoved: false
        };

        moveAvatar(e.clientX, e.clientY);
        el.setPointerCapture(e.pointerId);
        el.classList.add('opacity-50');
    });

    el.addEventListener('pointermove', e => {
        if (!activeDrag) return;
        e.preventDefault();

        // Check if moved significantly (more than 5px) to consider it a drag
        const dx = e.clientX - activeDrag.startX;
        const dy = e.clientY - activeDrag.startY;
        if (Math.sqrt(dx * dx + dy * dy) > 5) {
            activeDrag.hasMoved = true;
        }

        moveAvatar(e.clientX, e.clientY);

        // Highlight drop zones
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const slot = target?.closest('.slot');
        const beakerZone = target?.closest('#beaker');

        $$('.slot').forEach(s => s.classList.remove('drag-over'));
        if (slot && !placed[slot.dataset.index]) {
            slot.classList.add('drag-over');
        } else if (beakerZone) {
            beaker.classList.add('border-blue-400');
        } else {
            beaker.classList.remove('border-blue-400');
        }
    });

    el.addEventListener('pointerup', e => {
        if (!activeDrag) return;

        const target = document.elementFromPoint(e.clientX, e.clientY);
        const slot = target?.closest('.slot');
        const beakerZone = target?.closest('#beaker');

        if (slot) {
            const idx = parseInt(slot.dataset.index);
            if (!placed[idx]) {
                placed[idx] = { ...activeDrag.ion, type: activeDrag.type };
                renderSlots();
                clearFeedback();
            } else {
                // Slot full, try to find another empty one if dropped on beaker generally
                placeIntoFirstEmpty(activeDrag.ion, activeDrag.type);
            }
        } else if (beakerZone) {
            placeIntoFirstEmpty(activeDrag.ion, activeDrag.type);
        } else if (!activeDrag.hasMoved) {
            // It was a click (or very short drag), so treat as click-to-add
            placeIntoFirstEmpty(activeDrag.ion, activeDrag.type);
        }

        // Cleanup
        activeDrag.avatar.remove();
        activeDrag.el.classList.remove('opacity-50');
        activeDrag.el.releasePointerCapture(e.pointerId);
        activeDrag = null;

        $$('.slot').forEach(s => s.classList.remove('drag-over'));
        beaker.classList.remove('border-blue-400');
    });

    // Cancel on lost pointer capture
    el.addEventListener('pointercancel', e => {
        if (activeDrag) {
            activeDrag.avatar.remove();
            activeDrag.el.classList.remove('opacity-50');
            activeDrag = null;
        }
    });
}

function moveAvatar(x, y) {
    if (activeDrag && activeDrag.avatar) {
        activeDrag.avatar.style.left = `${x}px`;
        activeDrag.avatar.style.top = `${y}px`;
    }
}

function shake(el) {
    el.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
    ], { duration: 300 });
}

// Feedback & Validation
function setFeedback(ok, text) {
    feedbackText.textContent = text;
    if (ok === true) {
        feedbackIcon.textContent = "check_circle";
        feedbackIcon.className = "material-icons text-3xl text-emerald-500";
        feedbackText.className = "text-emerald-700 font-medium";
    } else if (ok === false) {
        feedbackIcon.textContent = "error";
        feedbackIcon.className = "material-icons text-3xl text-rose-500";
        feedbackText.className = "text-rose-700 font-medium";
    } else {
        feedbackIcon.textContent = "info";
        feedbackIcon.className = "material-icons text-3xl text-slate-400";
        feedbackText.className = "text-slate-600";
    }
}

function clearFeedback() {
    setFeedback(null, "Füge Ionen hinzu und klicke auf 'Kombinieren'.");
}

$("#combineBtn").addEventListener('click', () => {
    const used = placed.filter(Boolean);
    if (used.length === 0) {
        setFeedback(false, "Das Feld ist leer.");
        shake(beaker);
        return;
    }

    const total = used.reduce((s, i) => s + i.charge, 0);
    const hasCation = used.some(i => i.charge > 0);
    const hasAnion = used.some(i => i.charge < 0);
    const ok = (total === 0) && hasCation && hasAnion;

    if (ok) {
        const formula = buildFormula(used);
        showFormulaResult(formula, true);
        setFeedback(true, "Perfekt! Die Ladung ist ausgeglichen.");
        confettiEffect();
    } else {
        resultsContainer.innerHTML = "";
        if (!hasCation || !hasAnion) {
            setFeedback(false, "Du brauchst sowohl Kationen als auch Anionen.");
        } else {
            setFeedback(false, `Die Ladung ist nicht 0 (Aktuell: ${total > 0 ? '+' : ''}${total}).`);
        }
        shake(beaker);
    }
});

function buildFormula(ions) {
    const groups = { c: new Map(), a: new Map() };
    ions.forEach(i => {
        const kind = i.charge > 0 ? 'c' : 'a';
        const key = i.sym;
        if (!groups[kind].has(key)) groups[kind].set(key, { sym: i.sym, poly: !!i.poly, count: 0 });
        groups[kind].get(key).count += 1;
    });

    const fmt = ({ sym, poly, count }) => {
        if (count === 1) return sym;
        return (poly ? `(${sym})` : sym) + `<sub>${count}</sub>`;
    };

    const cat = [...groups.c.values()].map(fmt).join('');
    const an = [...groups.a.values()].map(fmt).join('');
    return cat + an;
}

function showFormulaResult(formula, ok) {
    resultsContainer.innerHTML = `
    <div class="flex items-center justify-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 animate-pop">
      <span class="text-3xl chem font-bold text-emerald-800">${formula}</span>
    </div>
  `;
}

function setupEventListeners() {
    $("#resetBtn").addEventListener('click', clearBoard);
    $("#newSet").addEventListener('click', () => {
        fillPools();
        clearBoard();
    });
}

// Simple confetti
function confettiEffect() {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    for (let i = 0; i < 30; i++) {
        const el = document.createElement('div');
        el.style.position = 'fixed';
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.width = '8px';
        el.style.height = '8px';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.borderRadius = '50%';
        el.style.zIndex = '10000';
        document.body.appendChild(el);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 10;
        const tx = Math.cos(angle) * 100 * (Math.random() + 0.5);
        const ty = Math.sin(angle) * 100 * (Math.random() + 0.5);

        el.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => el.remove();
    }

}

// Fullscreen Logic
const fullscreenBtn = $("#fullscreenBtn");
const fullscreenIcon = fullscreenBtn ? fullscreenBtn.querySelector("span") : null;

function log(msg) {
    console.log("[Fullscreen Debug]", msg);
}

function toggleFullscreen() {
    log("toggleFullscreen called");
    const doc = window.document;
    const docEl = doc.documentElement;
    log(`fullscreenEnabled: ${doc.fullscreenEnabled || doc.webkitFullscreenEnabled || doc.mozFullScreenEnabled || doc.msFullscreenEnabled}`);

    // Check for existing fullscreen element
    const fullscreenElement = doc.fullscreenElement ||
        doc.mozFullScreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement;

    log(`Current fullscreenElement: ${fullscreenElement}`);

    if (!fullscreenElement) {
        log("Attempting to ENTER fullscreen...");
        // Try to enter fullscreen
        if (docEl.requestFullscreen) {
            log("Using standard requestFullscreen");
            docEl.requestFullscreen().then(() => {
                log("Standard requestFullscreen Promise resolved");
            }).catch(err => {
                log(`Standard Error: ${err.message} (${err.name})`);
                alert(`Fehler: ${err.message}`);
            });
        } else if (docEl.webkitRequestFullscreen) {
            log("Using webkitRequestFullscreen");
            docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
            log("Using mozRequestFullScreen");
            docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
            log("Using msRequestFullscreen");
            docEl.msRequestFullscreen();
        } else {
            log("No fullscreen API found on element");
            alert("Vollbildmodus wird von diesem Browser nicht unterstützt.");
        }
    } else {
        log("Attempting to EXIT fullscreen...");
        // Try to exit fullscreen
        if (doc.exitFullscreen) {
            log("Using standard exitFullscreen");
            doc.exitFullscreen().catch(err => {
                log(`Exit Error: ${err.message}`);
            });
        } else if (doc.webkitExitFullscreen) {
            log("Using webkitExitFullscreen");
            doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
            log("Using mozCancelFullScreen");
            doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
            log("Using msExitFullscreen");
            doc.msExitFullscreen();
        }
    }
}

const updateFullscreenButton = (e) => {
    log(`Event fired: ${e.type}`);
    const isFullscreen = document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

    if (!isFullscreen) {
        if (fullscreenIcon) fullscreenIcon.textContent = "fullscreen";
        if (fullscreenBtn) fullscreenBtn.setAttribute("aria-label", "Vollbild aktivieren");
        log("State: Normal");
    } else {
        if (fullscreenIcon) fullscreenIcon.textContent = "fullscreen_exit";
        if (fullscreenBtn) fullscreenBtn.setAttribute("aria-label", "Vollbild verlassen");
        log("State: Fullscreen");
    }
};

// Initialization Check
console.log("Script loaded. Checking for fullscreen button...");
if (fullscreenBtn) {
    console.log("Fullscreen button found:", fullscreenBtn);
    fullscreenBtn.addEventListener('click', (e) => {
        console.log("Button clicked (event listener)");
        toggleFullscreen();
    });
} else {
    console.error("CRITICAL: Fullscreen button NOT found in DOM!");
    alert("Fehler: Vollbild-Button nicht gefunden!");
}

document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('MSFullscreenChange', updateFullscreenButton);

// Run
init();
