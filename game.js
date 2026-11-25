'use strict';

(() => {
  /* =======================================================================
     Constants
     ======================================================================= */

  const SAVE_KEY = 'gugumi.pet.save.v1';
  const DEFAULT_NAME = '咕咕咪';
  const MAX_NAME_LEN = 8;
  const MAX_CHAT = 30;
  const MAX_MESSAGE_LEN = 80;
  const AWAY_CAP_MS = 8 * 60 * 60 * 1000;
  const DECAY = {
    hunger: 1 / 60,
    thirst: 1 / 75,
    mood: 1 / 100
  };
  const OFFLINE_RATE = 0.4;
  const OFFLINE_CAPS = { hunger: 30, thirst: 25, mood: 20 };
  const START = { hunger: 82, thirst: 76, mood: 86 };

  const LEVELS = [
    { at: 0, title: '陌生小鸡' },
    { at: 12, title: '饭搭子' },
    { at: 30, title: '跟屁虫' },
    { at: 55, title: '黏人精' },
    { at: 85, title: '小祖宗' },
    { at: 120, title: '少爷鸡' },
    { at: 165, title: '心头肉' },
    { at: 220, title: '终身饭票' }
  ];

  const FOODS = {
    fish: {
      name: '小鱼干',
      icon: 'i-fish',
      hunger: 26,
      mood: 6,
      bond: 3,
      lines: [
        '小鱼干！咔嚓咔嚓，是海的味道。',
        '先咬尾巴，再咬脑袋。完美。',
        '这条鱼干很有嚼劲，本鸡批准了。'
      ]
    },
    corn: {
      name: '玉米粒',
      icon: 'i-corn',
      hunger: 18,
      mood: 3,
      bond: 2,
      lines: [
        '玉米粒嘎嘣脆，鸡的部分表示很满意。',
        '一颗一颗吃才显得有修养。',
        '甜丝丝的，再来一把也不是不行。'
      ]
    },
    rice: {
      name: '饭团',
      icon: 'i-rice',
      hunger: 34,
      mood: 4,
      bond: 3,
      lines: [
        '饭团！这个尺寸对我很友好。',
        '海苔归你，米饭归我。成交。',
        '吃完这团，我的肚皮又要圆一圈了。'
      ]
    }
  };

  const QUICK_CHATS = [
    '你好呀',
    '你饿不饿？',
    '你是猫还是鸡？',
    '我要当少爷位',
    '摸摸你',
    '晚安',
    '我喜欢你'
  ];

  const FULL_LINES = [
    '肚皮已经圆成一个鸡窝啦，待会儿再吃。',
    '再吃就要从鸡变成球了……虽然也不赖。',
    '暂时塞不下了。让我的胃先开个小会。'
  ];

  const DRINK_FULL_LINES = [
    '喝不下啦，我现在一晃就能听见水声。',
    '再喝一口就要从嘴巴里溢出来了。',
    '水饱了水饱了，谢谢这位热心少爷。'
  ];

  const PET_LINES = [
    '咕噜咕噜……对，就是下巴那里。',
    '再挠三下，我就考虑让你当正式铲屎官。',
    '摸头可以，摸鸡冠要另外收费。',
    '本鸡勉强享受一下。嗯，继续。',
    '这里也痒，那里也痒。你看着办。'
  ];

  const CHAT_OPEN_LINES = [
    '想聊什么？本鸡今天心情不错，可以听你讲两句。',
    '来，坐。本少爷正好有点无聊。',
    '咕咕？要我表演一个睁眼发呆吗？'
  ];

  const IDLE_GENERIC = [
    '我要当少爷位！',
    '看什么看，没见过猫头鸡身的小怪兽吗？',
    '今天也是圆圆的一天。',
    '你忙你的，我负责发呆。',
    '喵咕。没什么事，就是叫一声。',
    '地板缝里好像有小鱼干的味道……',
    '翅膀有点痒，扑棱两下。',
    '我在思考一个很深奥的问题：下一顿吃什么。',
    '这个插座看起来不能吃，但我还是想闻闻。',
    '我喜欢你。……这句话我只说一次，没听到就算了。'
  ];

  const IDLE_HUNGRY = [
    '咕……肚子刚才叫了一声，你听见了吗？',
    '我没有催饭。我只是用眼神催饭。',
    '如果现在有一块小鱼干从天而降，我会非常感谢。'
  ];

  const IDLE_THIRSTY = [
    '想喝水。最好是有冰块的那种。',
    '嗓子里像住了一只小沙鸡。',
    '水碗看起来有点空，我只是随口一提。'
  ];

  const IDLE_LONELY = [
    '陪我玩五分钟嘛，就五分钟。',
    '地板有点凉，你的手比较暖和。',
    '我刚刚数完了自己的羽毛，好无聊。'
  ];

  const LEVEL_UP_LINES = {
    2: '升级！我现在是「饭搭子」了，以后吃饭记得叫我。',
    3: '升级成「跟屁虫」啦。你走到哪，我跟到哪，主要是跟饭碗。',
    4: '「黏人精」参上！这不是黏你，是黏小鱼干。',
    5: '升到「小祖宗」了。从今天起，请开始你的伺候。',
    6: '「少爷鸡」登基！我要当少爷位！',
    7: '变成「心头肉」了。哼，勉强承认你也是我的心头肉。',
    8: '满级「终身饭票」！这辈子你都得养我了。'
  };

  const DEFAULT_REPLIES = [
    '喵咕？我假装听懂了，并郑重地点了点头。',
    '这个问题有点难。容我先舔一下爪子再回答。',
    '你说话的时候，我的鸡冠认真晃了两下。',
    '我要当少爷位！……啊，你刚才说什么？',
    '嗯嗯，有道理。所以今天吃什么？',
    '我在听。我只是同时在思考晚饭。',
    '本鸡虽然不会打字，但很会等你说完。',
    '这个话题先记下，等我当了少爷再处理。'
  ];

  /* A gentle 16-bar chiptune loop, written as data so it is easy to tweak. */
  const MUSIC = {
    bpm: 84,
    bars: 16,
    stepsPerBar: 8,
    chords: [
      { root: 48, tones: [64, 67, 71] },
      { root: 45, tones: [60, 64, 67] },
      { root: 41, tones: [57, 60, 64] },
      { root: 43, tones: [59, 62, 65] },
      { root: 48, tones: [64, 67, 71] },
      { root: 40, tones: [55, 59, 62] },
      { root: 41, tones: [57, 60, 64] },
      { root: 43, tones: [59, 62, 65] },
      { root: 41, tones: [57, 60, 64] },
      { root: 43, tones: [59, 62, 65] },
      { root: 40, tones: [55, 59, 62] },
      { root: 45, tones: [60, 64, 67] },
      { root: 41, tones: [57, 60, 64] },
      { root: 43, tones: [59, 62, 65] },
      { root: 48, tones: [64, 67, 71] },
      { root: 48, tones: [64, 67, 71] }
    ],
    arpPatterns: [
      [0, 2, 1, 3, 1, 2, 3, 1],
      [0, 1, 2, 3, 2, 1, 3, 2]
    ],
    melody: [
      { step: 0, midi: 76, len: 3 },
      { step: 4, midi: 79, len: 2 },
      { step: 6, midi: 81, len: 2 },
      { step: 8, midi: 79, len: 4 },
      { step: 12, midi: 76, len: 2 },
      { step: 14, midi: 74, len: 2 },
      { step: 16, midi: 72, len: 3 },
      { step: 20, midi: 69, len: 2 },
      { step: 22, midi: 72, len: 2 },
      { step: 24, midi: 74, len: 4 },
      { step: 28, midi: 71, len: 2 },
      { step: 30, midi: 67, len: 2 },
      { step: 32, midi: 76, len: 3 },
      { step: 36, midi: 79, len: 3 },
      { step: 40, midi: 83, len: 4 },
      { step: 44, midi: 79, len: 2 },
      { step: 46, midi: 76, len: 2 },
      { step: 48, midi: 81, len: 3 },
      { step: 52, midi: 79, len: 2 },
      { step: 54, midi: 76, len: 2 },
      { step: 56, midi: 74, len: 4 },
      { step: 60, midi: 71, len: 2 },
      { step: 62, midi: 67, len: 2 },
      { step: 64, midi: 76, len: 2 },
      { step: 66, midi: 72, len: 2 },
      { step: 68, midi: 69, len: 4 },
      { step: 72, midi: 74, len: 2 },
      { step: 74, midi: 71, len: 2 },
      { step: 76, midi: 67, len: 4 },
      { step: 80, midi: 76, len: 2 },
      { step: 82, midi: 79, len: 2 },
      { step: 84, midi: 71, len: 2 },
      { step: 86, midi: 76, len: 2 },
      { step: 88, midi: 69, len: 2 },
      { step: 90, midi: 72, len: 2 },
      { step: 92, midi: 76, len: 4 },
      { step: 96, midi: 69, len: 3 },
      { step: 100, midi: 72, len: 2 },
      { step: 102, midi: 76, len: 2 },
      { step: 104, midi: 71, len: 2 },
      { step: 106, midi: 74, len: 2 },
      { step: 108, midi: 79, len: 4 },
      { step: 112, midi: 76, len: 3 },
      { step: 116, midi: 79, len: 2 },
      { step: 118, midi: 72, len: 2 },
      { step: 120, midi: 72, len: 4 },
      { step: 124, midi: 76, len: 4 }
    ]
  };

  const MELODY_BY_STEP = new Map(MUSIC.melody.map((note) => [note.step, note]));

  const COLORS = {
    outline: '#4b3223',
    outlineSoft: '#63432d',
    bodyDark: '#d8a651',
    bodyBase: '#efc978',
    bodyLight: '#ffe5a6',
    chest: '#fff0c6',
    chestShade: '#f3dcaa',
    wingBase: '#e6b45f',
    wingLight: '#f8d991',
    feet: '#e8a64f',
    feetDark: '#b9732f',
    claw: '#fff1c9',
    headBase: '#efbe6b',
    headLight: '#ffdda0',
    headShadow: '#daa44e',
    earInner: '#e69a8e',
    comb: '#dd4d46',
    combLight: '#f57467',
    combDark: '#aa3330',
    eye: '#2c221c',
    eyeShine: '#fff9e8',
    nose: '#cf7b80',
    mouth: '#6f4633',
    whisker: '#fff8e5',
    whiskerShade: '#ad855e',
    blush: '#efa595'
  };

  /* =======================================================================
     State
     ======================================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const random = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const codePoints = (value) => Array.from(String(value || ''));

  const els = {};
  let state = null;
  let lastAwayMs = 0;
  let foodTrayOpen = false;
  let nameModalMode = 'create';
  let actionLocked = false;
  let actionLockTimer = null;
  let isTyping = false;
  let typingEl = null;
  let bubbleHideTimer = null;
  let bubbleIsVisible = false;
  let typingReplyTimer = null;
  let levelToastTimer = null;
  let nextChatBondAt = 0;
  let nextIdleAt = Infinity;
  let lastTick = Date.now();
  let resetting = false;
  let saveWarned = false;

  const lastPicks = new Map();

  /* =======================================================================
     Audio
     ======================================================================= */

  const AudioKit = {
    ctx: null,
    muted: false,
    musicGain: null,
    musicFilter: null,
    musicWanted: false,
    musicTimer: null,
    musicStep: 0,
    nextMusicTime: 0,

    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return;
      }
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      try {
        this.ctx = new AudioCtor();
      } catch (error) {
        this.ctx = null;
      }
    },

    setMuted(value) {
      this.muted = Boolean(value);
      if (this.muted) this.stopMusic();
    },

    ensureMusicNodes() {
      if (!this.ctx) return;
      if (this.musicGain) return;
      try {
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.0001;
        this.musicFilter = this.ctx.createBiquadFilter();
        this.musicFilter.type = 'lowpass';
        this.musicFilter.frequency.value = 2400;
        this.musicFilter.Q.value = 0.4;
        this.musicGain.connect(this.musicFilter);
        this.musicFilter.connect(this.ctx.destination);
      } catch (error) {
        this.musicGain = null;
        this.musicFilter = null;
      }
    },

    fadeMusic(target) {
      if (!this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const gain = this.musicGain.gain;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(Math.max(0.0001, gain.value), now);
      gain.setTargetAtTime(target, now, 0.35);
    },

    startMusic() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      this.ensureMusicNodes();
      if (!this.musicGain) return;
      this.musicWanted = true;

      if (this.musicTimer) {
        this.fadeMusic(0.65);
        return;
      }

      const begin = () => {
        if (!this.musicWanted || this.muted || !this.ctx || this.musicTimer) return;
        this.fadeMusic(0.65);
        this.musicStep = 0;
        this.nextMusicTime = this.ctx.currentTime + 0.12;
        this.musicTimer = window.setInterval(() => this.scheduleMusic(), 100);
        this.scheduleMusic();
      };

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(begin).catch(() => {});
      } else if (this.ctx.state === 'running') {
        begin();
      }
    },

    stopMusic() {
      this.musicWanted = false;
      if (this.musicTimer) {
        window.clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
      if (this.ctx && this.musicGain) {
        const now = this.ctx.currentTime;
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setTargetAtTime(0.0001, now, 0.12);
      }
    },

    scheduleMusic() {
      const audio = this.ctx;
      if (!audio || this.muted || !this.musicWanted) return;
      const stepDuration = 60 / MUSIC.bpm / 2;
      if (this.nextMusicTime < audio.currentTime - 0.25) {
        this.nextMusicTime = audio.currentTime + 0.05;
      }
      while (this.nextMusicTime < audio.currentTime + 0.6) {
        this.scheduleMusicStep(this.musicStep, this.nextMusicTime);
        this.nextMusicTime += stepDuration;
        this.musicStep = (this.musicStep + 1) % (MUSIC.bars * MUSIC.stepsPerBar);
      }
    },

    scheduleMusicStep(step, time) {
      if (!this.ctx || !this.musicGain) return;
      const stepDuration = 60 / MUSIC.bpm / 2;
      const bar = Math.floor(step / MUSIC.stepsPerBar) % MUSIC.bars;
      const stepInBar = step % MUSIC.stepsPerBar;
      const chord = MUSIC.chords[bar];
      if (!chord) return;

      if (stepInBar === 0) {
        this.musicNote(chord.root, time, stepDuration * 3.8, 'sine', 0.012, 0.02, 0);
        chord.tones.forEach((tone, index) => {
          this.musicNote(
            tone,
            time,
            stepDuration * 7.6,
            'triangle',
            0.0021,
            0.2,
            (index - 1) * 0.1
          );
        });
      } else if (stepInBar === 4) {
        this.musicNote(chord.root + 7, time, stepDuration * 3.8, 'sine', 0.0105, 0.02, 0);
      }

      if (bar !== 7 && bar !== 15) {
        const arp = [
          chord.tones[0] + 12,
          chord.tones[1] + 12,
          chord.tones[2] + 12,
          chord.tones[0] + 24
        ];
        const pattern = MUSIC.arpPatterns[bar % MUSIC.arpPatterns.length];
        const arpNote = arp[pattern[stepInBar]];
        if (arpNote != null) {
          this.musicNote(
            arpNote,
            time,
            stepDuration * 0.78,
            'triangle',
            0.0058,
            0.006,
            stepInBar % 2 === 0 ? -0.22 : 0.22
          );
        }
      }

      const melodyNote = MELODY_BY_STEP.get(step);
      if (melodyNote) {
        this.musicNote(
          melodyNote.midi,
          time,
          stepDuration * melodyNote.len * 0.94,
          'square',
          0.0078,
          0.012,
          0
        );
      }
    },

    musicNote(midi, start, duration, type, volume, attack, pan) {
      const audio = this.ctx;
      if (!audio || !this.musicGain || this.muted) return;
      try {
        const safeDuration = Math.max(0.05, duration);
        const osc = audio.createOscillator();
        const env = audio.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(440 * Math.pow(2, (midi - 69) / 12), start);
        env.gain.setValueAtTime(0.0001, start);
        env.gain.exponentialRampToValueAtTime(
          Math.max(0.0002, volume),
          start + Math.max(0.004, attack)
        );
        env.gain.exponentialRampToValueAtTime(0.0001, start + safeDuration);
        osc.connect(env);

        if (audio.createStereoPanner) {
          const panner = audio.createStereoPanner();
          panner.pan.value = clamp(pan || 0, -1, 1);
          env.connect(panner);
          panner.connect(this.musicGain);
        } else {
          env.connect(this.musicGain);
        }

        osc.start(start);
        osc.stop(start + safeDuration + 0.05);
      } catch (error) {
        /* the music is decorative; never break the pet for it */
      }
    },

    tone(freq, duration, options = {}) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const audio = this.ctx;
      if (audio.state === 'suspended') audio.resume().catch(() => {});

      const type = options.type || 'square';
      const volume = options.volume == null ? 0.025 : options.volume;
      const delay = options.delay || 0;
      const start = audio.currentTime + delay;

      try {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(1, freq), start);
        if (options.to) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(1, options.to), start + duration);
        }
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(start);
        osc.stop(start + duration + 0.03);
      } catch (error) {
        /* audio is decoration; never break the game for it */
      }
    },

    click() {
      this.tone(520, 0.045, { type: 'square', volume: 0.013 });
    },

    chirp() {
      this.tone(660, 0.055, { type: 'triangle', volume: 0.012, to: 760 });
    },

    munch() {
      this.tone(155, 0.065, { type: 'square', volume: 0.026, to: 110 });
      this.tone(130, 0.07, { type: 'square', volume: 0.024, delay: 0.15, to: 95 });
      this.tone(165, 0.055, { type: 'square', volume: 0.02, delay: 0.31, to: 120 });
    },

    drink() {
      this.tone(430, 0.1, { type: 'sine', volume: 0.024, to: 660 });
      this.tone(520, 0.09, { type: 'sine', volume: 0.02, delay: 0.22, to: 760 });
    },

    pet() {
      this.tone(620, 0.08, { type: 'sine', volume: 0.018 });
      this.tone(780, 0.1, { type: 'sine', volume: 0.016, delay: 0.12 });
      this.tone(920, 0.09, { type: 'sine', volume: 0.012, delay: 0.25 });
    },

    send() {
      this.tone(620, 0.045, { type: 'square', volume: 0.012 });
    },

    receive() {
      this.tone(510, 0.06, { type: 'triangle', volume: 0.015 });
      this.tone(700, 0.075, { type: 'triangle', volume: 0.013, delay: 0.08 });
    },

    level() {
      const notes = [523, 659, 784, 1046];
      notes.forEach((note, index) => {
        this.tone(note, 0.14, {
          type: 'square',
          volume: 0.018,
          delay: index * 0.1
        });
      });
    },

    nope() {
      this.tone(190, 0.09, { type: 'square', volume: 0.02, to: 120 });
    }
  };

  /* =======================================================================
     Init
     ======================================================================= */

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheElements();
    buildFoodOptions();
    buildQuickChips();
    bindEvents();
    bindCanvas();

    const saved = loadSave();
    if (saved) {
      state = saved;
      lastAwayMs = applyOfflineDecay(state);
      AudioKit.setMuted(Boolean(state.muted));
      updateUI();
      restoreChat();
      handleReturnGreeting();
      nextIdleAt = Date.now() + random(32000, 58000);
      saveGame();
    } else {
      state = createDefaultState();
      AudioKit.setMuted(false);
      updateUI();
      openNameModal('create');
    }

    lastTick = Date.now();
    requestAnimationFrame(renderLoop);
    window.setInterval(gameTick, 1000);
    window.setInterval(maybeIdleChatter, 1000);
    window.setInterval(() => {
      if (state && state.onboarded) saveGame();
    }, 15000);
  }

  function cacheElements() {
    els.canvas = $('#petCanvas');
    els.ctx = els.canvas.getContext('2d');
    els.stageWrap = $('#stageWrap');
    els.speechBubble = $('#speechBubble');
    els.floatLayer = $('#floatLayer');
    els.levelToast = $('#levelToast');
    els.levelToastTitle = $('#levelToastTitle');
    els.appTitle = $('#appTitle');
    els.levelChip = $('#levelChip');
    els.soundBtn = $('#soundBtn');
    els.petNameLabel = $('#petNameLabel');
    els.editNameBtn = $('#editNameBtn');
    els.moodChip = $('#moodChip');
    els.moodText = $('#moodText');
    els.statusHint = $('#statusHint');
    els.hungerRow = $('#hungerRow');
    els.thirstRow = $('#thirstRow');
    els.moodRow = $('#moodRow');
    els.hungerFill = $('#hungerFill');
    els.thirstFill = $('#thirstFill');
    els.moodFill = $('#moodFill');
    els.hungerValue = $('#hungerValue');
    els.thirstValue = $('#thirstValue');
    els.moodValue = $('#moodValue');
    els.bondLevel = $('#bondLevel');
    els.bondTitle = $('#bondTitle');
    els.bondFill = $('#bondFill');
    els.bondMeta = $('#bondMeta');
    els.chatName = $('#chatName');
    els.chatLog = $('#chatLog');
    els.chatPanel = $('#chatPanel');
    els.chatForm = $('#chatForm');
    els.chatInput = $('#chatInput');
    els.sendBtn = $('#sendBtn');
    els.quickChips = $('#quickChips');
    els.feedBtn = $('#feedBtn');
    els.drinkBtn = $('#drinkBtn');
    els.petBtn = $('#petBtn');
    els.chatBtn = $('#chatBtn');
    els.actions = $('#actions');
    els.actionButtons = [els.feedBtn, els.drinkBtn, els.petBtn, els.chatBtn];
    els.foodTray = $('#foodTray');
    els.foodOptions = $('#foodOptions');
    els.nameModal = $('#nameModal');
    els.nameCloseBtn = $('#nameCloseBtn');
    els.nameEyebrow = $('#nameEyebrow');
    els.nameModalTitle = $('#nameModalTitle');
    els.nameModalCopy = $('#nameModalCopy');
    els.nameForm = $('#nameForm');
    els.nameInput = $('#nameInput');
    els.nameSubmitBtn = $('#nameSubmitBtn');
    els.nameSuggestions = $('#nameSuggestions');
    els.resetGameBtn = $('#resetGameBtn');
    els.resetModal = $('#resetModal');
    els.cancelResetBtn = $('#cancelResetBtn');
    els.confirmResetBtn = $('#confirmResetBtn');
  }

  function bindCanvas() {
    els.ctx.imageSmoothingEnabled = false;
    [els.hungerFill, els.thirstFill, els.moodFill].forEach((fill) => {
      const bar = fill.parentElement;
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
    });
  }

  function createDefaultState() {
    return {
      version: 1,
      name: DEFAULT_NAME,
      onboarded: false,
      hunger: START.hunger,
      thirst: START.thirst,
      mood: START.mood,
      bond: 0,
      muted: false,
      chat: [],
      createdAt: Date.now(),
      lastSeen: Date.now()
    };
  }

  /* =======================================================================
     Persistence
     ======================================================================= */

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return normalizeState(parsed);
    } catch (error) {
      return null;
    }
  }

  function normalizeState(raw) {
    const number = (value, fallback) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : fallback;
    };

    const normalized = {
      version: 1,
      name: cleanName(raw.name) || DEFAULT_NAME,
      onboarded: raw.onboarded !== false,
      hunger: clamp(number(raw.hunger, START.hunger), 0, 100),
      thirst: clamp(number(raw.thirst, START.thirst), 0, 100),
      mood: clamp(number(raw.mood, START.mood), 0, 100),
      bond: Math.max(0, Math.floor(number(raw.bond, 0))),
      muted: raw.muted === true,
      chat: [],
      createdAt: number(raw.createdAt, Date.now()),
      lastSeen: number(raw.lastSeen, Date.now())
    };

    if (Array.isArray(raw.chat)) {
      normalized.chat = raw.chat
        .filter((message) => {
          return message &&
            (message.role === 'pet' || message.role === 'user') &&
            typeof message.text === 'string';
        })
        .slice(-MAX_CHAT)
        .map((message) => ({
          role: message.role,
          text: codePoints(message.text).slice(0, 220).join(''),
          ts: number(message.ts, Date.now())
        }));
    }

    return normalized;
  }

  function applyOfflineDecay(petState) {
    const now = Date.now();
    const away = Math.max(0, now - petState.lastSeen);
    const seconds = Math.min(away, AWAY_CAP_MS) / 1000;

    petState.hunger = clamp(
      petState.hunger - Math.min(OFFLINE_CAPS.hunger, seconds * DECAY.hunger * OFFLINE_RATE),
      0,
      100
    );
    petState.thirst = clamp(
      petState.thirst - Math.min(OFFLINE_CAPS.thirst, seconds * DECAY.thirst * OFFLINE_RATE),
      0,
      100
    );
    petState.mood = clamp(
      petState.mood - Math.min(OFFLINE_CAPS.mood, seconds * DECAY.mood * OFFLINE_RATE),
      0,
      100
    );

    petState.lastSeen = now;
    return away;
  }

  function saveGame() {
    if (!state || !state.onboarded || resetting) return;
    try {
      const payload = {
        ...state,
        hunger: Math.round(state.hunger * 10) / 10,
        thirst: Math.round(state.thirst * 10) / 10,
        mood: Math.round(state.mood * 10) / 10,
        chat: state.chat.slice(-MAX_CHAT),
        lastSeen: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      state.lastSeen = payload.lastSeen;
    } catch (error) {
      if (!saveWarned) {
        saveWarned = true;
        console.warn('本地存档不可用，本次进度只能保留在当前页面。');
      }
    }
  }

  /* =======================================================================
     Events
     ======================================================================= */

  function bindEvents() {
    els.soundBtn.addEventListener('click', toggleSound);
    els.feedBtn.addEventListener('click', toggleFoodTray);
    els.drinkBtn.addEventListener('click', drink);
    els.petBtn.addEventListener('click', petPet);
    els.chatBtn.addEventListener('click', openChat);
    els.editNameBtn.addEventListener('click', () => openNameModal('edit'));

    els.foodOptions.addEventListener('click', (event) => {
      const button = event.target.closest('[data-food]');
      if (!button) return;
      feed(button.dataset.food);
    });

    els.quickChips.addEventListener('click', (event) => {
      const button = event.target.closest('[data-say]');
      if (!button) return;
      sendMessage(button.dataset.say);
    });

    els.chatForm.addEventListener('submit', (event) => {
      event.preventDefault();
      sendMessage(els.chatInput.value);
    });

    els.nameForm.addEventListener('submit', handleNameSubmit);
    els.nameCloseBtn.addEventListener('click', () => closeNameModal(true));
    els.nameSuggestions.addEventListener('click', (event) => {
      const button = event.target.closest('[data-name]');
      if (!button) return;
      els.nameInput.value = button.dataset.name;
      els.nameInput.focus();
      AudioKit.click();
    });

    els.resetGameBtn.addEventListener('click', openResetModal);
    els.cancelResetBtn.addEventListener('click', closeResetModal);
    els.confirmResetBtn.addEventListener('click', confirmReset);

    document.addEventListener('click', (event) => {
      if (!foodTrayOpen) return;
      if (els.foodTray.contains(event.target) || els.feedBtn.contains(event.target)) return;
      closeFoodTray(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (foodTrayOpen) {
        closeFoodTray(true);
        return;
      }
      if (!els.resetModal.hidden) {
        closeResetModal();
        return;
      }
      if (!els.nameModal.hidden && nameModalMode === 'edit') {
        closeNameModal(true);
      }
    });

    els.nameModal.addEventListener('click', (event) => {
      if (event.target !== els.nameModal) return;
      if (nameModalMode === 'edit') closeNameModal(true);
    });

    els.resetModal.addEventListener('click', (event) => {
      if (event.target === els.resetModal) closeResetModal();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        saveGame();
        AudioKit.stopMusic();
      } else {
        lastTick = Date.now();
        if (state && !state.muted && AudioKit.ctx) {
          AudioKit.startMusic();
        }
      }
    });

    window.addEventListener('pagehide', () => {
      saveGame();
      AudioKit.stopMusic();
    });

    const unlockAudio = () => {
      AudioKit.init();
      if (state && !state.muted) AudioKit.startMusic();
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('pointerdown', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }

  function toggleSound() {
    if (!state) return;
    state.muted = !state.muted;
    AudioKit.setMuted(state.muted);
    updateSoundUI();
    if (!state.muted) {
      AudioKit.init();
      AudioKit.startMusic();
      AudioKit.click();
    }
    saveGame();
  }

  /* =======================================================================
     Rendering: UI
     ======================================================================= */

  function updateUI() {
    if (!state) return;
    applyNameUI();
    updateStatsUI();
    updateBondUI();
    updateSoundUI();
  }

  function applyNameUI() {
    const name = state.name;
    document.title = `${name}的窝 · 猫鸡养成`;
    els.appTitle.textContent = `${name}的窝`;
    els.petNameLabel.textContent = name;
    els.chatName.textContent = name;
    els.chatInput.placeholder = `和${name}说点什么…`;
  }

  function updateStatsUI() {
    setStatDisplay(els.hungerRow, els.hungerFill, els.hungerValue, state.hunger);
    setStatDisplay(els.thirstRow, els.thirstFill, els.thirstValue, state.thirst);
    setStatDisplay(els.moodRow, els.moodFill, els.moodValue, state.mood);

    const status = getStatus();
    els.moodChip.dataset.tone = status.tone;
    els.moodText.textContent = status.text;
    els.statusHint.textContent = getStatusHint();
  }

  function setStatDisplay(row, fill, valueEl, value) {
    const rounded = Math.round(clamp(value, 0, 100));
    fill.style.width = `${rounded}%`;
    valueEl.textContent = String(rounded);
    const low = rounded <= 25;
    row.classList.toggle('is-low', low);
    fill.classList.toggle('is-low', low);
    fill.parentElement.setAttribute('aria-valuenow', String(rounded));
    fill.parentElement.setAttribute('aria-label', row.querySelector('.stat-label').textContent);
  }

  function getStatus() {
    if (!state.onboarded) return { text: '等你给它取名', tone: 'ok' };

    if (state.hunger <= 20) return { text: '饿得眼冒星星', tone: 'bad' };
    if (state.thirst <= 20) return { text: '口渴得冒烟', tone: 'bad' };
    if (state.hunger <= 40) return { text: '肚子咕咕叫', tone: 'warn' };
    if (state.thirst <= 40) return { text: '想喝点水', tone: 'warn' };
    if (state.mood <= 25) return { text: '有点小委屈', tone: 'bad' };
    if (state.mood <= 45) return { text: '在等你陪它玩', tone: 'warn' };
    if (state.hunger >= 70 && state.thirst >= 70 && state.mood >= 75) {
      return { text: '心情美滋滋', tone: 'good' };
    }
    return { text: '悠闲地发着呆', tone: 'ok' };
  }

  function getStatusHint() {
    if (!state.onboarded) return '取个名字，它就会住下来';
    if (state.hunger <= 25) return '它现在最需要一口吃的';
    if (state.thirst <= 25) return '它现在最需要喝口水';
    if (state.mood <= 25) return '陪它玩一会儿吧';
    if (state.mood >= 80 && state.hunger >= 60 && state.thirst >= 60) return '状态很好，可以聊两句';
    return '三根小条正在慢慢变化';
  }

  function updateBondUI() {
    const info = getLevelInfo(state.bond);
    els.bondLevel.textContent = `Lv.${info.level}`;
    els.bondTitle.textContent = info.title;
    els.levelChip.textContent = `Lv.${info.level}`;
    els.bondFill.style.width = `${Math.round(info.progress * 100)}%`;

    if (info.nextAt == null) {
      els.bondMeta.textContent = '已经是最亲密的伙伴 · 终身饭票';
    } else {
      els.bondMeta.textContent = `再攒 ${info.nextAt - state.bond} 点升到 Lv.${info.level + 1}`;
    }
  }

  function updateSoundUI() {
    const muted = Boolean(state.muted);
    els.soundBtn.dataset.muted = String(muted);
    els.soundBtn.setAttribute('aria-label', muted ? '开启声音' : '关闭声音');
    els.soundBtn.title = muted ? '声音已关闭（音效 + BGM）' : '声音已开启（音效 + BGM）';
  }

  function getLevelInfo(bond) {
    let index = 0;
    for (let i = 0; i < LEVELS.length; i += 1) {
      if (bond >= LEVELS[i].at) index = i;
    }
    const current = LEVELS[index];
    const next = LEVELS[index + 1] || null;
    return {
      level: index + 1,
      title: current.title,
      currentAt: current.at,
      nextAt: next ? next.at : null,
      progress: next
        ? clamp((bond - current.at) / (next.at - current.at), 0, 1)
        : 1
    };
  }

  function addBond(amount) {
    const before = getLevelInfo(state.bond).level;
    state.bond += Math.max(0, Math.floor(amount));
    const after = getLevelInfo(state.bond);
    updateBondUI();
    if (after.level > before) {
      levelUp(after);
      return true;
    }
    return false;
  }

  function levelUp(info) {
    const line = LEVEL_UP_LINES[info.level] || `升级到 Lv.${info.level}「${info.title}」啦！`;
    showBubble(line, 6200);
    showLevelToast(info);
    AudioKit.level();
    levelFxUntil = performance.now() + 1900;
    spawnStars(200, 108, 16);
    saveGame();
  }

  function showLevelToast(info) {
    els.levelToastTitle.textContent = `Lv.${info.level} · ${info.title}`;
    els.levelToast.hidden = false;
    window.clearTimeout(levelToastTimer);
    levelToastTimer = window.setTimeout(() => {
      els.levelToast.hidden = true;
    }, 2300);
  }

  function buildFoodOptions() {
    els.foodOptions.innerHTML = '';
    Object.entries(FOODS).forEach(([id, food]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'food-btn';
      button.dataset.food = id;
      button.innerHTML = `
        <svg class="food-icon" viewBox="0 0 16 16" aria-hidden="true"><use href="#${food.icon}"></use></svg>
        <span class="food-name">${food.name}</span>
        <span class="food-fx">饱食 +${food.hunger} · 心情 +${food.mood}</span>
      `;
      els.foodOptions.append(button);
    });
  }

  function buildQuickChips() {
    els.quickChips.innerHTML = '';
    QUICK_CHATS.forEach((sentence) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      if (sentence === '我喜欢你') button.classList.add('chip-love');
      button.dataset.say = sentence;
      button.textContent = sentence;
      els.quickChips.append(button);
    });
  }

  /* =======================================================================
     Actions
     ======================================================================= */

  function toggleFoodTray() {
    if (!state.onboarded || actionLocked) return;
    if (foodTrayOpen) {
      closeFoodTray(false);
      return;
    }
    if (state.hunger >= 96) {
      refuseAction('full');
      return;
    }
    foodTrayOpen = true;
    els.foodTray.hidden = false;
    els.feedBtn.setAttribute('aria-expanded', 'true');
    AudioKit.click();
    const first = els.foodOptions.querySelector('.food-btn');
    if (first) first.focus({ preventScroll: true });
  }

  function closeFoodTray(returnFocus) {
    if (!foodTrayOpen) return;
    foodTrayOpen = false;
    els.foodTray.hidden = true;
    els.feedBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) els.feedBtn.focus({ preventScroll: true });
  }

  function feed(foodId) {
    const food = FOODS[foodId];
    if (!food || !state.onboarded || actionLocked) return;

    closeFoodTray(false);

    if (state.hunger >= 96) {
      refuseAction('full');
      return;
    }

    const gained = Math.max(0, Math.round(Math.min(food.hunger, 100 - state.hunger)));
    state.hunger = clamp(state.hunger + food.hunger, 0, 100);
    state.mood = clamp(state.mood + food.mood, 0, 100);

    const leveled = addBond(food.bond);
    updateStatsUI();
    saveGame();

    startAction('feed', 1750, { food: foodId });
    AudioKit.munch();
    floatText(`饱食 +${gained}`, '');
    window.setTimeout(() => floatText(`心情 +${food.mood}`, 'pink'), 180);

    window.setTimeout(() => {
      if (state && state.onboarded) spawnCrumbs(203, 158, 7);
    }, 620);
    window.setTimeout(() => {
      if (state && state.onboarded) {
        spawnCrumbs(194, 158, 5);
        spawnHearts(202, 101, 2);
      }
    }, 880);
    window.setTimeout(() => {
      if (state && state.onboarded) spawnHearts(203, 95, 3);
    }, 1180);

    if (!leveled) showBubble(pick(food.lines), 3800);
  }

  function drink() {
    if (!state.onboarded || actionLocked) return;
    closeFoodTray(false);

    if (state.thirst >= 96) {
      refuseAction('thirst');
      return;
    }

    const gained = Math.max(0, Math.round(Math.min(30, 100 - state.thirst)));
    state.thirst = clamp(state.thirst + 30, 0, 100);
    state.mood = clamp(state.mood + 2, 0, 100);

    const leveled = addBond(2);
    updateStatsUI();
    saveGame();

    startAction('drink', 1450);
    AudioKit.drink();
    floatText(`水分 +${gained}`, 'blue');

    window.setTimeout(() => spawnDrops(205, 157, 4), 260);
    window.setTimeout(() => spawnDrops(196, 159, 4), 500);
    window.setTimeout(() => {
      spawnDrops(202, 157, 3);
      spawnHearts(200, 101, 2);
    }, 740);

    if (!leveled) {
      showBubble(pick([
        '咕嘟咕嘟……这水有一股插座的味道。',
        '喝完啦！给你一个湿润的咕咕。',
        '水比猫薄荷还解渴。',
        '吨吨吨——本鸡的水分补充完毕。'
      ]), 3600);
    }
  }

  function petPet() {
    if (!state.onboarded || actionLocked) return;
    closeFoodTray(false);

    const gained = Math.max(0, Math.round(Math.min(9, 100 - state.mood)));
    state.mood = clamp(state.mood + 9, 0, 100);

    const leveled = addBond(3);
    updateStatsUI();
    saveGame();

    startAction('pet', 1200);
    AudioKit.pet();
    floatText(gained > 0 ? `心情 +${gained}` : '亲密度 +3', 'pink');
    spawnHearts(200, 101, 4);

    window.setTimeout(() => spawnHearts(200, 99, 3), 260);
    window.setTimeout(() => spawnHearts(200, 96, 2), 520);

    if (!leveled) showBubble(pick(PET_LINES), 3800);
  }

  function openChat() {
    if (!state.onboarded) return;
    closeFoodTray(false);
    AudioKit.click();

    if (window.matchMedia('(max-width: 1000px)').matches) {
      els.chatPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    window.setTimeout(() => els.chatInput.focus({ preventScroll: true }), 120);

    if (!bubbleIsVisible && !isTyping) {
      showBubble(pick(CHAT_OPEN_LINES), 3800);
    }
  }

  function refuseAction(kind) {
    const lines = kind === 'thirst' ? DRINK_FULL_LINES : FULL_LINES;
    showBubble(pick(lines), 3600);
    AudioKit.nope();
    shakeStage();
  }

  function shakeStage() {
    els.stageWrap.classList.remove('shake');
    void els.stageWrap.offsetWidth;
    els.stageWrap.classList.add('shake');
    window.setTimeout(() => els.stageWrap.classList.remove('shake'), 420);
  }

  function startAction(type, duration, data = null) {
    animation = {
      type,
      start: performance.now(),
      duration,
      data
    };
    actionLocked = true;
    els.actionButtons.forEach((button) => {
      button.disabled = true;
    });
    window.clearTimeout(actionLockTimer);
    actionLockTimer = window.setTimeout(() => {
      actionLocked = false;
      els.actionButtons.forEach((button) => {
        button.disabled = false;
      });
    }, duration);
  }

  /* =======================================================================
     Chat
     ======================================================================= */

  function sendMessage(rawText) {
    if (!state.onboarded || isTyping) return;

    const text = codePoints(String(rawText || '').trim()).slice(0, MAX_MESSAGE_LEN).join('');
    if (!text) {
      els.chatInput.focus();
      return;
    }

    els.chatInput.value = '';
    closeFoodTray(false);
    appendMessage('user', text, { save: true });
    AudioKit.send();

    state.mood = clamp(state.mood + 1, 0, 100);
    const now = Date.now();
    if (now >= nextChatBondAt) {
      nextChatBondAt = now + 15000;
      addBond(1);
    }
    updateStatsUI();

    isTyping = true;
    setTyping(true);
    const reply = generateReply(text);
    const delay = random(480, 900);

    window.clearTimeout(typingReplyTimer);
    typingReplyTimer = window.setTimeout(() => {
      isTyping = false;
      setTyping(false);
      appendMessage('pet', reply, { save: true });
      showBubble(reply, 5200);
      AudioKit.receive();
      if (!isActionPlaying()) {
        animation = {
          type: 'talk',
          start: performance.now(),
          duration: 1100,
          data: null
        };
      }
      saveGame();
    }, delay);
  }

  function appendMessage(role, text, options = {}) {
    const { save = true, animate = true, scroll = true } = options;
    const row = document.createElement('div');
    row.className = `msg ${role}`;

    if (role === 'pet') {
      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar';
      avatar.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><use href="#pet-head"></use></svg>';
      row.append(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;
    row.append(bubble);

    if (!animate) row.style.animation = 'none';
    els.chatLog.append(row);
    if (scroll) scrollChat();

    if (save) {
      state.chat.push({ role, text, ts: Date.now() });
      if (state.chat.length > MAX_CHAT) state.chat = state.chat.slice(-MAX_CHAT);
      saveGame();
    }
  }

  function restoreChat() {
    els.chatLog.innerHTML = '';
    state.chat.forEach((message) => {
      appendMessage(message.role, message.text, { save: false, animate: false, scroll: false });
    });
    scrollChat(true);
  }

  function setTyping(on) {
    if (on) {
      if (typingEl) return;
      typingEl = document.createElement('div');
      typingEl.className = 'msg pet typing';
      typingEl.innerHTML = `
        <div class="msg-avatar"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#pet-head"></use></svg></div>
        <div class="msg-bubble" aria-label="正在输入">
          <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
        </div>
      `;
      els.chatLog.append(typingEl);
      scrollChat();
    } else if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  function scrollChat() {
    const scroll = () => {
      els.chatLog.scrollTop = els.chatLog.scrollHeight;
    };
    scroll();
    requestAnimationFrame(scroll);
  }

  function generateReply(rawText) {
    const text = rawText.toLowerCase();
    const highBond = getLevelInfo(state.bond).level >= 5;

    if (/少爷|本少|地位/.test(text)) {
      if (/我要当少爷位/.test(text)) {
        return pickFresh('sir-exact', [
          '喵咕！我要当少爷位！——等等，是你在说？那本鸡批准了：你当少爷，我当少爷鸡。',
          '少爷位只有一个，而它现在被我的屁股占领了。你要坐，只能坐旁边的小板凳。',
          '好啊，你当少爷。那从今天起，上茶、递小鱼干、夸我可爱，一样都不能少。'
        ]);
      }
      return pickFresh('sir', [
        '少爷位的事，我们得从长计议。比如，先给我一条小鱼干。',
        '这个家只能有一个少爷位。看在你喂过我的份上，可以设一个副位。',
        '低调一点，真正的少爷都像我这样，圆润而沉默。'
      ]);
    }

    if (/名字|叫什么|怎么称呼|你是谁|称呼/.test(text)) {
      return pickFresh('name', [
        `我叫${state.name}。名字是我自己挑的……好吧，是你取的，但我不打算追究。`,
        `${state.name}。记不住的话，摸一下我的圆肚子就能想起来。`,
        `本鸡大名${state.name}，小名「少爷」。`
      ]);
    }

    if (/猫头鸡|猫还是鸡|你是(一只)?(猫|鸡)|什么品种|你是什么|你是啥|品种/.test(text)) {
      return pickFresh('identity', [
        '我是猫头鸡身黄金小怪兽。猫的部分负责可爱，鸡的部分负责打鸣。',
        '品种叫「咕咕猫鸡」。全国大概就我一只，稀有到连我自己都没见过第二只。',
        '猫脸、鸡冠、鸡爪，还有一颗只想当少爷的心。',
        '严格来说，我是猫和鸡的友好协商结果。'
      ]);
    }

    if (/饿|吃|饭|小鱼干|玉米|投喂|零食|宵夜|早餐|午餐|晚餐/.test(text)) {
      if (state.hunger < 35) {
        return pickFresh('hungry-low', [
          '饿！非常饿！现在立刻马上，给我来一条小鱼干。',
          '肚子已经叫到第三轮了。你再不喂，我就要啃插座了。',
          '你说到我的痛处了。快，把饭盆交出来。'
        ]);
      }
      return pickFresh('hungry-ok', [
        '现在暂时不饿。但你要喂的话，我可以启动备用胃。',
        '刚吃饱，肚皮正圆。你摸摸看，像不像一个刚出炉的馒头？',
        '不饿，但少爷的嘴有点寂寞。'
      ]);
    }

    if (/渴|喝水|开水|喝水|饮料|奶茶|水/.test(text)) {
      if (state.thirst < 35) {
        return pickFresh('thirsty-low', [
          '渴！嗓子眼儿都要冒烟了。水碗在那边，看见了吗？',
          '想喝水。现在，立刻，马上。',
          '我已经在脑补一杯加冰的水了。'
        ]);
      }
      return pickFresh('thirsty-ok', [
        '现在不渴。不过你倒一杯，我也可以赏脸喝一口。',
        '水分充足，皮毛油亮。谢谢关心。',
        '喝水这件事，讲究一个氛围。你先夸我两句。'
      ]);
    }

    if (/摸|抱|贴贴|亲亲|亲一下|撸|揉|挠/.test(text)) {
      return pickFresh('petting', [
        '咕噜咕噜……对，就是下巴那里。',
        '再挠三下，我就考虑让你当正式铲屎官。',
        '摸头可以，摸鸡冠要另外收费。',
        '本鸡勉强享受一下。嗯，继续。'
      ]);
    }

    if (/我喜欢你|喜欢你|我爱你|中意你/.test(text)) {
      return pickFresh('love', [
        '我喜欢你，也喜欢小鱼干。你排第二。',
        '喵咕？！你、你突然说这个……那我也喜欢你。就一点点，别得意。',
        highBond
          ? '我喜欢你，也喜欢每天等你回来。……这句话不许录音。'
          : '你再说一遍。我要把这句话存进鸡冠里。'
      ]);
    }

    if (/可爱|好看|漂亮|喜欢|萌|乖|宝贝|帅|厉害|聪明/.test(text)) {
      return pickFresh('praise', [
        '嘿嘿，再夸一句，我的鸡冠就要竖起来了。',
        '你眼光真好。奖励你摸一下我的圆肚皮。',
        '本少爷一直都知道，只是需要你经常提醒。',
        highBond ? '都老熟人了还说这种话……好吧，我爱听。' : '低调，低调。虽然你说的都是事实。'
      ]);
    }

    if (/晚安|睡觉|困|休息|做梦/.test(text)) {
      return pickFresh('sleep', [
        '晚安。梦里也要记得投喂我，谢谢。',
        '呼……那我先睡了。别关灯，鸡冠需要月光。',
        '困了困了。本少爷要躺平了。'
      ]);
    }

    if (/唱歌|唱一|表演|才艺|跳舞/.test(text)) {
      return pickFresh('sing', [
        '咕咕咕——咯咯哒——喵！谢谢，不用鼓掌，小鱼干就行。',
        '我的主打歌叫《我要当少爷位》，要来一段吗？咕咕咕——'
      ]);
    }

    if (/几岁|多大|年龄|生日/.test(text)) {
      return pickFresh('age', [
        '一岁半。心理年龄三岁，少爷脾气五十岁。',
        '年龄是秘密。但看在我这么圆的份上，猜小一点。'
      ]);
    }

    if (/谢谢|感谢|辛苦了|爱你/.test(text)) {
      return pickFresh('thanks', [
        '不客气。折现成小鱼干也可以。',
        '客气什么，我们是什么关系。饭搭子嘛。',
        highBond ? '跟我还客气。下辈子记得还来喂我。' : '小事。下次记得多带点吃的。'
      ]);
    }

    if (/你好|嗨|哈喽|在吗|早上好|中午好|下午好|晚上好|hello|^hi$|^hey$|hi[!！]/.test(text)) {
      return pickFresh('greeting', [
        '咕咕～你来啦。先检查一下我有没有变圆。',
        '你好。今天的我也是一只情绪稳定的毛球。',
        '喵咕！你来正好，我正想找个人陪我发呆。'
      ]);
    }

    if (/再见|拜拜|走了|出门|下班|bye/.test(text)) {
      return pickFresh('bye', [
        '去吧去吧。我在这里替你坐着少爷位。',
        '早点回来。小鱼干我先帮你看着，绝对不吃。',
        '出门记得带钥匙。也记得带小鱼干。'
      ]);
    }

    if (/天气|下雨|太阳|冷|热/.test(text)) {
      return pickFresh('weather', [
        '天气怎么样？反正我只看得到这面墙和那个插座。',
        '今天适合发呆。每天都适合。'
      ]);
    }

    if (state.hunger < 28) {
      return pickFresh('fallback-hungry', [
        '咕……我刚刚听饿了。你再说一遍，边喂边说。',
        '嗯嗯，有道理。不过在讲道理之前，能先给我一口饭吗？'
      ]);
    }

    if (state.thirst < 28) {
      return pickFresh('fallback-thirsty', [
        '嗯嗯，我听着呢。不过能先给我倒杯水吗？',
        '你说的每个字我都听见了，但我的嗓子现在只关心水。'
      ]);
    }

    if (state.mood < 25) {
      return pickFresh('fallback-sad', [
        '我在听……只是心情有点小雨。陪我玩一下嘛。',
        '嗯。你说完了吗？说完可以摸摸我吗？'
      ]);
    }

    return pickFresh('fallback', DEFAULT_REPLIES);
  }

  function pickFresh(key, list) {
    if (!list.length) return '';
    if (list.length === 1) return list[0];

    let index = Math.floor(Math.random() * list.length);
    if (index === lastPicks.get(key)) {
      index = (index + 1) % list.length;
    }
    lastPicks.set(key, index);
    return list[index];
  }

  /* =======================================================================
     Naming & persistence actions
     ======================================================================= */

  function openNameModal(mode) {
    nameModalMode = mode;
    els.nameModal.hidden = false;
    els.nameCloseBtn.hidden = mode !== 'edit';
    els.nameEyebrow.textContent = mode === 'create' ? '第一位住客' : '重新介绍一下';
    els.nameModalTitle.textContent = mode === 'create' ? '给它取个名字吧' : '换个新名字';
    els.nameModalCopy.textContent = mode === 'create'
      ? '一只猫头鸡身的黄金小怪兽，正在等一个名字。名字之后随时可以改。'
      : '名字会出现在它的小窝、聊天气泡和存档里。它表现得不在意，其实很在意。';
    els.nameSubmitBtn.textContent = mode === 'create' ? '就住进我的窝' : '保存新名字';
    els.nameInput.value = mode === 'edit' ? state.name : '';
    els.nameInput.classList.remove('input-error');

    window.setTimeout(() => {
      els.nameInput.focus();
      if (mode === 'edit') els.nameInput.select();
    }, 40);
  }

  function closeNameModal(returnFocus) {
    if (nameModalMode === 'create') return;
    els.nameModal.hidden = true;
    if (returnFocus) els.editNameBtn.focus({ preventScroll: true });
  }

  function handleNameSubmit(event) {
    event.preventDefault();
    let name = cleanName(els.nameInput.value);

    if (!name) {
      if (nameModalMode === 'create') {
        name = DEFAULT_NAME;
      } else {
        els.nameInput.classList.add('input-error');
        els.nameInput.focus();
        return;
      }
    }

    els.nameInput.classList.remove('input-error');

    if (nameModalMode === 'create' && !state.onboarded) {
      state.name = name;
      state.onboarded = true;
      state.createdAt = Date.now();
      state.lastSeen = Date.now();
      state.chat = [];
      els.nameModal.hidden = true;
      updateUI();
      saveGame();

      const intro = `咕咕咕！我是${name}。猫头鸡身，特长是可爱和等饭吃。以后请多投喂～`;
      els.chatLog.innerHTML = '';
      appendMessage('pet', intro, { save: true });
      showBubble(intro, 6200);
      AudioKit.chirp();
      nextIdleAt = Date.now() + random(30000, 50000);
      lastTick = Date.now();
      return;
    }

    const oldName = state.name;
    state.name = name;
    updateUI();
    saveGame();

    if (oldName !== name) {
      const line = `从现在起，我叫${name}啦。名字不错，勉强配得上我。`;
      appendMessage('pet', line, { save: true });
      showBubble(line, 4800);
      AudioKit.chirp();
    } else {
      showBubble('还是原来的配方，还是原来那只鸡。', 3400);
    }

    els.nameModal.hidden = true;
    els.editNameBtn.focus({ preventScroll: true });
  }

  function cleanName(value) {
    const cleaned = String(value || '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
    return codePoints(cleaned).slice(0, MAX_NAME_LEN).join('').trim();
  }

  function openResetModal() {
    els.resetModal.hidden = false;
    window.setTimeout(() => els.cancelResetBtn.focus(), 40);
  }

  function closeResetModal() {
    els.resetModal.hidden = true;
    els.resetGameBtn.focus({ preventScroll: true });
  }

  function confirmReset() {
    resetting = true;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      /* nothing else to do */
    }
    window.location.reload();
  }

  /* =======================================================================
     Time & idle
     ======================================================================= */

  function gameTick() {
    const now = Date.now();
    if (!state || !state.onboarded) {
      lastTick = now;
      return;
    }

    let delta = (now - lastTick) / 1000;
    lastTick = now;
    if (!Number.isFinite(delta)) delta = 0;
    delta = clamp(delta, 0, 5);

    if (delta > 0) {
      let moodRate = DECAY.mood;
      state.hunger = clamp(state.hunger - delta * DECAY.hunger, 0, 100);
      state.thirst = clamp(state.thirst - delta * DECAY.thirst, 0, 100);
      if (state.hunger < 22) moodRate += 1 / 80;
      if (state.thirst < 22) moodRate += 1 / 90;
      state.mood = clamp(state.mood - delta * moodRate, 0, 100);
      updateStatsUI();
    }
  }

  function maybeIdleChatter() {
    if (!state || !state.onboarded) return;
    if (document.hidden || isTyping || actionLocked || foodTrayOpen) return;
    if (!els.nameModal.hidden || !els.resetModal.hidden) return;
    if (bubbleIsVisible) return;
    if (Date.now() < nextIdleAt) return;

    let line;
    if (state.hunger < 28) {
      line = Math.random() < 0.75 ? pick(IDLE_HUNGRY) : pick(IDLE_GENERIC);
    } else if (state.thirst < 28) {
      line = Math.random() < 0.75 ? pick(IDLE_THIRSTY) : pick(IDLE_GENERIC);
    } else if (state.mood < 28) {
      line = Math.random() < 0.75 ? pick(IDLE_LONELY) : pick(IDLE_GENERIC);
    } else {
      line = pick(IDLE_GENERIC);
    }

    showBubble(line, 4800);
    AudioKit.chirp();
    nextIdleAt = Date.now() + random(38000, 72000);
  }

  function handleReturnGreeting() {
    if (!state.onboarded) return;

    if (state.chat.length === 0) {
      const intro = `咕咕咕！我是${state.name}。猫头鸡身，特长是可爱和等饭吃。`;
      appendMessage('pet', intro, { save: true });
      showBubble(intro, 6200);
      return;
    }

    const line = returnLineFor(lastAwayMs);
    if (line) {
      appendMessage('pet', line, { save: true });
      showBubble(line, 6000);
    } else {
      showBubble(pick([
        '咕咕～我在这儿。',
        '你回来啦。我刚数完一根羽毛。',
        '喵咕。正好，陪我发会儿呆。'
      ]), 3200);
    }
  }

  function returnLineFor(away) {
    if (away > 6 * 60 * 60 * 1000) {
      return '你可算回来了！我刚刚在梦里当上了少爷，差一点就不想醒了。';
    }
    if (away > 60 * 60 * 1000) {
      return '你回来啦。我把这屋的地板缝数了一遍，一共……算了，忘了。';
    }
    if (away > 3 * 60 * 1000) {
      return '咕？你回来啦。本鸡刚刚差点在插座旁边睡着。';
    }
    return null;
  }

  function showBubble(text, duration = 4200) {
    const shortened = codePoints(String(text || '')).slice(0, 68).join('');
    els.speechBubble.textContent = shortened;
    els.speechBubble.classList.add('show');
    bubbleIsVisible = true;
    window.clearTimeout(bubbleHideTimer);
    bubbleHideTimer = window.setTimeout(() => {
      els.speechBubble.classList.remove('show');
      bubbleIsVisible = false;
    }, duration);
  }

  function floatText(text, tone = '') {
    const el = document.createElement('span');
    el.className = `float-text ${tone}`.trim();
    el.textContent = text;
    el.style.left = `${44 + Math.random() * 14}%`;
    el.style.top = `${46 + Math.random() * 10}%`;
    els.floatLayer.append(el);
    window.setTimeout(() => el.remove(), 1350);
  }

  /* =======================================================================
     Canvas: setup and rendering loop
     ======================================================================= */

  const W = 400;
  const H = 320;
  let ctx = null;
  let animation = null;
  let levelFxUntil = -1;
  let particles = [];
  let nextBlinkAt = performance.now() + 2600;
  let blinkUntil = 0;
  let lastRenderedAt = 0;
  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  function renderLoop(now) {
    requestAnimationFrame(renderLoop);
    if (now - lastRenderedAt < 31) return;
    const delta = clamp((now - lastRenderedAt) / 1000, 0, 0.06);
    lastRenderedAt = now;
    updateParticles(delta);
    render(now);
  }

  function isActionPlaying() {
    return Boolean(animation && performance.now() - animation.start < animation.duration);
  }

  function getActiveAnimation(now) {
    if (!animation) return null;
    const elapsed = now - animation.start;
    if (elapsed >= animation.duration) {
      animation = null;
      return null;
    }
    return {
      ...animation,
      elapsed,
      t: elapsed / animation.duration
    };
  }

  function render(now) {
    if (!ctx) ctx = els.ctx;
    if (!ctx || !state) return;

    if (now >= nextBlinkAt) {
      blinkUntil = now + 120;
      nextBlinkAt = now + random(2600, 5600);
    }

    const time = now / 1000;
    const active = getActiveAnimation(now);

    drawRoom(time);
    drawMotes(time, reduceMotion);

    let expression = 'normal';
    if (state.hunger < 20 || state.thirst < 20 || state.mood < 16) {
      expression = 'sad';
    } else if (state.mood >= 92) {
      expression = 'smile';
    }
    if (now < blinkUntil && expression === 'normal') {
      expression = 'blink';
    }

    const breath = Math.sin(time * 2.1) * 1.1;
    const headBob = Math.sin(time * 2.1 + 0.4) * 1.2;
    let headDx = 0;
    let headDy = headBob;
    let wingFlap = reduceMotion ? 0 : Math.sin(time * 1.4) * 0.5;
    let lift = 0;
    let mouthOpen = false;

    if (active) {
      const t = active.t;
      if (active.type === 'feed') {
        expression = t < 0.28 ? 'normal' : 'chew';
        if (t < 0.28) headDy -= 1;
        if (t > 0.26 && t < 0.82) {
          headDy += Math.sin(((t - 0.26) / 0.56) * Math.PI) * 7;
        }
        wingFlap += t > 0.55 ? Math.abs(Math.sin(time * 9)) * 2 : 0;
        mouthOpen = Math.floor(time * 8) % 2 === 0;
      } else if (active.type === 'drink') {
        expression = 'drink';
        if (t > 0.2 && t < 0.82) {
          headDy += Math.sin(((t - 0.2) / 0.62) * Math.PI) * 7;
        }
        mouthOpen = true;
      } else if (active.type === 'pet') {
        expression = 'happy';
        headDx = Math.round(Math.sin(time * 10) * 2);
        headDy += Math.round(Math.sin(t * Math.PI * 4) * 1);
        lift += Math.round(Math.abs(Math.sin(t * Math.PI * 2)) * 2);
        wingFlap += Math.abs(Math.sin(time * 10)) * 3;
      } else if (active.type === 'talk') {
        expression = 'talk';
        headDy += Math.round(Math.sin(time * 7) * 1);
        mouthOpen = Math.floor(time * 7) % 2 === 0;
      } else if (active.type === 'nope') {
        expression = 'sad';
        headDx = Math.round(Math.sin(time * 34) * 3);
      }
    }

    if (now < levelFxUntil) {
      const p = clamp(1 - (levelFxUntil - now) / 1900, 0, 1);
      lift = Math.max(lift, Math.round(Math.abs(Math.sin(p * Math.PI * 3)) * (1 - p) * 11));
      wingFlap += 2;
      expression = 'happy';
    }

    const shakeActive = els.stageWrap.classList.contains('shake');
    const shakeX = shakeActive ? Math.round(Math.sin(now / 18) * 2) : 0;

    drawPetShadow(lift);

    ctx.save();
    ctx.translate(shakeX, -lift);

    const tailSway = reduceMotion
      ? 0
      : Math.sin(time * 1.5) * 2.5 + (active && active.type === 'pet' ? Math.sin(time * 7) * 1.5 : 0);

    drawTail(tailSway);
    drawBody(breath);
    drawFeet();
    drawWing(wingFlap);
    drawNeckRuff(breath, headDy);
    drawHead(200 + headDx, 132 + Math.round(headDy), expression, mouthOpen);

    if (active && active.type === 'feed') {
      drawFlyingFood(active, headDy);
    }

    ctx.restore();

    drawParticles(now);

    if (state.hunger <= 12 || state.thirst <= 12) {
      drawWorryMarks(time);
    }
  }

  /* =======================================================================
     Canvas: low-level pixel helpers
     ======================================================================= */

  function pxRect(x, y, width, height, color) {
    const roundedWidth = Math.round(width);
    const roundedHeight = Math.round(height);
    if (roundedWidth <= 0 || roundedHeight <= 0) return;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), roundedWidth, roundedHeight);
  }

  function pxEllipse(cx, cy, rx, ry, color) {
    const centerX = Math.round(cx);
    const centerY = Math.round(cy);
    const radiusY = Math.max(1, Math.round(ry));
    const radiusX = Math.max(1, rx);
    for (let y = -radiusY; y <= radiusY; y += 1) {
      const t = y / radiusY;
      const width = Math.floor(radiusX * Math.sqrt(Math.max(0, 1 - t * t)));
      pxRect(centerX - width, centerY + y, width * 2 + 1, 1, color);
    }
  }

  function pxEgg(cx, cy, rx, ry, color, bottomWiden = 0.1) {
    const centerX = Math.round(cx);
    const centerY = Math.round(cy);
    const radiusY = Math.max(1, Math.round(ry));
    for (let y = -radiusY; y <= radiusY; y += 1) {
      const t = y / radiusY;
      const width = rx * Math.sqrt(Math.max(0, 1 - t * t)) * (1 + bottomWiden * t);
      pxRect(centerX - width, centerY + y, width * 2, 1, color);
    }
  }

  function pxPoly(points, color) {
    if (!points || points.length < 3) return;
    let minY = Infinity;
    let maxY = -Infinity;
    points.forEach((point) => {
      minY = Math.min(minY, point[1]);
      maxY = Math.max(maxY, point[1]);
    });

    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y += 1) {
      const scan = y + 0.5;
      const crossings = [];
      for (let i = 0; i < points.length; i += 1) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        if ((current[1] <= scan && next[1] > scan) || (next[1] <= scan && current[1] > scan)) {
          crossings.push(current[0] + ((scan - current[1]) * (next[0] - current[0])) / (next[1] - current[1]));
        }
      }
      crossings.sort((a, b) => a - b);
      for (let i = 0; i + 1 < crossings.length; i += 2) {
        const start = Math.round(crossings[i]);
        const end = Math.round(crossings[i + 1]);
        if (end > start) pxRect(start, y, end - start, 1, color);
      }
    }
  }

  function outlinedPoly(points, fill, outline, inset = 0.8) {
    pxPoly(points, outline);
    let cx = 0;
    let cy = 0;
    points.forEach((point) => {
      cx += point[0];
      cy += point[1];
    });
    cx /= points.length;
    cy /= points.length;
    const inner = points.map((point) => [
      cx + (point[0] - cx) * inset,
      cy + (point[1] - cy) * inset
    ]);
    pxPoly(inner, fill);
  }

  function pxLine(x1, y1, x2, y2, color, thickness = 1) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    if (steps < 1) {
      pxRect(x1, y1, thickness, thickness, color);
      return;
    }
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      pxRect(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness, thickness, color);
    }
  }

  /* =======================================================================
     Canvas: room
     ======================================================================= */

  function drawRoom(time) {
    pxRect(0, 0, W, H, '#f4ebda');

    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const x = 15 + col * 46 + (row % 2 ? 10 : 0);
        const y = 20 + row * 29;
        pxRect(x, y, 2, 2, '#ebdeca');
      }
    }

    drawWallPicture();
    drawOutletAndCord();

    pxRect(0, 213, W, 4, '#fbf2df');
    pxRect(0, 217, W, 14, '#e7d6ba');
    pxRect(0, 219, W, 1, '#f7eedb');
    pxRect(0, 229, W, 3, '#c2a882');

    pxRect(0, 232, W, H - 232, '#cb9361');
    const rows = [232, 255, 278, 301];
    const joints = [
      [64, 212, 354],
      [142, 298],
      [34, 182, 330],
      [108, 256, 378]
    ];

    rows.forEach((rowY, index) => {
      const rowHeight = index < rows.length - 1 ? rows[index + 1] - rowY : H - rowY;
      pxRect(0, rowY, W, rowHeight, index % 2 === 0 ? '#cb9361' : '#ce9866');
      pxRect(0, rowY, W, 2, '#a97043');
      pxRect(0, rowY + 2, W, 1, '#dda16d');
      joints[index].forEach((jointX) => {
        pxRect(jointX, rowY + 4, 2, rowHeight - 6, '#ad7547');
        pxRect(jointX + 2, rowY + 4, 1, rowHeight - 6, '#d99f6b');
      });
      for (let i = 0; i < 4; i += 1) {
        const gx = 24 + ((index * 97 + i * 83) % 340);
        const gy = rowY + 9 + ((index * 5 + i * 3) % 9);
        pxRect(gx, gy, 5 + (i % 3) * 2, 1, '#b57d4c');
      }
    });

    drawRug();
    drawBowl(65, 284, 'food');
    drawBowl(336, 284, 'water');
  }

  function drawWallPicture() {
    pxRect(78, 40, 2, 3, '#8c6b45');
    pxRect(76, 43, 6, 2, '#6c4b30');

    pxRect(45, 48, 66, 50, '#6e4b2f');
    pxRect(48, 51, 60, 44, '#e5bc70');
    pxRect(52, 55, 52, 36, '#fff7e2');
    pxRect(56, 59, 44, 28, '#cbded7');

    pxEllipse(78, 73, 12, 7, '#e9b65d');
    pxPoly([[67, 68], [59, 63], [59, 79], [67, 76]], '#d89a45');
    pxRect(83, 70, 2, 2, '#4b3223');
    pxRect(83, 70, 1, 1, '#fff8e8');
    pxRect(74, 67, 5, 1, '#f7d88e');
    pxRect(93, 64, 2, 2, '#fff8e8');
    pxRect(97, 61, 1, 1, '#fff8e8');

    pxRect(48, 51, 60, 2, '#f2d28e');
    pxRect(48, 91, 60, 2, '#c99a55');
  }

  function drawOutletAndCord() {
    pxRect(330, 104, 44, 33, '#6b5238');
    pxRect(333, 107, 38, 27, '#f7efdd');
    pxRect(336, 110, 32, 21, '#ece1cc');
    pxRect(343, 114, 4, 9, '#786046');
    pxRect(355, 114, 4, 9, '#786046');
    pxRect(350, 124, 2, 2, '#9c8769');

    pxRect(346, 137, 13, 8, '#6c5743');
    pxRect(348, 139, 9, 4, '#e9dfc8');

    pxLine(352, 145, 357, 168, '#705b47', 2);
    pxLine(357, 168, 349, 197, '#705b47', 2);
    pxLine(349, 197, 361, 221, '#705b47', 2);
    pxLine(361, 221, 354, 249, '#705b47', 2);
    pxLine(354, 249, 365, 320, '#705b47', 2);
    pxRect(353, 145, 1, 24, '#927a61');
    pxRect(350, 197, 1, 24, '#927a61');
  }

  function drawRug() {
    pxEllipse(200, 292, 109, 20, '#9e6749');
    pxEllipse(200, 289, 105, 18, '#c98662');
    pxEllipse(200, 288, 94, 14, '#e3ae80');
    pxEllipse(200, 287, 78, 10, '#d59a6d');

    for (let i = 0; i < 30; i += 1) {
      const angle = (i / 30) * Math.PI * 2;
      const x = 200 + Math.cos(angle) * 88;
      const y = 288 + Math.sin(angle) * 12.5;
      pxRect(x, y, 3, 1, i % 2 ? '#b97856' : '#f0c99b');
    }
  }

  function drawBowl(x, y, type) {
    pxEllipse(x, y + 11, 19, 3, 'rgba(88, 55, 30, 0.16)');
    pxRect(x - 17, y - 5, 34, 7, '#4b3223');
    pxRect(x - 14, y - 2, 28, 11, '#4b3223');
    pxRect(x - 15, y - 4, 30, 5, type === 'water' ? '#d8eef5' : '#f3e3c5');
    pxRect(x - 12, y + 2, 24, 6, type === 'water' ? '#a5cedf' : '#d9b98a');
    pxRect(x - 17, y - 6, 34, 3, type === 'water' ? '#67b1d1' : '#e0a54c');

    if (type === 'water') {
      pxEllipse(x, y - 5, 12, 2, '#74bad8');
      pxRect(x - 7, y - 6, 4, 1, '#c9f0fd');
      pxRect(x + 4, y - 5, 3, 1, '#4c93b4');
    } else {
      pxEllipse(x, y - 5, 12, 3, '#c78849');
      pxRect(x - 9, y - 6, 5, 2, '#e3ac64');
      pxRect(x + 1, y - 7, 5, 2, '#e3ac64');
      pxRect(x + 6, y - 4, 4, 2, '#b06e38');
      pxRect(x - 3, y - 4, 4, 2, '#b06e38');
      pxRect(x + 11, y + 1, 2, 4, '#f5d491');
    }
  }

  function drawMotes(time, reduced) {
    for (let i = 0; i < 8; i += 1) {
      const drift = reduced ? 0 : Math.sin(time * 0.35 + i * 1.7) * 7;
      const x = 28 + i * 49 + drift;
      const y = 28 + ((i * 31) % 150) + (reduced ? 0 : Math.sin(time * 0.5 + i) * 6);
      const size = i % 3 === 0 ? 2 : 1;
      pxRect(x, y, size, size, 'rgba(255, 251, 232, 0.58)');
    }
  }

  function drawPetShadow(lift) {
    const width = Math.max(46, 80 - lift * 1.2);
    pxEllipse(200, 286, width, Math.max(5, 9 - lift * 0.18), 'rgba(85, 52, 28, 0.22)');
  }

  /* =======================================================================
     Canvas: pet pieces
     ======================================================================= */

  function drawTail(sway) {
    const plumes = [
      {
        base: [144, 202],
        control: [112, 175],
        tip: [88, 150],
        width: 11,
        fill: '#e8bc66'
      },
      {
        base: [149, 202],
        control: [121, 160],
        tip: [99, 129],
        width: 15,
        fill: '#f6dc96'
      },
      {
        base: [157, 202],
        control: [137, 145],
        tip: [120, 100],
        width: 17,
        fill: '#ecc36e'
      },
      {
        base: [166, 201],
        control: [157, 144],
        tip: [147, 96],
        width: 14,
        fill: '#fae6b0'
      }
    ];

    plumes.forEach((plume, index) => {
      const base = [plume.base[0] + sway * 0.15, plume.base[1]];
      const control = [plume.control[0] + sway * 0.55, plume.control[1]];
      const tip = [plume.tip[0] + sway, plume.tip[1]];

      const outer = featherPolygon(base, control, tip, plume.width);
      pxPoly(outer, COLORS.outline);
      const inner = featherPolygon(base, control, tip, Math.max(2, plume.width - 3.6));
      pxPoly(inner, plume.fill);

      for (let i = 2; i < 10; i += 1) {
        const t = i / 12;
        const back = 1 - t;
        const x = back * back * base[0] + 2 * back * t * control[0] + t * t * tip[0];
        const y = back * back * base[1] + 2 * back * t * control[1] + t * t * tip[1];
        pxRect(x, y, 1, 1, index === 3 ? '#e8c57d' : '#d7a957');
      }

      pxRect(tip[0] - 2 + sway * 0.1, tip[1] + 3, 4, 2, index === 3 ? '#fff1c5' : '#fae7b4');
    });
  }

  function featherPolygon(base, control, tip, width, samples = 14) {
    const left = [];
    const right = [];

    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const back = 1 - t;
      const x = back * back * base[0] + 2 * back * t * control[0] + t * t * tip[0];
      const y = back * back * base[1] + 2 * back * t * control[1] + t * t * tip[1];
      const tanX = 2 * back * (control[0] - base[0]) + 2 * t * (tip[0] - control[0]);
      const tanY = 2 * back * (control[1] - base[1]) + 2 * t * (tip[1] - control[1]);
      const length = Math.hypot(tanX, tanY) || 1;
      const normalX = -tanY / length;
      const normalY = tanX / length;
      const profile = Math.sin(Math.PI * (0.16 + 0.84 * t));
      const halfWidth = Math.max(0.4, width * profile * 0.5);

      left.push([x + normalX * halfWidth, y + normalY * halfWidth]);
      right.push([x - normalX * halfWidth, y - normalY * halfWidth]);
    }

    return left.concat(right.reverse());
  }

  function drawBody(breath) {
    const cy = 210 + breath * 0.35;
    const cx = 200;

    pxEgg(cx, cy, 72, 62, COLORS.outline, 0.08);
    pxEgg(cx, cy + 1, 68, 58, COLORS.bodyDark, 0.08);
    pxEgg(cx - 2, cy - 2, 63, 53, COLORS.bodyBase, 0.08);

    pxEllipse(cx + 1, cy + 17, 34, 31, COLORS.chest);
    pxEllipse(cx - 16, cy + 36, 16, 11, COLORS.chest);
    pxEllipse(cx + 16, cy + 36, 16, 11, COLORS.chest);
    pxEllipse(cx, cy + 43, 15, 9, COLORS.chest);
    pxEllipse(cx - 14, cy + 39, 9, 4, COLORS.chestShade);
    pxEllipse(cx + 14, cy + 39, 9, 4, COLORS.chestShade);
    pxEllipse(cx, cy + 47, 9, 4, COLORS.chestShade);
    pxRect(cx - 14, cy + 25, 5, 1, COLORS.chestShade);
    pxRect(cx + 9, cy + 29, 5, 1, COLORS.chestShade);
    pxRect(cx - 3, cy + 35, 6, 1, COLORS.chestShade);

    const marks = [
      [147, 184],
      [154, 204],
      [150, 226],
      [245, 186],
      [249, 208],
      [240, 230]
    ];
    marks.forEach(([x, y]) => {
      pxRect(x, y, 2, 5, COLORS.bodyDark);
      pxRect(x + 2, y + 4, 2, 1, COLORS.bodyDark);
      pxRect(x + 2, y, 1, 3, COLORS.bodyLight);
    });

    pxRect(cx - 31, cy + 12, 7, 2, COLORS.bodyLight);
    pxRect(cx + 25, cy + 2, 5, 2, COLORS.bodyLight);
    pxRect(cx - 38, cy + 31, 5, 2, COLORS.bodyLight);
  }

  function drawFeet() {
    drawFoot(177);
    drawFoot(223);
  }

  function drawFoot(x) {
    pxRect(x - 5, 255, 11, 19, COLORS.outline);
    pxRect(x - 3, 257, 7, 15, COLORS.feet);
    pxRect(x - 1, 264, 2, 7, COLORS.feetDark);

    pxRect(x - 10, 271, 20, 10, COLORS.outline);
    pxRect(x - 8, 273, 16, 6, COLORS.feet);
    pxRect(x - 3, 278, 2, 4, COLORS.outline);
    pxRect(x + 4, 278, 2, 4, COLORS.outline);
    pxRect(x - 8, 274, 4, 1, '#f6c273');
    pxRect(x + 3, 274, 4, 1, '#f6c273');

    pxRect(x - 9, 280, 2, 2, COLORS.claw);
    pxRect(x - 1, 282, 2, 2, COLORS.claw);
    pxRect(x + 7, 280, 2, 2, COLORS.claw);
    pxRect(x - 8, 282, 1, 1, COLORS.feetDark);
    pxRect(x + 5, 282, 1, 1, COLORS.feetDark);
  }

  function drawWing(flap) {
    const dx = Math.round(flap);
    const points = [
      [238, 176],
      [258, 171],
      [276, 182],
      [283, 204],
      [279, 228],
      [270, 240],
      [263, 233],
      [255, 246],
      [247, 238],
      [240, 244],
      [234, 224],
      [231, 198]
    ].map(([x, y]) => [x + dx, y - (dx > 0 ? 1 : 0)]);

    outlinedPoly(points, COLORS.wingBase, COLORS.outline, 0.84);

    pxLine(245 + dx, 196, 272 + dx, 212, '#cf9947', 1);
    pxLine(244 + dx, 214, 271 + dx, 227, '#d39d49', 1);
    pxLine(248 + dx, 231, 265 + dx, 238, '#cf9947', 1);
    pxRect(248 + dx, 183, 12, 2, COLORS.wingLight);
    pxRect(240 + dx, 191, 4, 2, COLORS.wingLight);
    pxRect(253 + dx, 241, 3, 5, '#d5a04c');
    pxRect(262 + dx, 235, 3, 5, '#d5a04c');
    pxRect(270 + dx, 226, 3, 4, '#d5a04c');
  }

  function drawNeckRuff(breath, headDy) {
    const baseY = 163 + breath * 0.2;
    const xs = [164, 182, 200, 218, 236];
    xs.forEach((x, index) => {
      pxEllipse(
        x,
        baseY + (index % 2 ? 1 : 0) + headDy * 0.15,
        12,
        9,
        index % 2 ? COLORS.chest : COLORS.bodyLight
      );
    });
    pxRect(153, baseY + 2, 4, 4, COLORS.bodyLight);
    pxRect(242, baseY + 2, 4, 4, COLORS.bodyLight);
  }

  function drawHead(hx, hy, expression, mouthOpen) {
    drawEar(
      [[hx - 40, hy - 22], [hx - 47, hy - 54], [hx - 17, hy - 35]],
      [[hx - 38, hy - 29], [hx - 42, hy - 45], [hx - 24, hy - 35]]
    );
    drawEar(
      [[hx + 40, hy - 22], [hx + 47, hy - 54], [hx + 17, hy - 35]],
      [[hx + 38, hy - 29], [hx + 42, hy - 45], [hx + 24, hy - 35]]
    );

    pxEllipse(hx, hy, 48, 43, COLORS.outline);
    pxEllipse(hx, hy + 1, 45, 40, COLORS.headBase);
    pxEllipse(hx + 1, hy + 9, 40, 25, COLORS.headShadow);
    pxEllipse(hx - 5, hy - 7, 31, 23, COLORS.headLight);

    pxRect(hx - 17, hy - 33, 7, 2, '#dea84f');
    pxRect(hx + 10, hy - 33, 7, 2, '#dea84f');
    pxRect(hx - 4, hy - 37, 8, 2, '#dea84f');

    drawComb(hx, hy);

    pxEllipse(hx, hy + 19, 22, 12, '#ffe8bd');
    pxEllipse(hx, hy + 14, 17, 7, '#fff0cf');

    drawEyes(hx, hy, expression);

    pxPoly(
      [[hx - 4, hy + 14], [hx + 4, hy + 14], [hx, hy + 19]],
      COLORS.nose
    );
    pxRect(hx - 2, hy + 18, 4, 1, '#b96870');
    drawMouth(hx, hy, expression, mouthOpen);

    pxRect(hx - 34, hy + 15, 4, 2, COLORS.blush);
    pxRect(hx + 30, hy + 15, 4, 2, COLORS.blush);

    drawWhiskers(hx, hy);
    drawWattle(hx, hy);
  }

  function drawEar(outerPoints, pinkPoints) {
    outlinedPoly(outerPoints, COLORS.headBase, COLORS.outline, 0.7);
    pxPoly(pinkPoints, COLORS.earInner);
    pxRect(pinkPoints[1][0] - 1, pinkPoints[1][1] + 2, 3, 3, '#f2b4a9');
  }

  function drawComb(hx, hy) {
    pxRect(hx - 21, hy - 45, 42, 10, COLORS.combDark);
    pxRect(hx - 19, hy - 44, 38, 7, COLORS.comb);

    pxEllipse(hx - 14, hy - 44, 10, 11, COLORS.combDark);
    pxEllipse(hx, hy - 53, 10, 13, COLORS.combDark);
    pxEllipse(hx + 14, hy - 44, 9, 10, COLORS.combDark);

    pxEllipse(hx - 14, hy - 44, 7, 8, COLORS.comb);
    pxEllipse(hx, hy - 53, 7, 10, COLORS.comb);
    pxEllipse(hx + 14, hy - 44, 6, 7, COLORS.comb);

    pxRect(hx - 17, hy - 47, 3, 3, COLORS.combLight);
    pxRect(hx - 2, hy - 59, 3, 4, COLORS.combLight);
    pxRect(hx + 11, hy - 47, 2, 3, COLORS.combLight);
    pxRect(hx - 20, hy - 39, 3, 2, '#9e2c2b');
    pxRect(hx + 18, hy - 39, 2, 2, '#9e2c2b');
  }

  function drawEyes(hx, hy, expression) {
    const leftX = hx - 18;
    const rightX = hx + 18;
    const eyeY = hy - 1;

    if (expression === 'blink') {
      pxRect(leftX - 5, eyeY, 10, 2, COLORS.eye);
      pxRect(rightX - 5, eyeY, 10, 2, COLORS.eye);
      return;
    }

    if (expression === 'happy' || expression === 'chew' || expression === 'drink') {
      drawHappyEye(leftX, eyeY);
      drawHappyEye(rightX, eyeY);
      return;
    }

    pxEllipse(leftX, eyeY, 8, 11, COLORS.eye);
    pxEllipse(rightX, eyeY, 8, 11, COLORS.eye);
    pxRect(leftX - 4, eyeY - 7, 3, 3, COLORS.eyeShine);
    pxRect(rightX - 4, eyeY - 7, 3, 3, COLORS.eyeShine);
    pxRect(leftX + 2, eyeY + 5, 2, 2, '#5d4330');
    pxRect(rightX + 2, eyeY + 5, 2, 2, '#5d4330');

    if (expression === 'sad') {
      pxLine(leftX - 7, eyeY - 16, leftX + 3, eyeY - 13, COLORS.eye, 1);
      pxLine(rightX + 7, eyeY - 16, rightX - 3, eyeY - 13, COLORS.eye, 1);
    }
  }

  function drawHappyEye(x, y) {
    pxRect(x - 7, y + 2, 3, 2, COLORS.eye);
    pxRect(x - 4, y - 1, 3, 2, COLORS.eye);
    pxRect(x - 1, y - 3, 2, 2, COLORS.eye);
    pxRect(x + 1, y - 1, 3, 2, COLORS.eye);
    pxRect(x + 4, y + 2, 3, 2, COLORS.eye);
  }

  function drawMouth(hx, hy, expression, mouthOpen) {
    pxRect(hx - 1, hy + 18, 1, 3, COLORS.mouth);

    if (mouthOpen || expression === 'drink') {
      pxEllipse(hx, hy + 23, 4, 3, COLORS.mouth);
      pxRect(hx - 1, hy + 24, 2, 1, '#e89b9c');
      return;
    }

    if (expression === 'sad') {
      pxRect(hx - 5, hy + 23, 2, 1, COLORS.mouth);
      pxRect(hx - 3, hy + 22, 2, 1, COLORS.mouth);
      pxRect(hx + 1, hy + 22, 2, 1, COLORS.mouth);
      pxRect(hx + 3, hy + 23, 2, 1, COLORS.mouth);
      return;
    }

    if (expression === 'smile' || expression === 'happy') {
      pxRect(hx - 5, hy + 21, 2, 1, COLORS.mouth);
      pxRect(hx - 3, hy + 22, 2, 1, COLORS.mouth);
      pxRect(hx + 1, hy + 22, 2, 1, COLORS.mouth);
      pxRect(hx + 3, hy + 21, 2, 1, COLORS.mouth);
      return;
    }

    pxRect(hx - 4, hy + 22, 3, 1, COLORS.mouth);
    pxRect(hx + 2, hy + 22, 3, 1, COLORS.mouth);
  }

  function drawWhiskers(hx, hy) {
    const originY = hy + 18;
    const left = [
      [hx - 23, originY - 3, hx - 48, originY - 8],
      [hx - 24, originY + 2, hx - 51, originY + 2],
      [hx - 22, originY + 7, hx - 47, originY + 13]
    ];
    const right = [
      [hx + 23, originY - 3, hx + 48, originY - 8],
      [hx + 24, originY + 2, hx + 51, originY + 2],
      [hx + 22, originY + 7, hx + 47, originY + 13]
    ];

    left.concat(right).forEach(([x1, y1, x2, y2]) => {
      pxLine(x1, y1 + 1, x2, y2 + 1, COLORS.whiskerShade, 1);
      pxLine(x1, y1, x2, y2, COLORS.whisker, 1);
    });
  }

  function drawWattle(hx, hy) {
    pxEllipse(hx - 9, hy + 42, 6, 8, COLORS.combDark);
    pxEllipse(hx + 9, hy + 44, 5, 7, COLORS.combDark);
    pxEllipse(hx - 9, hy + 42, 4, 6, COLORS.comb);
    pxEllipse(hx + 9, hy + 44, 3, 5, COLORS.comb);
    pxRect(hx - 10, hy + 38, 2, 2, COLORS.combLight);
  }

  /* =======================================================================
     Canvas: food & particles
     ======================================================================= */

  function drawFlyingFood(active, headDy) {
    if (!active || active.type !== 'feed' || active.t > 0.4) return;

    const progress = clamp(active.t / 0.4, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const startX = 72;
    const startY = 248;
    const endX = 200;
    const endY = 151 + headDy;
    const x = startX + (endX - startX) * eased;
    const y = startY + (endY - startY) * eased - Math.sin(progress * Math.PI) * 58;

    drawFoodSprite(active.data && active.data.food, x, y, active.elapsed);
  }

  function drawFoodSprite(foodId, x, y, elapsed) {
    const bob = Math.sin(elapsed / 90) * 1;

    if (foodId === 'corn') {
      pxRect(x - 4, y - 9 + bob, 8, 15, COLORS.outline);
      pxRect(x - 3, y - 8 + bob, 6, 13, '#f4c95a');
      for (let row = 0; row < 4; row += 1) {
        pxRect(x - 3, y - 6 + row * 3 + bob, 2, 2, '#ffe28b');
        pxRect(x + 1, y - 6 + row * 3 + bob, 2, 2, '#ffe28b');
      }
      pxPoly([[x - 4, y - 9 + bob], [x - 10, y - 12 + bob], [x - 9, y + 4 + bob], [x - 4, y + 3 + bob]], '#7da35b');
      pxPoly([[x + 4, y - 9 + bob], [x + 10, y - 12 + bob], [x + 9, y + 4 + bob], [x + 4, y + 3 + bob]], '#7da35b');
      return;
    }

    if (foodId === 'rice') {
      pxPoly([[x, y - 11 + bob], [x - 11, y + 7 + bob], [x + 11, y + 7 + bob]], COLORS.outline);
      pxPoly([[x, y - 8 + bob], [x - 8, y + 5 + bob], [x + 8, y + 5 + bob]], '#fff8e8');
      pxRect(x - 6, y + 4 + bob, 12, 4, '#405442');
      pxRect(x - 1, y - 1 + bob, 1, 1, '#d9cbb3');
      pxRect(x + 3, y + 1 + bob, 1, 1, '#d9cbb3');
      return;
    }

    pxRect(x - 10, y - 3 + bob, 5, 2, '#d89a45');
    pxRect(x - 10, y + 4 + bob, 5, 2, '#d89a45');
    pxRect(x - 7, y - 1 + bob, 3, 6, COLORS.outline);
    pxRect(x - 5, y - 5 + bob, 16, 11, COLORS.outline);
    pxRect(x - 4, y - 4 + bob, 14, 9, '#efbf68');
    pxRect(x - 2, y - 6 + bob, 10, 2, '#efbf68');
    pxRect(x + 9, y - 4 + bob, 2, 2, '#d89a45');
    pxRect(x + 3, y - 2 + bob, 2, 2, COLORS.outline);
    pxRect(x + 3, y - 2 + bob, 1, 1, '#fff8e8');
    pxRect(x - 3, y + 2 + bob, 7, 2, '#d99a44');
  }

  function spawnHearts(x, y, count) {
    for (let i = 0; i < count; i += 1) {
      particles.push({
        type: 'heart',
        x: x + random(-13, 13),
        y: y + random(-5, 5),
        vx: random(-9, 9),
        vy: random(-46, -28),
        gravity: -8,
        life: 0,
        ttl: random(0.9, 1.4),
        color: Math.random() > 0.4 ? '#e77883' : '#f19aa4'
      });
    }
    trimParticles();
  }

  function spawnCrumbs(x, y, count) {
    for (let i = 0; i < count; i += 1) {
      particles.push({
        type: 'crumb',
        x: x + random(-8, 8),
        y: y + random(-2, 2),
        vx: random(-38, 38),
        vy: random(-58, -18),
        gravity: 210,
        life: 0,
        ttl: random(0.45, 0.85),
        color: Math.random() > 0.5 ? '#c78943' : '#ecc270'
      });
    }
    trimParticles();
  }

  function spawnDrops(x, y, count) {
    for (let i = 0; i < count; i += 1) {
      particles.push({
        type: 'drop',
        x: x + random(-12, 12),
        y: y + random(-2, 5),
        vx: random(-24, 24),
        vy: random(-38, -10),
        gravity: 190,
        life: 0,
        ttl: random(0.5, 0.95),
        color: Math.random() > 0.5 ? '#67b5d9' : '#a5ddf0'
      });
    }
    trimParticles();
  }

  function spawnStars(x, y, count) {
    for (let i = 0; i < count; i += 1) {
      particles.push({
        type: 'star',
        x: x + random(-34, 34),
        y: y + random(-16, 12),
        vx: random(-38, 38),
        vy: random(-72, -30),
        gravity: 70,
        life: 0,
        ttl: random(0.9, 1.6),
        color: Math.random() > 0.4 ? '#f3c65d' : '#fff2b6'
      });
    }
    trimParticles();
  }

  function trimParticles() {
    if (particles.length > 130) {
      particles = particles.slice(particles.length - 130);
    }
  }

  function updateParticles(delta) {
    if (!particles.length) return;
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.life += delta;
      if (particle.life >= particle.ttl) {
        particles.splice(i, 1);
        continue;
      }
      particle.vy += particle.gravity * delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
    }
  }

  function drawParticles(now) {
    if (!particles.length) return;
    particles.forEach((particle) => {
      const ratio = particle.life / particle.ttl;
      const alpha = clamp(1 - ratio * ratio, 0, 1);
      ctx.globalAlpha = alpha;

      if (particle.type === 'heart') {
        drawPixelHeart(particle.x, particle.y, particle.color);
      } else if (particle.type === 'crumb') {
        pxRect(particle.x, particle.y, 2, 2, particle.color);
        pxRect(particle.x + 1, particle.y + 2, 1, 1, particle.color);
      } else if (particle.type === 'drop') {
        pxRect(particle.x, particle.y, 2, 4, particle.color);
        pxRect(particle.x, particle.y, 1, 1, '#e2f7ff');
      } else if (particle.type === 'star') {
        pxRect(particle.x - 2, particle.y, 5, 1, particle.color);
        pxRect(particle.x, particle.y - 2, 1, 5, particle.color);
        pxRect(particle.x - 1, particle.y - 1, 3, 3, particle.color);
      }
    });
    ctx.globalAlpha = 1;
  }

  function drawPixelHeart(x, y, color) {
    const xx = Math.round(x);
    const yy = Math.round(y);
    pxRect(xx - 3, yy - 2, 2, 2, color);
    pxRect(xx + 1, yy - 2, 2, 2, color);
    pxRect(xx - 4, yy, 8, 2, color);
    pxRect(xx - 3, yy + 2, 6, 1, color);
    pxRect(xx - 2, yy + 3, 4, 1, color);
    pxRect(xx - 1, yy + 4, 2, 1, color);
    pxRect(xx - 3, yy - 2, 1, 1, '#ffe1e5');
  }

  function drawWorryMarks(time) {
    const bob = Math.sin(time * 3) * 1;
    ctx.globalAlpha = 0.8;
    pxRect(288, 92 + bob, 2, 8, '#8b6f51');
    pxRect(288, 103 + bob, 2, 2, '#8b6f51');
    pxRect(300, 84 + bob, 2, 6, '#8b6f51');
    pxRect(300, 93 + bob, 2, 2, '#8b6f51');
    ctx.globalAlpha = 1;
  }
})();
