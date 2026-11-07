/**
 * Themestrap Emoticon
 *
 * An emoji picker and emoticon converter for text inputs and textareas, built for chat boxes,
 * comment forms and anything people type messages into. Typed emoticons such as :) or <3 and
 * names such as :fire: turn into emoji as you type, and a picker button opens a searchable
 * panel of emoji grouped by category, with the ones used most recently on top. Uses the
 * device's own emoji font: no images, no vendor dependencies.
 *
 * Markup:
 *
 *   <div class="input-group">
 *       <input type="text" class="form-control" data-plugin-emoticon
 *              data-plugin-options='{"buttonClass": "btn btn-outline-secondary"}'>
 *       <button class="btn btn-primary">Send</button>
 *   </div>
 *
 *   The picker button is inserted right after the input (or before it, see buttonPosition),
 *   which suits Bootstrap input groups. Point "trigger" at an existing button to use that
 *   one instead, or set "button": false for conversion only.
 *
 * Public API (via stored instance):
 *   const emo = $('#message').data('__pluginEmoticon');
 *   emo.open(); emo.close(); emo.toggle(); emo.isOpen();
 *   emo.insert('🎲');                  // at the caret, as if picked
 *   emo.convertValue();                // converts the whole value now, returns the instance
 *   emo.destroy();
 *
 * Static helpers (no instance needed):
 *   themestrap.PluginEmoticon.convert('nice :) <3 :fire:');   // 'nice 🙂 ❤️ 🔥'
 *   themestrap.PluginEmoticon.isEmojiOnly('🎉🎉');            // true, for big emoji in a chat
 *   themestrap.PluginEmoticon.search('heart');                 // [{ char, name, keywords }, ...]
 *   themestrap.PluginEmoticon.lookup(':tada:');                // '🎉'
 *
 * Events (native CustomEvent, bubbling, dispatched on the input):
 *   ts.emoticon.open      detail: { instance }
 *   ts.emoticon.close     detail: { instance }
 *   ts.emoticon.pick      detail: { instance, emoji, name }
 *   ts.emoticon.convert   detail: { instance, from, to }       (typed text turned into emoji)
 *
 * Keyboard:
 *   In the input    Escape closes the panel. Backspace right after a conversion puts the typed
 *                   text back.
 *   In the panel    Arrow keys move between emoji, Home / End jump, Enter or Space picks,
 *                   Escape closes and returns to the input, typing goes to the search box.
 *
 * CSS custom properties (all optional):
 *   --ts-emoticon-width, --ts-emoticon-height, --ts-emoticon-size, --ts-emoticon-radius,
 *   --ts-emoticon-bg, --ts-emoticon-border, --ts-emoticon-text, --ts-emoticon-muted,
 *   --ts-emoticon-hover, --ts-emoticon-accent, --ts-emoticon-shadow, --ts-emoticon-focus-ring,
 *   --ts-emoticon-z
 *
 * Init.js wiring:
 *   if (typeof $.fn['themestrapPluginEmoticon'] === 'function' && $('[data-plugin-emoticon]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-emoticon]:not(.manual)', 'themestrapPluginEmoticon');
 *   }
 */
// Emoticon
(((themestrap = {}, $) => {
    const instanceName = '__pluginEmoticon';
    const STYLE_ID = 'ts-emoticon-styles';
    const EVT_OPEN = 'ts.emoticon.open';
    const EVT_CLOSE = 'ts.emoticon.close';
    const EVT_PICK = 'ts.emoticon.pick';
    const EVT_CONVERT = 'ts.emoticon.convert';

    let instanceCount = 0;
    let seq = 0;

    // The emoji, one per line: the emoji, its name (also its :name: shortcode), then search words.
    // Kept to Unicode Emoji 13.0 so phones a few years old still draw every one of them.
    const CATEGORIES = [
        { key: 'smileys', label: 'Smileys', icon: '🙂', list: `
            😀 grinning smile happy
            😃 smiley happy joy
            😄 smile happy laugh
            😁 grin beaming teeth
            😆 laughing satisfied haha xd
            😅 sweat_smile relief phew
            🤣 rofl rolling laughing lol
            😂 joy tears laughing lol
            🙂 slight_smile smile
            🙃 upside_down silly sarcasm
            😉 wink
            😊 blush happy shy
            😇 innocent angel halo
            🥰 smiling_hearts love adore
            😍 heart_eyes love crush
            🤩 star_struck wow amazing
            😘 kiss love
            😋 yum tasty delicious
            😛 tongue playful
            😜 winking_tongue crazy joke
            🤪 zany crazy goofy wild
            🤑 money_mouth rich cash
            🤗 hug hugs
            🤭 hand_over_mouth oops giggle
            🤫 shush quiet secret
            🤔 thinking hmm think
            🤐 zipper_mouth secret quiet
            🤨 raised_eyebrow suspicious skeptical
            😐 neutral meh
            😑 expressionless blank
            😶 no_mouth silent speechless
            😏 smirk sly
            😒 unamused meh
            🙄 eye_roll whatever
            😬 grimace awkward yikes
            😌 relieved calm
            😔 pensive sad
            😴 sleeping tired zzz
            🥱 yawn bored tired
            😷 mask sick
            🤢 nauseated sick gross
            🥵 hot sweating
            🥶 cold freezing
            🥴 woozy dizzy
            🤯 mind_blown shocked exploding
            🤠 cowboy yeehaw
            🥳 partying celebrate birthday
            😎 sunglasses cool
            🤓 nerd geek
            🧐 monocle inspect fancy
            😕 confused
            😟 worried
            🙁 slight_frown sad
            😮 open_mouth wow surprised
            😲 astonished shocked
            😳 flushed embarrassed
            🥺 pleading puppy please
            😨 fearful scared
            😰 anxious nervous sweat
            😢 cry sad tear
            😭 sob crying sad
            😱 scream scared horror
            😖 confounded
            😣 persevere struggle
            😞 disappointed sad
            😩 weary tired
            😫 tired_face exhausted
            😤 triumph huff steam
            😠 angry mad
            😡 rage furious
            🤬 cursing swearing
            😈 smiling_imp devil evil
            💀 skull dead
            🤡 clown
            👻 ghost boo
            👽 alien
            🤖 robot
        ` },
        { key: 'gestures', label: 'Gestures', icon: '👍', list: `
            👍 thumbsup yes ok like good
            👎 thumbsdown no dislike bad
            👏 clap applause bravo
            🙌 raised_hands hooray celebrate
            👐 open_hands
            🤝 handshake deal agreed
            🙏 pray please thanks hope
            ✌️ v peace victory
            🤞 crossed_fingers luck hope
            🤟 love_you_gesture
            🤘 metal rock horns
            👌 ok_hand perfect
            🤌 pinched_fingers
            👈 point_left
            👉 point_right
            👆 point_up
            👇 point_down
            ☝️ index_up one wait
            ✋ raised_hand stop high_five
            👋 wave hello bye hi
            🤙 call_me shaka
            💪 muscle strong flex
            🤷 shrug dunno whatever
            🤦 facepalm ugh
            🙋 raising_hand me pick
            🙈 see_no_evil monkey
            🙉 hear_no_evil monkey
            🙊 speak_no_evil monkey
            👀 eyes look watching
            🧠 brain smart
        ` },
        { key: 'hearts', label: 'Hearts', icon: '❤️', list: `
            ❤️ heart love red
            🧡 orange_heart love
            💛 yellow_heart love
            💚 green_heart love
            💙 blue_heart love
            💜 purple_heart love
            🖤 black_heart love
            🤍 white_heart love
            🤎 brown_heart love
            💔 broken_heart heartbreak
            💕 two_hearts love
            💞 revolving_hearts love
            💓 heartbeat love
            💗 heartpulse love growing
            💖 sparkling_heart love
            💘 cupid love arrow
            💝 gift_heart love
            💋 kiss_mark lips
        ` },
        { key: 'games', label: 'Game night', icon: '🎲', list: `
            🎲 dice game roll luck
            🎯 bullseye target dart
            🎰 slot_machine jackpot casino
            🃏 joker card wild
            ♠️ spades card
            ♥️ hearts_suit card
            🏆 trophy win winner champion
            🥇 first_place gold medal winner
            🥈 second_place silver medal
            🥉 third_place bronze medal
            🎉 tada party celebrate hooray
            🎊 confetti_ball party celebrate
            🎈 balloon party
            🎁 gift present
            👑 crown king queen winner
            💯 hundred perfect score
            💰 moneybag money rich points
            💸 money_wings spend lost
            💎 gem diamond
            🍀 four_leaf_clover luck lucky
            🔥 fire hot lit streak
            💥 boom explosion bust
            ⭐ star
            🌟 glowing_star
            ✨ sparkles magic
            ⚡ zap lightning fast
            🚀 rocket launch
            💣 bomb
            🧨 firecracker
            🎮 video_game controller
            🏁 checkered_flag finish race
        ` },
        { key: 'food', label: 'Food and drink', icon: '🍕', list: `
            🍕 pizza
            🍔 hamburger burger
            🌭 hotdog
            🍟 fries
            🍿 popcorn movie
            🌮 taco
            🍩 doughnut donut
            🍪 cookie
            🎂 birthday_cake cake party
            🍫 chocolate
            🍺 beer drink
            🍻 beers cheers drink
            🥂 champagne toast cheers
            🍷 wine drink
            🍹 cocktail tropical drink
            ☕ coffee tea hot
            🥤 soda drink
        ` },
        { key: 'symbols', label: 'Symbols', icon: '✅', list: `
            ✅ check yes done ok
            ❌ x no wrong
            ❗ exclamation important
            ❓ question what
            ‼️ bangbang wow
            💤 zzz sleep
            💬 speech chat talk
            💭 thought think
            ⏳ hourglass wait
            ⏰ alarm_clock time hurry
            🔔 bell ding
            🎵 musical_note music
            🚩 red_flag warning
            ☠️ skull_crossbones danger
        ` }
    ];

    // Emoticons people type, swapped as soon as a space or punctuation follows. Only swapped
    // at the start of the text or after a space, so links (http://) and lists (b) stay as typed.
    const SHORTCUTS = {
        ':)': '🙂', ':-)': '🙂', ':]': '🙂', '(:': '🙂',
        ':(': '🙁', ':-(': '🙁',
        ':D': '😃', ':-D': '😃', 'XD': '😆', 'xD': '😆',
        ';)': '😉', ';-)': '😉',
        ':P': '😛', ':p': '😛', ':-P': '😛', ':-p': '😛', ';P': '😜', ';p': '😜',
        ':O': '😮', ':o': '😮', ':-O': '😮', ':-o': '😮',
        ":'(": '😢', ":'-(": '😢', 'T_T': '😭',
        ':|': '😐', ':-|': '😐',
        ':/': '😕', ':-/': '😕',
        '<3': '❤️', '</3': '💔',
        'B-)': '😎',
        ':*': '😘', ':-*': '😘',
        '>:(': '😠', '>:-(': '😠', '>:)': '😈',
        'O:)': '😇', 'o:)': '😇', 'O:-)': '😇',
        '^_^': '😊', '^^': '😊', '-_-': '😑', 'o_O': '😳', 'O_o': '😳', ':$': '😳'
    };

    // Parsed emoji, built once: { char, name, keywords, category }
    const EMOJI = [];
    const BY_NAME = Object.create(null);
    CATEGORIES.forEach((cat) => {
        cat.items = cat.list.trim().split('\n').map((line) => {
            const parts = line.trim().split(/\s+/);
            const item = { char: parts[0], name: parts[1], keywords: parts.slice(2), category: cat.key };
            EMOJI.push(item);
            BY_NAME[item.name] = item.char;
            return item;
        });
        delete cat.list;
    });
    // A few extra names people reach for
    Object.assign(BY_NAME, { '+1': '👍', '-1': '👎', 'thumbs_up': '👍', 'thumbs_down': '👎', 'party': '🥳', 'love': '😍', 'lol': '😂', 'poop': '💩', 'ok': '👌' });

    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const SPACE_BEFORE = '(^|[\\s(])';
    const SPACE_AFTER = '(?=$|[\\s.,!?;:)])';

    // Shortcuts as one pattern, longest first so >:( wins over :(
    function shortcutPattern(map, flags) {
        const keys = Object.keys(map).sort((a, b) => b.length - a.length).map(escapeRe);
        return keys.length ? new RegExp(`${SPACE_BEFORE}(${keys.join('|')})${SPACE_AFTER}`, flags) : null;
    }
    const SHORTCODE_RE = /:([a-z0-9_+-]{1,32}):/gi;

    // Emoji only: pictographs, flags, keycaps and the joiners and modifiers that build them
    const EMOJI_ONLY_RE = /^(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[#*0-9]️?⃣|[‍️\u{1F3FB}-\u{1F3FF}]|\s)+$/u;
    const PICTOGRAPH_RE = /\p{Extended_Pictographic}|\p{Regional_Indicator}{2}|[#*0-9]️?⃣/gu;

    const LIGHT = `
        --em-bg:      var(--ts-emoticon-bg, var(--ts-skin-surface, #ffffff));
        --em-border:  var(--ts-emoticon-border, var(--ts-skin-border, rgba(0,0,0,.14)));
        --em-text:    var(--ts-emoticon-text, var(--ts-skin-text, #1b1f24));
        --em-muted:   var(--ts-emoticon-muted, var(--ts-skin-text-dim, #6b7380));
        --em-hover:   var(--ts-emoticon-hover, var(--ts-skin-elevated, rgba(0,0,0,.07)));
        --em-accent:  var(--ts-emoticon-accent, var(--ts-skin-accent, #2185d0));
        --em-shadow:  var(--ts-emoticon-shadow, var(--ts-skin-shadow, 0 10px 30px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.08)));
        --em-ring:    var(--ts-emoticon-focus-ring, 0 0 0 3px var(--ts-skin-ring, rgba(33,133,208,.35)));
    `;
    const DARK = `
        --em-bg:      var(--ts-emoticon-bg, var(--ts-skin-surface, #1f242b));
        --em-border:  var(--ts-emoticon-border, var(--ts-skin-border, rgba(255,255,255,.14)));
        --em-text:    var(--ts-emoticon-text, var(--ts-skin-text, #e8eaed));
        --em-muted:   var(--ts-emoticon-muted, var(--ts-skin-text-dim, #9aa3ad));
        --em-hover:   var(--ts-emoticon-hover, var(--ts-skin-elevated, rgba(255,255,255,.10)));
        --em-accent:  var(--ts-emoticon-accent, var(--ts-skin-accent, #5aa9e6));
        --em-shadow:  var(--ts-emoticon-shadow, var(--ts-skin-shadow, 0 12px 32px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.35)));
        --em-ring:    var(--ts-emoticon-focus-ring, 0 0 0 3px var(--ts-skin-ring, rgba(90,169,230,.45)));
    `;

    const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif';

    const CSS_TEXT = `
        .ts-emoticon-panel, .ts-emoticon-toggle { ${LIGHT} }
        @media (prefers-color-scheme: dark) { .ts-emoticon-panel, .ts-emoticon-toggle { ${DARK} } }
        html.dark .ts-emoticon-panel, html.dark .ts-emoticon-toggle,
        [data-bs-theme="dark"] .ts-emoticon-panel, [data-bs-theme="dark"] .ts-emoticon-toggle { ${DARK} }
        [data-bs-theme="light"] .ts-emoticon-panel, [data-bs-theme="light"] .ts-emoticon-toggle { ${LIGHT} }

        .ts-emoticon-toggle .ts-emoticon-toggle-icon {
            font-family: ${EMOJI_FONT};
            font-size: 1.15em;
            line-height: 1;
        }

        .ts-emoticon-panel {
            position: absolute;
            z-index: var(--ts-emoticon-z, 1080);
            display: flex;
            flex-direction: column;
            width: var(--ts-emoticon-width, 21rem);
            max-width: calc(100vw - 1rem);
            height: var(--ts-emoticon-height, 22rem);
            max-height: calc(100vh - 2rem);
            background: var(--em-bg);
            color: var(--em-text);
            border: 1px solid var(--em-border);
            border-radius: var(--ts-emoticon-radius, var(--ts-skin-radius-lg, .75rem));
            box-shadow: var(--em-shadow);
            overflow: hidden;
            font-size: .875rem;
            transform-origin: var(--em-origin, bottom right);
            animation: ts-emoticon-in .14s ease-out;
        }
        .ts-emoticon-panel[hidden] { display: none; }
        @keyframes ts-emoticon-in {
            from { opacity: 0; transform: scale(.96); }
            to   { opacity: 1; transform: scale(1); }
        }

        .ts-emoticon-search { padding: .5rem .5rem .25rem; }
        .ts-emoticon-search input {
            width: 100%;
            padding: .35rem .6rem;
            border: 1px solid var(--em-border);
            border-radius: .5rem;
            background: transparent;
            color: inherit;
            font: inherit;
        }
        .ts-emoticon-search input:focus { outline: none; box-shadow: var(--em-ring); border-color: var(--em-accent); }

        .ts-emoticon-tabs {
            display: flex;
            gap: .125rem;
            padding: 0 .5rem;
            border-bottom: 1px solid var(--em-border);
        }
        .ts-emoticon-tab {
            flex: 1 1 0;
            padding: .3rem 0 .35rem;
            border: 0;
            border-bottom: 2px solid transparent;
            background: none;
            font-family: ${EMOJI_FONT};
            font-size: 1.15rem;
            line-height: 1.2;
            opacity: .6;
            cursor: pointer;
            transition: opacity .12s ease, border-color .12s ease;
        }
        .ts-emoticon-tab:hover { opacity: .9; }
        .ts-emoticon-tab[aria-selected="true"] { opacity: 1; border-bottom-color: var(--em-accent); }
        .ts-emoticon-tab:focus { outline: none; }
        .ts-emoticon-tab:focus-visible { box-shadow: inset var(--em-ring); }

        .ts-emoticon-body {
            flex: 1 1 auto;
            overflow-y: auto;
            overscroll-behavior: contain;
            padding: .25rem .5rem .5rem;
        }
        .ts-emoticon-heading {
            position: sticky;
            top: -.25rem;
            margin: 0;
            padding: .4rem .125rem .25rem;
            background: var(--em-bg);
            color: var(--em-muted);
            font-size: .75rem;
            font-weight: 600;
            letter-spacing: .02em;
        }
        .ts-emoticon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(2.25rem, 1fr));
        }
        .ts-emoticon-item {
            display: flex;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1;
            padding: 0;
            border: 0;
            border-radius: .5rem;
            background: none;
            font-family: ${EMOJI_FONT};
            font-size: var(--ts-emoticon-size, 1.5rem);
            line-height: 1;
            cursor: pointer;
            transition: background-color .1s ease, transform .1s ease;
            -webkit-tap-highlight-color: transparent;
        }
        .ts-emoticon-item:hover { background: var(--em-hover); transform: scale(1.12); }
        .ts-emoticon-item:focus { outline: none; }
        .ts-emoticon-item:focus-visible { background: var(--em-hover); box-shadow: var(--em-ring); }
        .ts-emoticon-empty { padding: 1.5rem .5rem; color: var(--em-muted); text-align: center; }

        .ts-emoticon-preview {
            display: flex;
            align-items: center;
            gap: .5rem;
            min-height: 2.25rem;
            padding: .3rem .75rem;
            border-top: 1px solid var(--em-border);
            color: var(--em-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ts-emoticon-preview-char { font-family: ${EMOJI_FONT}; font-size: 1.35rem; line-height: 1; }
        .ts-emoticon-preview-name { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .8rem; }
        .ts-emoticon-preview.is-hint .ts-emoticon-preview-name { font-family: inherit; }

        .ts-emoticon-sr {
            position: absolute !important;
            width: 1px; height: 1px;
            margin: -1px; padding: 0; border: 0;
            overflow: hidden;
            clip: rect(0 0 0 0);
            white-space: nowrap;
        }

        @media (prefers-reduced-motion: reduce) {
            .ts-emoticon-panel { animation: none; }
            .ts-emoticon-item, .ts-emoticon-tab { transition: none; }
            .ts-emoticon-item:hover { transform: none; }
        }
    `;

    const coarsePointer = () => window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const pretty = (name) => name.replace(/_/g, ' ');

    function dispatch(el, type, detail) {
        el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
    }

    function readRecent(key) {
        try {
            const list = JSON.parse(window.localStorage.getItem(key) || '[]');
            return Array.isArray(list) ? list.filter((c) => typeof c === 'string') : [];
        } catch (err) {
            return [];
        }
    }

    function writeRecent(key, list) {
        try {
            window.localStorage.setItem(key, JSON.stringify(list));
        } catch (err) {
            // Storage blocked, the recent row just lasts as long as the page
        }
    }

    class PluginEmoticon {
        constructor ($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el = $el;
            this._uid = ++seq;
            this._ns = `.tsemoticon${this._uid}`;
            this._open = false;
            this._lastSwap = null;
            this._caret = null;

            this
                .setData()
                .setOptions(opts)
                .build()
                .events();

            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            this.options = $.extend(true, {}, PluginEmoticon.defaults, opts, {
                wrapper: this.$el
            });
            const o = this.options;
            o.shortcutMap = $.extend({}, o.shortcuts ? SHORTCUTS : {}, o.extraShortcuts || {});
            this._shortcutRe = shortcutPattern(o.shortcutMap, '');
            this._shortcutEndRe = (() => {
                const keys = Object.keys(o.shortcutMap).sort((a, b) => b.length - a.length).map(escapeRe);
                return keys.length ? new RegExp(`${SPACE_BEFORE}(${keys.join('|')})$`) : null;
            })();
            return this;
        }

        build() {
            const self = this;
            const o = self.options;
            const input = self.$el[0];

            instanceCount++;
            if (!document.getElementById(STYLE_ID)) {
                const style = document.createElement('style');
                style.id = STYLE_ID;
                style.textContent = CSS_TEXT;
                document.head.appendChild(style);
            }

            if (!input.id) input.id = `ts-emoticon-input-${self._uid}`;
            const panelId = `ts-emoticon-panel-${self._uid}`;

            // The button that opens the panel: one of ours, or the page's own
            if (o.trigger) {
                self.$button = $(o.trigger).first();
                self._ownButton = false;
            } else if (o.button) {
                self.$button = $('<button type="button"></button>')
                    .addClass(`ts-emoticon-toggle ${o.buttonClass || ''}`.trim())
                    .append($('<span class="ts-emoticon-toggle-icon" aria-hidden="true"></span>').text(o.buttonIcon))
                    .append($('<span class="ts-emoticon-sr"></span>').text(o.labels.button));
                if (o.buttonPosition === 'before') self.$button.insertBefore(self.$el);
                else self.$button.insertAfter(self.$el);
                self._ownButton = true;
            } else {
                self.$button = $();
            }
            self.$button.attr({ 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': panelId });

            if (!self.$button.length) return this;

            // The panel lives in the nearest drawer, modal or offcanvas (so focus traps and
            // stacking keep working there), else in the body
            self.$container = o.container ? $(o.container).first()
                : self.$el.closest('[data-drawer-panel], .modal-dialog, .offcanvas, .ts-emoticon-container');
            if (!self.$container.length) self.$container = $(document.body);
            if (self.$container.css('position') === 'static') {
                self._madeRelative = true;
                self.$container.css('position', 'relative');
            }

            const $panel = $('<div class="ts-emoticon-panel" role="dialog" hidden></div>')
                .attr({ id: panelId, 'aria-label': o.labels.panel });

            if (o.search) {
                $('<div class="ts-emoticon-search"></div>')
                    .append($('<input type="search" autocomplete="off" spellcheck="false">')
                        .attr({ placeholder: o.labels.search, 'aria-label': o.labels.search }))
                    .appendTo($panel);
            }

            const $tabs = $('<div class="ts-emoticon-tabs" role="tablist"></div>').attr('aria-label', o.labels.categories);
            self._categories().forEach((cat) => {
                $('<button type="button" class="ts-emoticon-tab" role="tab" tabindex="-1"></button>')
                    .attr({ 'data-category': cat.key, title: cat.label, 'aria-label': cat.label, 'aria-selected': 'false' })
                    .text(cat.icon)
                    .appendTo($tabs);
            });
            $panel.append($tabs);
            $panel.append('<div class="ts-emoticon-body"></div>');
            if (o.preview) {
                $panel.append('<div class="ts-emoticon-preview" aria-hidden="true"><span class="ts-emoticon-preview-char"></span><span class="ts-emoticon-preview-name"></span></div>');
            }
            $panel.append('<span class="ts-emoticon-sr" aria-live="polite"></span>');

            self.$panel = $panel.appendTo(self.$container);
            self.$search = $panel.find('.ts-emoticon-search input');
            self.$body = $panel.find('.ts-emoticon-body');
            self.$live = $panel.find('[aria-live]');
            self._renderAll();
            return this;
        }

        events() {
            const self = this;
            const o = self.options;
            const input = self.$el[0];

            // Typed emoticons and :names:
            self.$el.on(`input${self._ns}`, function (e) {
                const type = e.originalEvent && e.originalEvent.inputType;
                if (type && type !== 'insertText' && type !== 'insertCompositionText') {
                    self._lastSwap = null;
                    return;
                }
                self._convertAtCaret();
            });

            self.$el.on(`keydown${self._ns}`, function (e) {
                if (e.key === 'Escape' && self._open) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.close();
                    return;
                }
                // Backspace right after a swap brings the typed text back
                const swap = self._lastSwap;
                if (e.key === 'Backspace' && swap && input.value === swap.value && input.selectionStart === swap.caret && input.selectionEnd === swap.caret) {
                    e.preventDefault();
                    const before = input.value.slice(0, swap.start);
                    const after = input.value.slice(swap.caret);
                    input.value = before + swap.from + after;
                    const caret = swap.start + swap.from.length;
                    input.setSelectionRange(caret, caret);
                    self._lastSwap = null;
                    return;
                }
                if (e.key === 'Enter' && o.convertOnSubmit && !e.shiftKey) self.convertValue();
                if (e.key === 'Delete' || e.key.startsWith('Arrow')) self._lastSwap = null;
            });

            // A message sent by button still gets its last emoticon swapped
            const form = input.form;
            if (form && o.convertOnSubmit) {
                self._onSubmit = () => self.convertValue();
                form.addEventListener('submit', self._onSubmit, true);
            }

            // Remember where the caret was, the panel takes focus away
            self.$el.on(`blur${self._ns} keyup${self._ns} click${self._ns}`, function () {
                if (typeof input.selectionStart === 'number') self._caret = [input.selectionStart, input.selectionEnd];
            });

            if (!self.$panel) return this;

            self.$button.on(`click${self._ns}`, function (e) {
                e.preventDefault();
                self.toggle();
            });

            self.$panel.on(`click${self._ns}`, '.ts-emoticon-item', function (e) {
                e.preventDefault();
                self._pick(this);
            });

            self.$panel.on(`click${self._ns}`, '.ts-emoticon-tab', function (e) {
                e.preventDefault();
                self._showCategory(this.getAttribute('data-category'), true);
            });

            self.$panel.on(`mouseenter${self._ns} focusin${self._ns}`, '.ts-emoticon-item', function () {
                self._preview(this);
            });

            self.$search.on(`input${self._ns}`, function () {
                self._filter(this.value);
            });

            self.$panel.on(`keydown${self._ns}`, function (e) {
                self._panelKey(e);
            });

            // Highlight the category scrolled into view
            self.$body.on(`scroll${self._ns}`, function () {
                if (self._scrollTimer) return;
                self._scrollTimer = setTimeout(() => {
                    self._scrollTimer = null;
                    self._syncTabs();
                }, 60);
            });

            // A click anywhere else closes the panel
            $(document).on(`pointerdown${self._ns}`, function (e) {
                if (!self._open) return;
                if (self.$panel[0].contains(e.target) || self.$button[0].contains(e.target)) return;
                self.close(false);
            });

            $(window).on(`resize${self._ns}`, function () {
                if (self._open) self._place();
            });

            return this;
        }

        // Opening and closing

        isOpen() {
            return this._open;
        }

        open() {
            const self = this;
            if (!self.$panel || self._open) return this;
            const input = self.$el[0];
            if (typeof input.selectionStart === 'number' && document.activeElement === input) {
                self._caret = [input.selectionStart, input.selectionEnd];
            }
            self._open = true;
            if (self.$search.length) {
                self.$search.val('');
                self._filter('');
            }
            self._renderRecent();
            self._preview(null);
            self.$panel.prop('hidden', false);
            self.$button.attr('aria-expanded', 'true');
            self._place();
            self.$body.scrollTop(0);
            self._syncTabs();
            // On phones the search box would bring up the keyboard and cover the panel
            if (self.$search.length && !coarsePointer()) self.$search[0].focus();
            else self._focusItem(0);
            dispatch(self.$el[0], EVT_OPEN, { instance: self });
            return this;
        }

        close(refocus = true) {
            const self = this;
            if (!self.$panel || !self._open) return this;
            self._open = false;
            self.$panel.prop('hidden', true);
            self.$button.attr('aria-expanded', 'false');
            if (refocus && !coarsePointer()) self._focusInput();
            dispatch(self.$el[0], EVT_CLOSE, { instance: self });
            return this;
        }

        toggle() {
            return this._open ? this.close() : this.open();
        }

        // Inserting and converting

        insert(emoji) {
            const self = this;
            const input = self.$el[0];
            const value = input.value;
            const max = input.maxLength > 0 ? input.maxLength : Infinity;
            self._inserted = false;
            if (value.length + emoji.length > max) {
                if (self.$live) self.$live.text(self.options.labels.full);
                return this;
            }
            self._inserted = true;
            let [start, end] = self._caret || [value.length, value.length];
            start = Math.min(start, value.length);
            end = Math.min(Math.max(end, start), value.length);
            input.value = value.slice(0, start) + emoji + value.slice(end);
            const caret = start + emoji.length;
            self._caret = [caret, caret];
            self._lastSwap = null;
            try {
                input.setSelectionRange(caret, caret);
            } catch (err) {
                // Some input types have no selection, the emoji is in anyway
            }
            // Lets the page react as if it was typed (a typing note, a character count)
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return this;
        }

        convertValue() {
            const self = this;
            const input = self.$el[0];
            const from = input.value;
            const to = PluginEmoticon.convert(from, { shortcuts: self.options.shortcutMap, shortcodes: self.options.shortcodes });
            if (to !== from) {
                input.value = to;
                self._lastSwap = null;
                dispatch(input, EVT_CONVERT, { instance: self, from, to });
            }
            return this;
        }

        destroy() {
            const self = this;
            const input = self.$el[0];
            self.close(false);
            clearTimeout(self._scrollTimer);
            self.$el.off(self._ns);
            $(document).off(self._ns);
            $(window).off(self._ns);
            if (self._onSubmit && input.form) input.form.removeEventListener('submit', self._onSubmit, true);
            if (self.$panel) self.$panel.remove();
            if (self._ownButton) self.$button.remove();
            else self.$button.off(self._ns).removeAttr('aria-haspopup aria-expanded aria-controls');
            if (self._madeRelative) self.$container.css('position', '');
            self.$el.removeData(instanceName);
            instanceCount = Math.max(0, instanceCount - 1);
            if (!instanceCount) $(`#${STYLE_ID}`).remove();
            return this;
        }

        // Inside

        _categories() {
            const o = this.options;
            const only = Array.isArray(o.categories) && o.categories.length ? o.categories : null;
            const cats = CATEGORIES.filter((c) => !only || only.includes(c.key)).map((c) => $.extend({}, c, { label: o.labels[c.key] || c.label }));
            if (o.recent) cats.unshift({ key: 'recent', label: o.labels.recent, icon: '🕘', items: [] });
            return cats;
        }

        _section(cat) {
            const $section = $('<section class="ts-emoticon-section"></section>').attr('data-category', cat.key);
            $('<h3 class="ts-emoticon-heading"></h3>').text(cat.label).appendTo($section);
            const $grid = $('<div class="ts-emoticon-grid" role="group"></div>').attr('aria-label', cat.label).appendTo($section);
            cat.items.forEach((item) => $grid.append(this._item(item)));
            return $section;
        }

        _item(item) {
            return $('<button type="button" class="ts-emoticon-item" tabindex="-1"></button>')
                .attr({ 'data-emoji': item.char, 'data-name': item.name, 'aria-label': pretty(item.name) })
                .text(item.char);
        }

        _renderAll() {
            const self = this;
            self.$body.empty();
            self._categories().forEach((cat) => self.$body.append(self._section(cat)));
            self._renderRecent();
        }

        _renderRecent() {
            const self = this;
            if (!self.options.recent || !self.$body) return;
            const $section = self.$body.find('.ts-emoticon-section[data-category="recent"]');
            const known = Object.create(null);
            EMOJI.forEach((e) => { known[e.char] = e; });
            const items = readRecent(self.options.recentKey)
                .slice(0, self.options.recentMax)
                .map((c) => known[c] || { char: c, name: 'emoji', keywords: [] });
            const $grid = $section.find('.ts-emoticon-grid').empty();
            items.forEach((item) => $grid.append(self._item(item)));
            $section.prop('hidden', !items.length);
            self.$panel.find('.ts-emoticon-tab[data-category="recent"]').prop('hidden', !items.length);
        }

        _filter(query) {
            const self = this;
            const q = String(query || '').trim().toLowerCase();
            self.$body.find('.ts-emoticon-results').remove();
            const $sections = self.$body.find('.ts-emoticon-section');
            self.$panel.find('.ts-emoticon-tabs').prop('hidden', Boolean(q));
            if (!q) {
                $sections.prop('hidden', false);
                self._renderRecent();
                return;
            }
            $sections.prop('hidden', true);
            const found = PluginEmoticon.search(q);
            const $results = $('<section class="ts-emoticon-section ts-emoticon-results"></section>');
            if (found.length) {
                const $grid = $('<div class="ts-emoticon-grid" role="group"></div>').attr('aria-label', self.options.labels.results).appendTo($results);
                found.forEach((item) => $grid.append(self._item(item)));
            } else {
                $('<div class="ts-emoticon-empty"></div>').text(self.options.labels.none).appendTo($results);
            }
            self.$body.prepend($results).scrollTop(0);
            self.$live.text(found.length ? `${found.length} ${self.options.labels.found}` : self.options.labels.none);
        }

        _showCategory(key, focus) {
            const self = this;
            const $section = self.$body.find(`.ts-emoticon-section[data-category="${key}"]`);
            if (!$section.length) return;
            self.$body.scrollTop($section[0].offsetTop - self.$body[0].offsetTop);
            self._syncTabs(key);
            if (focus) {
                const $first = $section.find('.ts-emoticon-item').first();
                if ($first.length) self._focusItem(self._items().index($first));
            }
        }

        _syncTabs(force) {
            const self = this;
            let current = force;
            if (!current) {
                const top = self.$body.scrollTop() + 8;
                self.$body.find('.ts-emoticon-section[data-category]:not([hidden])').each(function () {
                    if (this.offsetTop - self.$body[0].offsetTop <= top) current = this.getAttribute('data-category');
                });
            }
            self.$panel.find('.ts-emoticon-tab').each(function () {
                this.setAttribute('aria-selected', this.getAttribute('data-category') === current ? 'true' : 'false');
            });
        }

        _items() {
            return this.$body.find('.ts-emoticon-section:not([hidden]) .ts-emoticon-item');
        }

        _focusItem(index) {
            const $items = this._items();
            if (!$items.length) return;
            const i = Math.max(0, Math.min(index, $items.length - 1));
            $items.attr('tabindex', '-1');
            const el = $items.eq(i).attr('tabindex', '0')[0];
            el.focus({ preventScroll: false });
            this._preview(el);
        }

        _focusInput() {
            const input = this.$el[0];
            input.focus();
            if (this._caret) {
                try {
                    input.setSelectionRange(this._caret[0], this._caret[1]);
                } catch (err) {
                    // No selection on this input type
                }
            }
        }

        // The emoji under the pointer or focus, with its :name: to type it next time
        _preview(el) {
            if (!this.options.preview) return;
            this.$panel.find('.ts-emoticon-preview').toggleClass('is-hint', !el);
            this.$panel.find('.ts-emoticon-preview-char').text(el ? el.getAttribute('data-emoji') : '');
            this.$panel.find('.ts-emoticon-preview-name').text(el ? `:${el.getAttribute('data-name')}:` : this.options.labels.hint);
        }

        // Emoji per row, from the layout
        _columns() {
            const $items = this._items();
            if ($items.length < 2) return 1;
            const top = $items[0].offsetTop;
            let n = 0;
            $items.each(function () {
                if (this.offsetTop !== top) return false;
                n++;
                return true;
            });
            return Math.max(1, n);
        }

        _panelKey(e) {
            const self = this;
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                self.close();
                return;
            }
            const inSearch = e.target === self.$search[0];
            const $items = self._items();
            const index = $items.index(e.target);

            if (inSearch) {
                if (e.key === 'ArrowDown' || (e.key === 'Enter' && $items.length)) {
                    e.preventDefault();
                    if (e.key === 'Enter') self._pick($items[0]);
                    else self._focusItem(0);
                }
                return;
            }

            if (index < 0) return;
            const cols = self._columns();
            let next = null;
            switch (e.key) {
                case 'ArrowRight': next = index + 1; break;
                case 'ArrowLeft': next = index - 1; break;
                case 'ArrowDown': next = index + cols; break;
                case 'ArrowUp':
                    if (index < cols && self.$search.length) {
                        e.preventDefault();
                        self.$search[0].focus();
                        return;
                    }
                    next = index - cols;
                    break;
                case 'Home': next = 0; break;
                case 'End': next = $items.length - 1; break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    self._pick(e.target);
                    return;
                default:
                    // Letters go to the search box
                    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && self.$search.length) {
                        self.$search[0].focus();
                    }
                    return;
            }
            e.preventDefault();
            self._focusItem(Math.max(0, Math.min(next, $items.length - 1)));
        }

        _pick(el) {
            const self = this;
            const o = self.options;
            const emoji = el.getAttribute('data-emoji');
            const name = el.getAttribute('data-name');
            self.insert(emoji);
            if (!self._inserted) return;
            if (o.recent) {
                const list = readRecent(o.recentKey).filter((c) => c !== emoji);
                list.unshift(emoji);
                writeRecent(o.recentKey, list.slice(0, o.recentMax));
            }
            self.$live.text(`${pretty(name)} ${o.labels.added}`);
            dispatch(self.$el[0], EVT_PICK, { instance: self, emoji, name });
            if (o.closeOnPick) {
                self.close();
            } else {
                self._renderRecent();
                el.focus();
            }
        }

        // Places the panel above or below the input, whichever has more room, lined up with
        // the right edge of the button and kept inside the container
        _place() {
            const self = this;
            const anchorEl = (self.$el.closest('.input-group')[0] || self.$el[0]);
            const anchor = anchorEl.getBoundingClientRect();
            const button = self.$button[0].getBoundingClientRect();
            const box = self.$container[0].getBoundingClientRect();
            const isBody = self.$container[0] === document.body;
            const panel = self.$panel[0];
            const width = panel.offsetWidth;
            const height = panel.offsetHeight;
            const gap = 6;
            const viewH = window.innerHeight;

            const roomAbove = anchor.top;
            const roomBelow = viewH - anchor.bottom;
            const placement = self.options.placement;
            // Above by default, chat boxes sit at the bottom of the screen
            const above = placement === 'top' ? true : placement === 'bottom' ? false
                : roomAbove >= height + gap || roomAbove > roomBelow;

            const container = self.$container[0];
            const originX = isBody ? -window.scrollX : box.left + container.clientLeft - container.scrollLeft;
            const originY = isBody ? -window.scrollY : box.top + container.clientTop - container.scrollTop;
            const right = Math.max(button.right, anchor.left + Math.min(width, anchor.width));
            let left = right - width;
            const minLeft = (isBody ? 0 : box.left) + 8;
            const maxLeft = (isBody ? window.innerWidth : box.right) - width - 8;
            left = Math.max(minLeft, Math.min(left, maxLeft));
            let top = above ? anchor.top - height - gap : anchor.bottom + gap;
            top = Math.max(8, Math.min(top, viewH - height - 8));

            panel.style.left = `${Math.round(left - originX)}px`;
            panel.style.top = `${Math.round(top - originY)}px`;
            panel.style.setProperty('--em-origin', `${above ? 'bottom' : 'top'} right`);
        }

        // Swaps an emoticon or :name: that ends just before the caret
        _convertAtCaret() {
            const self = this;
            const o = self.options;
            const input = self.$el[0];
            const caret = input.selectionStart;
            if (typeof caret !== 'number' || caret !== input.selectionEnd || caret < 2) return;
            const value = input.value;
            const last = value.charAt(caret - 1);
            const head = value.slice(0, caret - 1);
            let start = -1;
            let from = '';
            let to = '';

            // An emoticon is swapped once a space or punctuation follows it
            if (o.shortcuts !== false && self._shortcutEndRe && /[\s.,!?;)]/.test(last)) {
                const m = head.match(self._shortcutEndRe);
                if (m) {
                    from = m[2];
                    to = o.shortcutMap[from];
                    start = head.length - from.length;
                }
            }
            // A :name: is swapped when its closing colon is typed
            if (!to && o.shortcodes && last === ':') {
                const m = value.slice(0, caret).match(/:([a-z0-9_+-]{1,32}):$/i);
                if (m && BY_NAME[m[1].toLowerCase()]) {
                    from = m[0];
                    to = BY_NAME[m[1].toLowerCase()];
                    start = caret - from.length;
                }
            }
            if (!to) return;

            // The space or punctuation that set off an emoticon stays, a :name: has none
            const tail = value.slice(start + from.length, caret);
            input.value = value.slice(0, start) + to + tail + value.slice(caret);
            const newCaret = start + to.length + tail.length;
            input.setSelectionRange(newCaret, newCaret);
            // Backspace now brings back what was typed, without the space
            self._lastSwap = { start, caret: newCaret, from, value: input.value };
            dispatch(input, EVT_CONVERT, { instance: self, from, to });
        }
    }

    // Turns emoticons and :names: in a string into emoji
    PluginEmoticon.convert = function (text, opts = {}) {
        let out = String(text == null ? '' : text);
        const map = opts.shortcuts === false ? null : (opts.shortcuts && typeof opts.shortcuts === 'object' ? opts.shortcuts : SHORTCUTS);
        if (map) {
            const re = shortcutPattern(map, 'g');
            if (re) out = out.replace(re, (all, space, key) => space + map[key]);
        }
        if (opts.shortcodes !== false) {
            out = out.replace(SHORTCODE_RE, (all, name) => BY_NAME[name.toLowerCase()] || all);
        }
        return out;
    };

    // True for text that is only emoji (at most max of them), handy for showing them big
    PluginEmoticon.isEmojiOnly = function (text, max = 3) {
        const value = String(text == null ? '' : text).trim();
        if (!value || !EMOJI_ONLY_RE.test(value)) return false;
        const count = (value.match(PICTOGRAPH_RE) || []).length;
        return count > 0 && count <= max;
    };

    // Emoji whose name or search words start with the query
    PluginEmoticon.search = function (query) {
        const q = String(query || '').trim().toLowerCase().replace(/^:|:$/g, '');
        if (!q) return [];
        const starts = [];
        const contains = [];
        EMOJI.forEach((item) => {
            const words = [item.name, ...item.name.split('_'), ...item.keywords];
            if (words.some((w) => w.startsWith(q))) starts.push(item);
            else if (item.name.includes(q)) contains.push(item);
        });
        return starts.concat(contains);
    };

    // The emoji for a :name: or name, or null
    PluginEmoticon.lookup = function (name) {
        const key = String(name || '').toLowerCase().replace(/^:|:$/g, '');
        return BY_NAME[key] || null;
    };

    PluginEmoticon.emoji = EMOJI;
    PluginEmoticon.shortcuts = SHORTCUTS;

    PluginEmoticon.defaults = {
        button: true,               // add a picker button next to the input
        buttonPosition: 'after',    // 'after' or 'before' the input
        buttonClass: 'btn btn-outline-secondary',
        buttonIcon: '🙂',
        trigger: null,              // selector of an existing button to open the picker instead
        container: null,            // where the panel goes, default the nearest drawer, modal or offcanvas, else the body
        placement: 'auto',          // 'auto', 'top' or 'bottom'
        search: true,               // search box at the top of the panel
        preview: true,              // name of the emoji under the pointer at the bottom
        categories: null,           // keys to show, for example ['smileys', 'games'], default all
        recent: true,               // a row of the emoji picked last
        recentMax: 16,
        recentKey: 'ts-emoticon-recent',
        closeOnPick: false,         // keep the panel open to pick several
        shortcuts: true,            // swap :) <3 and friends as you type
        extraShortcuts: {},         // more emoticons, for example {"(y)": "👍"}
        shortcodes: true,           // swap :name: as you type
        convertOnSubmit: true,      // swap what is left when Enter is pressed or the form is sent
        labels: {
            button: 'Add an emoji',
            panel: 'Emoji',
            search: 'Search emoji',
            categories: 'Emoji categories',
            recent: 'Recently used',
            results: 'Search results',
            none: 'No emoji found',
            found: 'emoji found',
            added: 'added',
            full: 'The message is full',
            hint: 'Tip: type :name: to add one without the picker'
        }
    };

    // Expose class to themestrap namespace
    $.extend(themestrap, {
        PluginEmoticon
    });

    // jQuery plugin method
    $.fn.themestrapPluginEmoticon = function (opts, ...args) {
        return this.map(function () {
            if (typeof opts === 'string') {
                const instance = $(this).data(instanceName);
                if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
                    return instance[opts](...args);
                }
                return instance;
            }

            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginEmoticon($this, opts);
            }
        });
    };
})).apply(this, [window.themestrap, jQuery]);
