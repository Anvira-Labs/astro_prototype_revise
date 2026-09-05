// Zodiac Bee — Wallet view: balance, recharge packs, payment method, ledger.
import { icon, showToast, wireModal, escapeHtml } from "../utils.js";
import { store, purchasePack, addCard, setDefaultCard, setAutoRecharge } from "../store.js";
import { initScrollReveal } from "../effects/bloom.js";

const PACKS = [
  { tokens: 50, price: "4.99" },
  { tokens: 150, price: "12.99", best: true },
  { tokens: 400, price: "29.99" }
];

const AUTO_OFF_TEXT =
  "Off — if your balance runs out before a scheduled daily send, delivery pauses and we'll notify you instead of charging your card automatically.";

function defaultCard() {
  const { savedCards, defaultCardId } = store.state.wallet;
  return savedCards.find((c) => c.id === defaultCardId) || null;
}

function autoOnText() {
  const card = defaultCard();
  return (
    "When a scheduled subscription send would take your balance negative, we top up your account with your default pack from your " +
    (card ? card.label : "default card") +
    " first, then send — so delivery never fails for lack of tokens."
  );
}

function ledgerRowHtml(entry) {
  const isCredit = entry.kind === "credit";
  return `
    <li class="ledger-row">
      <span class="ledger-icon ${entry.kind}">${isCredit ? icon.credit : icon.debit}</span>
      <span class="ledger-text"><strong>${escapeHtml(entry.label)}</strong><span class="fine">${escapeHtml(entry.detail)}</span></span>
      <span class="ledger-amount mono-stat ${isCredit ? "credit" : ""}">${isCredit ? "+" : "−"}${entry.amount}</span>
    </li>`;
}

export function renderWallet(main) {
  let selectedPack = PACKS.find((p) => p.best) || PACKS[0];

  main.innerHTML = `
    <div class="section">
      <div class="balance-hero">
        <div class="balance-hero-top">
          <div>
            <div class="eyebrow">Current balance</div>
            <div class="balance-figure"><span id="heroBalance"></span><sup>tokens</sup></div>
            <div class="balance-sub" id="heroSub"></div>
          </div>
        </div>
        <div class="balance-hero-actions">
          <button class="btn btn-primary" id="scrollToRecharge">Recharge tokens</button>
          <button class="btn btn-ghost" id="scrollToActivity">View activity</button>
        </div>
      </div>

      <div class="stack" id="recharge">
        <div class="page-head">
          <h2 class="h2">Recharge</h2>
          <p class="small">Choose a token pack. Tokens never expire.</p>
        </div>
        <div class="pack-grid" id="packGrid" role="radiogroup" aria-label="Token pack">
          ${PACKS.map(
            (p, i) => `
            <button class="pack-card" role="radio" data-tokens="${p.tokens}" data-price="${p.price}" aria-checked="${p === selectedPack}" data-reveal style="transition-delay:${i * 60}ms">
              ${p.best ? '<span class="pack-card-best">Best value</span>' : ""}
              <span class="pack-card-tokens mono-stat">${p.tokens} tokens</span>
              <span class="pack-card-price">$${p.price}</span>
            </button>`
          ).join("")}
        </div>
        <div class="recharge-summary">
          <span class="small" id="recSummary"></span>
          <button class="btn btn-primary btn-sm" id="recBtn">Recharge now</button>
        </div>
        <p class="fine">Illustrative pricing — no real payment processor is connected, so recharges are simulated locally.</p>
      </div>

      <div class="stack" data-reveal>
        <div class="page-head"><h2 class="h2">Payment method</h2></div>
        <div id="paymentMethodCard"></div>
        <p class="fine">In production, card capture happens in Stripe-hosted checkout — Zodiac Bee never stores your card number.</p>
      </div>

      <div class="stack">
        <div class="card" data-reveal>
          <div class="switch-row">
            <div>
              <h3 class="h3">Auto-recharge</h3>
              <p class="small" style="margin-top:.25rem">Never miss a daily send because of a low balance.</p>
            </div>
            <button class="switch" id="autoRechargeSwitch" role="switch" aria-label="Auto-recharge"></button>
          </div>
          <p class="explainer" id="autoRechargeExplainer"></p>
        </div>
      </div>

      <div class="stack" id="activity">
        <div class="page-head"><h2 class="h2">Recent activity</h2></div>
        <div class="card" data-reveal>
          <ul class="ledger-list" id="ledgerList"></ul>
        </div>
      </div>
    </div>

    <div class="modal-scrim" id="cardModalScrim">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="cardModalTitle">
        <div class="page-head">
          <h2 class="h2" id="cardModalTitle">Payment method</h2>
          <p class="small">Used for recharges and subscription auto-recharge.</p>
        </div>
        <div class="paymethod-picker" id="paymethodPicker" role="radiogroup" aria-label="Saved payment methods"></div>
        <div id="addCardForm" hidden>
          <div class="field">
            <label for="newCardLabel">Card nickname</label>
            <input id="newCardLabel" type="text" placeholder="Visa •••• 4242" />
            <span class="field-hint">No processor is connected — this is a label only, not a real card.</span>
          </div>
          <button class="btn btn-ghost btn-sm" id="confirmAddCard" type="button" style="margin-top:.6rem">Add card</button>
        </div>
        <button class="paymethod-add" id="addCardBtn" type="button">${icon.plus} Add a new card</button>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-close type="button">Cancel</button>
          <button class="btn btn-primary" id="cardModalConfirm" type="button">Set as default</button>
        </div>
      </div>
    </div>
  `;

  const heroBalance = main.querySelector("#heroBalance");
  const heroSub = main.querySelector("#heroSub");
  const packGrid = main.querySelector("#packGrid");
  const recSummary = main.querySelector("#recSummary");
  const recBtn = main.querySelector("#recBtn");
  const ledgerList = main.querySelector("#ledgerList");
  const autoSwitch = main.querySelector("#autoRechargeSwitch");
  const autoExplainer = main.querySelector("#autoRechargeExplainer");
  const paymentMethodCard = main.querySelector("#paymentMethodCard");
  const cardModalScrim = main.querySelector("#cardModalScrim");
  const paymethodPicker = main.querySelector("#paymethodPicker");
  const addCardBtn = main.querySelector("#addCardBtn");
  const addCardForm = main.querySelector("#addCardForm");
  const newCardLabel = main.querySelector("#newCardLabel");
  const confirmAddCard = main.querySelector("#confirmAddCard");
  const cardModalConfirm = main.querySelector("#cardModalConfirm");

  let pendingCardId = null;

  function renderBalance() {
    const balance = store.state.wallet.balance;
    heroBalance.textContent = balance;
    heroSub.textContent = "≈ " + balance + (balance === 1 ? " chat message remaining" : " chat messages remaining");
  }

  function renderSummary() {
    recSummary.innerHTML = `You'll get <strong>${selectedPack.tokens} tokens</strong> for <strong>$${selectedPack.price}</strong>`;
  }

  function renderPaymentMethod() {
    const card = defaultCard();
    paymentMethodCard.innerHTML = card
      ? `
        <div class="card">
          <div class="paymethod-row">
            <div class="card-glyph">${icon.cardGlyph}</div>
            <div class="paymethod-text">
              <strong>${escapeHtml(card.label)}</strong>
              <span class="small">Default for recharges and auto-recharge</span>
            </div>
            <button class="btn-text" id="changeCardBtn">Change</button>
          </div>
        </div>`
      : `<button class="paymethod-add" id="changeCardBtn" style="padding:1rem;">${icon.plus} Add a payment method</button>`;
    main.querySelector("#changeCardBtn").addEventListener("click", openCardModal);
  }

  function renderAutoRecharge() {
    const on = store.state.wallet.autoRecharge && !!defaultCard();
    autoSwitch.setAttribute("aria-checked", on ? "true" : "false");
    autoExplainer.textContent = defaultCard()
      ? on
        ? autoOnText()
        : AUTO_OFF_TEXT
      : "Add a payment method to turn this on.";
  }

  function renderLedger() {
    ledgerList.innerHTML = store.state.wallet.ledger.map(ledgerRowHtml).join("") || '<li class="ledger-row"><span class="small">No activity yet.</span></li>';
  }

  function renderPaymethodPicker() {
    paymethodPicker.innerHTML = store.state.wallet.savedCards
      .map(
        (c) => `
        <button class="paymethod-option" role="radio" data-card-id="${c.id}" aria-checked="${c.id === pendingCardId}">
          <span class="dot" aria-hidden="true"></span>
          <span class="paymethod-option-text"><strong>${escapeHtml(c.label)}</strong></span>
        </button>`
      )
      .join("");
  }

  const cardModal = wireModal(cardModalScrim, {
    onOpen() {
      pendingCardId = store.state.wallet.defaultCardId;
      addCardForm.hidden = true;
      newCardLabel.value = "";
      renderPaymethodPicker();
    }
  });
  function openCardModal() {
    cardModal.open();
  }

  packGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".pack-card");
    if (!card) return;
    packGrid.querySelectorAll(".pack-card").forEach((c) => c.setAttribute("aria-checked", "false"));
    card.setAttribute("aria-checked", "true");
    selectedPack = { tokens: Number(card.getAttribute("data-tokens")), price: card.getAttribute("data-price") };
    renderSummary();
  });

  recBtn.addEventListener("click", () => {
    recBtn.textContent = "Confirming…";
    recBtn.disabled = true;
    window.setTimeout(() => {
      purchasePack(selectedPack.tokens, selectedPack.price);
      showToast("Charged (simulated) — " + selectedPack.tokens + " tokens added");
      recBtn.textContent = "Recharge now";
      recBtn.disabled = false;
    }, 800);
  });

  autoSwitch.addEventListener("click", () => {
    if (!defaultCard()) {
      showToast("Add a payment method first.");
      return;
    }
    setAutoRecharge(!store.state.wallet.autoRecharge);
    renderAutoRecharge();
  });

  addCardBtn.addEventListener("click", () => {
    addCardForm.hidden = false;
    newCardLabel.focus();
  });

  confirmAddCard.addEventListener("click", () => {
    const label = newCardLabel.value.trim();
    if (!label) {
      showToast("Give the card a nickname first.");
      return;
    }
    const card = addCard(label);
    pendingCardId = card.id;
    addCardForm.hidden = true;
    renderPaymethodPicker();
  });

  paymethodPicker.addEventListener("click", (e) => {
    const opt = e.target.closest(".paymethod-option");
    if (!opt) return;
    pendingCardId = opt.getAttribute("data-card-id");
    renderPaymethodPicker();
  });

  cardModalConfirm.addEventListener("click", () => {
    if (pendingCardId) setDefaultCard(pendingCardId);
    cardModal.close();
    renderPaymentMethod();
    renderAutoRecharge();
    const card = defaultCard();
    if (card) showToast(card.label + " set as default payment method");
  });

  main.querySelector("#scrollToRecharge").addEventListener("click", () => main.querySelector("#recharge").scrollIntoView({ behavior: "smooth" }));
  main.querySelector("#scrollToActivity").addEventListener("click", () => main.querySelector("#activity").scrollIntoView({ behavior: "smooth" }));

  function renderAll() {
    renderBalance();
    renderPaymentMethod();
    renderAutoRecharge();
    renderLedger();
  }

  renderSummary();
  renderAll();

  const unsubscribe = store.subscribe(renderAll);
  const disconnectReveal = initScrollReveal(main);
  return () => {
    unsubscribe();
    disconnectReveal();
  };
}
