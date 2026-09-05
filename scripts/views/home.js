// Zodiac Bee — Home view: tile grid entry point into each module.
// Nav links below are plain `href="#/…"` anchors — that string already is
// the route, so native hash navigation (which the router listens for via
// `hashchange`) is all that's needed; no click interception required.
import { icon } from "../utils.js";
import { store } from "../store.js";

export function renderHome(main) {
  const name = store.state.profile.name.trim();
  const greeting = name ? "Welcome back, " + name.split(" ")[0] : "Welcome back";

  main.innerHTML = `
    <div class="section section-wide">
      <div class="home-hero page-head">
        <span class="hero-orb" aria-hidden="true"></span>
        <span class="eyebrow">${greeting}</span>
        <h1 class="h1" style="margin-top:.4rem;">Where do you want to go?</h1>
        <p class="lede" style="margin-top:.5rem;">Jump into a conversation, manage your tokens, or check in on today's reading.</p>
      </div>

      <div class="tile-grid">
        <a class="tile-card" href="#/chat">
          <span class="tile-icon" aria-hidden="true">${icon.chat}</span>
          <span class="tile-text">
            <strong>Chat</strong>
            <span>Ask about your chart, a transit, or a decision.</span>
          </span>
          ${icon.arrow}
        </a>

        <a class="tile-card" href="#/wallet">
          <span class="tile-icon" aria-hidden="true">${icon.wallet}</span>
          <span class="tile-text">
            <strong>Wallet</strong>
            <span>Balance, recharge packs, and auto-recharge.</span>
          </span>
          ${icon.arrow}
        </a>

        <a class="tile-card" href="#/subscription">
          <span class="tile-icon" aria-hidden="true">${icon.subscription}</span>
          <span class="tile-text">
            <strong>Daily reading</strong>
            <span>Manage your subscription and delivery channels.</span>
          </span>
          ${icon.arrow}
        </a>

        <a class="tile-card" href="#/products">
          <span class="tile-icon" aria-hidden="true">${icon.products}</span>
          <span class="tile-text">
            <strong>Picks</strong>
            <span>Astrologer-curated products worth a look.</span>
          </span>
          ${icon.arrow}
        </a>

        <div class="tile-card is-disabled" aria-disabled="true">
          <span class="tile-icon" aria-hidden="true">${icon.peopleDisabled}</span>
          <span class="tile-text">
            <span class="tile-text-head"><strong>Peer-to-peer</strong><span class="badge badge-muted">Coming soon</span></span>
            <span>Live 1:1 sessions with an astrologer — arriving in a later release.</span>
          </span>
        </div>
      </div>
    </div>
  `;
}
