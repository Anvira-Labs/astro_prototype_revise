// Zodiac Bee — Onboarding: collects real details and computes a real sun
// sign from the date of birth (standard tropical zodiac boundaries) — the
// static prototype revealed "Aries, with a Capricorn moon" for every date
// typed in. Moon/rising placements need a full ephemeris lookup we don't
// have client-side, so the reveal says so instead of inventing one.
import { icon } from "../utils.js";
import { router } from "../router.js";
import { completeOnboarding, logInWithoutOnboarding } from "../store.js";

const SIGNS = [
  { sign: "Capricorn", endMonth: 1, endDay: 19, blurb: "Patient and long-game — you build things that are still standing years later." },
  { sign: "Aquarius", endMonth: 2, endDay: 18, blurb: "Independent and idea-first — you'd rather be right and early than agreeable and late." },
  { sign: "Pisces", endMonth: 3, endDay: 20, blurb: "Absorbent and intuitive — you read a room before anyone's said a word." },
  { sign: "Aries", endMonth: 4, endDay: 19, blurb: "Quick-start and action-first — you'd rather move and adjust than plan forever." },
  { sign: "Taurus", endMonth: 5, endDay: 20, blurb: "Steady and sensory — you commit slowly, then don't budge." },
  { sign: "Gemini", endMonth: 6, endDay: 20, blurb: "Curious and quick — you get bored of one lens on a problem fast." },
  { sign: "Cancer", endMonth: 7, endDay: 22, blurb: "Protective and tuned-in — you keep score of who showed up for you." },
  { sign: "Leo", endMonth: 8, endDay: 22, blurb: "Warm and unmistakably present — you do things wholeheartedly or not at all." },
  { sign: "Virgo", endMonth: 9, endDay: 22, blurb: "Precise and useful — you'd rather fix the thing quietly than get credit for noticing it." },
  { sign: "Libra", endMonth: 10, endDay: 22, blurb: "Fair-minded and relational — you weigh a decision from every seat at the table." },
  { sign: "Scorpio", endMonth: 11, endDay: 21, blurb: "Intense and all-or-nothing — you go deep on the things (and people) you trust." },
  { sign: "Sagittarius", endMonth: 12, endDay: 21, blurb: "Restless and honest — you'd rather have the true answer than the comfortable one." },
  { sign: "Capricorn", endMonth: 12, endDay: 31, blurb: "Patient and long-game — you build things that are still standing years later." }
];

// Aurora Bloom: each sign's classical element gets its own gradient for the
// "10 free tokens" card's top-border accent (see --card-accent in app.css,
// which every .card falls back to var(--gradient-sunrise) without) — a
// small, honest way to vary a card "per zodiac sign color" without
// inventing chart data this build doesn't have (see the README's real-vs-
// simulated section).
const SIGN_ELEMENT = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water"
};
const ELEMENT_GRADIENT = {
  fire: "linear-gradient(90deg, var(--sunrise-coral), var(--sunrise-amber))",
  earth: "linear-gradient(90deg, var(--sunrise-amber), var(--accent-teal))",
  air: "linear-gradient(90deg, var(--accent-teal), var(--sunrise-amber))",
  water: "linear-gradient(90deg, var(--accent-teal), var(--accent-violet))"
};

function sunSignFor(dateStr) {
  if (!dateStr) return null;
  const [, m, d] = dateStr.split("-").map(Number);
  if (!m || !d) return null;
  const entry = SIGNS.find((s) => m < s.endMonth || (m === s.endMonth && d <= s.endDay)) || SIGNS[SIGNS.length - 1];
  return entry;
}

const LOADING_LINES = ["Mapping the sky at your first breath…", "Calculating your houses…", "Placing your planets…", "Almost there…"];

export function renderOnboarding(shell) {
  shell.innerHTML = `
    <header class="onboard-topbar">
      <a class="wordmark" href="#/home">${icon.wordmark} Zodiac Bee</a>
      <div class="topbar-right">
        <span class="small">Already have an account? <button class="btn-text" id="loginLink" type="button">Log in</button></span>
        <button class="theme-toggle" data-theme-toggle aria-label="Toggle color theme">${icon.theme}</button>
      </div>
    </header>

    <main class="onboard-main">
      <div class="onboard-card">
        <svg class="constellation" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
          <line x1="40" y1="90" x2="110" y2="40" /><line x1="110" y1="40" x2="190" y2="70" />
          <line x1="190" y1="70" x2="260" y2="30" /><line x1="260" y1="30" x2="330" y2="60" />
          <line x1="190" y1="70" x2="150" y2="120" />
          <circle cx="40" cy="90" r="2.5" fill="currentColor" stroke="none"/><circle cx="110" cy="40" r="3" fill="currentColor" stroke="none"/>
          <circle cx="190" cy="70" r="2.5" fill="currentColor" stroke="none"/><circle cx="260" cy="30" r="3.5" fill="currentColor" stroke="none"/>
          <circle cx="330" cy="60" r="2.5" fill="currentColor" stroke="none"/><circle cx="150" cy="120" r="2" fill="currentColor" stroke="none"/>
        </svg>

        <div class="progress-steps" id="progressSteps">
          <span class="progress-dot is-active" data-step="1"></span>
          <span class="progress-dot" data-step="2"></span>
          <span class="progress-dot" data-step="3"></span>
          <span class="progress-dot" data-step="4"></span>
        </div>

        <section class="step-panel is-active" data-panel="1">
          <div class="page-head">
            <span class="eyebrow">Get your reading</span>
            <h1 class="h1">Let's chart your sky</h1>
            <p class="lede">Two minutes of details, and you'll have a natal chart your AI astrologer references in every conversation from here on.</p>
          </div>
          <div class="field">
            <label for="fName">Your name</label>
            <input id="fName" type="text" placeholder="Maya Iyer" />
            <span class="field-hint" id="fNameHint" hidden>Enter your name to continue.</span>
          </div>
          <div class="field">
            <label for="fContact">Phone or email</label>
            <input id="fContact" type="text" placeholder="maya@example.com" />
            <span class="field-hint" id="fContactHint">We verify by OTP to keep your 10 free tokens fraud-free.</span>
          </div>
          <div class="step-actions" style="justify-content:flex-end">
            <button class="btn btn-primary" data-next>Continue</button>
          </div>
        </section>

        <section class="step-panel" data-panel="2">
          <div class="page-head">
            <span class="eyebrow">Step 2 of 3</span>
            <h1 class="h1">When and where did your story start?</h1>
            <p class="lede">Your birth details generate a one-time natal chart we cache and reuse in every reading — we never ask again.</p>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="fDob">Date of birth</label>
              <input id="fDob" type="date" />
              <span class="field-hint" id="fDobHint" hidden>A date of birth is needed to chart your sky.</span>
            </div>
            <div class="field">
              <label for="fTob">Time of birth</label>
              <input id="fTob" type="time" />
            </div>
          </div>
          <label class="small" style="display:flex; align-items:center; gap:.5rem;">
            <input type="checkbox" id="fNoTime" style="width:1rem;height:1rem;" />
            I don't know my exact birth time — use a sun-sign-only chart instead
          </label>
          <p class="field-hint" id="noTimeHint" hidden>Skips your moon and rising sign for now — add your exact time later for a fuller reading.</p>
          <div class="field">
            <label for="fPob">Place of birth</label>
            <input id="fPob" type="text" placeholder="City, Country" />
            <span class="field-hint">Used only to calculate your chart's houses — never shown to other users.</span>
          </div>
          <div class="step-actions">
            <button class="btn btn-ghost" data-back>Back</button>
            <button class="btn btn-primary" data-next>Generate my chart</button>
          </div>
        </section>

        <section class="step-panel" data-panel="3">
          <div class="loading-row">
            <div class="spinner" aria-hidden="true"></div>
            <div>
              <h2 class="h2" id="loadingLine">${LOADING_LINES[0]}</h2>
              <p class="small" style="margin-top:.4rem">This only happens once — we cache the result.</p>
            </div>
          </div>
        </section>

        <section class="step-panel" data-panel="4">
          <div class="chart-reveal">
            <div class="sun-glyph">${icon.sun}</div>
            <div>
              <span class="eyebrow">Your sun sign</span>
              <h1 class="h1" id="revealHeadline"></h1>
              <p class="lede" style="margin:0 auto" id="revealBody"></p>
            </div>
            <div class="card" id="tokenRevealCard" style="width:100%; text-align:left; display:flex; align-items:center; gap:.85rem;">
              <div style="width:2.4rem;height:2.4rem;border-radius:50%;background:var(--brass-tint);display:grid;place-items:center;flex-shrink:0;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--brass-strong)" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.2"/></svg>
              </div>
              <div>
                <strong style="font-size:.92rem">10 free tokens are in your wallet</strong>
                <div class="small">One token per message — no card required to start.</div>
              </div>
            </div>
            <button class="btn btn-primary btn-block" id="startChatting">Start chatting</button>
            <button class="btn-text" id="exploreInstead">Explore the app instead</button>
          </div>
        </section>
      </div>
    </main>
  `;

  const panels = Array.from(shell.querySelectorAll(".step-panel"));
  const dots = Array.from(shell.querySelectorAll(".progress-dot"));
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let step = 1;

  const fName = shell.querySelector("#fName");
  const fContact = shell.querySelector("#fContact");
  const fDob = shell.querySelector("#fDob");
  const fTob = shell.querySelector("#fTob");
  const fPob = shell.querySelector("#fPob");
  const fNoTime = shell.querySelector("#fNoTime");
  const noTimeHint = shell.querySelector("#noTimeHint");

  fNoTime.addEventListener("change", () => {
    fTob.disabled = fNoTime.checked;
    noTimeHint.hidden = !fNoTime.checked;
    if (fNoTime.checked) fTob.value = "";
  });

  function showStep(n) {
    step = n;
    panels.forEach((p) => p.classList.toggle("is-active", Number(p.getAttribute("data-panel")) === n));
    dots.forEach((d) => {
      const s = Number(d.getAttribute("data-step"));
      d.classList.toggle("is-done", s < n);
      d.classList.toggle("is-active", s === n);
    });
  }

  function validateStep1() {
    const nameOk = fName.value.trim().length > 0;
    const contactOk = fContact.value.trim().length > 0;
    shell.querySelector("#fNameHint").hidden = nameOk;
    fName.style.borderColor = nameOk ? "" : "var(--warning)";
    fContact.style.borderColor = contactOk ? "" : "var(--warning)";
    return nameOk && contactOk;
  }

  function validateStep2() {
    const dobOk = fDob.value.trim().length > 0;
    shell.querySelector("#fDobHint").hidden = dobOk;
    fDob.style.borderColor = dobOk ? "" : "var(--warning)";
    return dobOk;
  }

  function runLoading() {
    let i = 0;
    const line = shell.querySelector("#loadingLine");
    line.textContent = LOADING_LINES[0];
    const stepMs = reducedMotion ? 0 : 450;
    const totalMs = reducedMotion ? 0 : 1900;
    const interval = window.setInterval(() => {
      i += 1;
      if (i < LOADING_LINES.length) line.textContent = LOADING_LINES[i];
    }, Math.max(stepMs, 1));
    window.setTimeout(() => {
      window.clearInterval(interval);
      applyReveal();
      showStep(4);
    }, totalMs);
  }

  function applyReveal() {
    const entry = sunSignFor(fDob.value) || SIGNS[3]; // Aries fallback if somehow no date
    const headline = shell.querySelector("#revealHeadline");
    const body = shell.querySelector("#revealBody");
    headline.textContent = entry.sign;
    body.textContent = fNoTime.checked
      ? entry.blurb + " Add your exact birth time later and we'll layer in your moon and rising sign."
      : entry.blurb + " Moon and rising placements need a full ephemeris lookup — we'll add those once that's connected.";

    const element = SIGN_ELEMENT[entry.sign];
    const tokenCard = shell.querySelector("#tokenRevealCard");
    if (tokenCard) tokenCard.style.setProperty("--card-accent", ELEMENT_GRADIENT[element] || "");

    shell.dataset.sunSign = entry.sign;
    shell.dataset.sunSignBody = body.textContent;
  }

  shell.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]")) {
      if (step === 1) {
        if (!validateStep1()) return;
        showStep(2);
      } else if (step === 2) {
        if (!validateStep2()) return;
        showStep(3);
        runLoading();
      }
    } else if (e.target.closest("[data-back]") && step > 1) {
      showStep(step - 1);
    }
  });

  function finish(destination) {
    completeOnboarding({
      name: fName.value.trim(),
      contact: fContact.value.trim(),
      dob: fDob.value,
      tob: fNoTime.checked ? "" : fTob.value,
      noTime: fNoTime.checked,
      pob: fPob.value.trim(),
      sunSign: shell.dataset.sunSign || "",
      sunSignHeadline: shell.dataset.sunSign || "",
      sunSignBody: shell.dataset.sunSignBody || ""
    });
    router.navigate(destination);
  }

  shell.querySelector("#startChatting").addEventListener("click", () => finish("chat"));
  shell.querySelector("#exploreInstead").addEventListener("click", () => finish("home"));
  shell.querySelector("#loginLink").addEventListener("click", () => {
    logInWithoutOnboarding();
    router.navigate("chat");
  });

  showStep(1);
}
