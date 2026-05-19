/*
@title: Casino
@description: Slots, cards, and wheel casino gambling game
@author: ssoggytacoman
@tags: ['game', 'casino']
@addedOn: 2026-05-19
*/
const bg = "x";
const chip = "h", skull = "z", spark = "g", wheelIcon = "r", cursorMark = "Y";
const cherry = "c", lemon = "l", bell = "e", bar = "b", seven = "s";
const num1 = "1", num2 = "2", num3 = "3", num4 = "4", num5 = "5",
      num6 = "6", num7 = "7", num8 = "8", num9 = "9";
const w1 = "R", w2 = "M", w3 = "N", w5 = "O", w15 = "Q",
      w4 = "j", w6m = "k", w8m = "m", w10 = "o",
      w20 = "q", w25 = "u", w30 = "v";
const reelFrame = "F", slotTopL = "A", slotTop = "B", slotTopR = "C",
      slotSideL = "D", slotSideR = "E", slotBaseL = "U", slotBase = "V",
      slotBaseR = "W", slotHandle = "H", slotHandleDown = "T", cardBack = "G";
let stakes = [5, 10, 25, 50, 75, "ALL"], stakeIndex = 1;
const cards = [num1, num2, num3, num4, num5, num6, num7, num8, num9];
const bgm = tune`
420: C3-420,
420: E3-420,
420: G3-420,
420: E3-420,
420: A2-420,
420: C3-420,
420: E3-420,
420: C3-420,
420: F2-420,
420: A2-420,
420: C3-420,
420: A2-420,
420: G2-420,
420: B2-420,
420: D3-420,
420: G3-420,
`;
const tickSfx = tune`
45: C5-45,
`;
const tickSfx2 = tune`
45: D5-45,
`;
const betSfx = tune`
70: E4-70,
90: G4-90,
`;
const spinSfx = tune`
55: C4-55,
55: E4-55,
70: G4-70,
`;
const loseSfx = tune`
120: D4-120,
140: C4-140,
170: A3-170,
260: F3-260,
320: C3-320,
`;
const winSfx = tune`
75: C5-75,
75: E5-75,
90: G5-90,
110: C6-110,
220: G5-220,
`;
const bigWinSfx = tune`
60: C5-60,
60: E5-60,
60: G5-60,
80: C6-80,
80: E6-80,
120: G6-120,
220: C6-220,
`;
const bustSfx = tune`
150: C4-150,
170: A3-170,
220: F3-220,
360: C3-360,
`;
setLegend(
  [spark, bitmap`
................
................
.......6........
.......6........
....6..6..6.....
.....66666......
......666.......
.....66666......
....6..6..6.....
.......6........
.......6........
................
................
................
................
................`],
  [cursorMark, bitmap`
6666........6666
66............66
6..............6
6..............6
................
................
................
................
................
................
................
................
6..............6
6..............6
66............66
6666........6666`],
  [wheelIcon, bitmap`
................
.....666666.....
...6663333666...
..663331113366..
..633111111336..
.66311333113366.
.63113311133136.
.63113111113136.
.63113311133136.
.66311333113366.
..633111111336..
..663331113366..
...6663333666...
.....666666.....
................
................`],
  [w1, bitmap`
................
....66666666....
...6677777766...
..667777777766..
..677770777776..
..677700777776..
..677770777776..
..677770777776..
..677000007776..
..677777777776..
..667777777766..
...6677777766...
....66666666....
................
................
................`],
  [w2, bitmap`
................
....66666666....
...6677777766...
..667777777766..
..677000007776..
..677777707776..
..677000007776..
..677077777776..
..677000007776..
..677777777776..
..667777777766..
...6677777766...
....66666666....
................
................
................`],
  [w3, bitmap`
................
....66666666....
...6644444466...
..664444444466..
..644000004446..
..644444404446..
..644400004446..
..644444404446..
..644000004446..
..644444444446..
..664444444466..
...6644444466...
....66666666....
................
................
................`],
  [w5, bitmap`
................
....66666666....
...6699999966...
..669999999966..
..699000009996..
..699099999996..
..699000009996..
..699999909996..
..699000009996..
..699999999996..
..669999999966..
...6699999966...
....66666666....
................
................
................`],
  [w15, bitmap`
................
....66666666....
...6633333366...
..663333333366..
..633333333336..
.66330330003366.
.63300330333336.
.63330330003336.
.63330333303336.
.66300030003366.
..633333333336..
..663333333366..
...6633333366...
....66666666....
................
................`],
  [w4, bitmap`
................
....66666666....
...6644444466...
..664444444466..
..644004400446..
..644004400446..
..644004400446..
..644000000446..
..644444400446..
..644444400446..
..664444444466..
...6644444466...
....66666666....
................
................
................`],
  [w6m, bitmap`
................
....66666666....
...6699999966...
..669999999966..
..699000000996..
..699009999996..
..699000000996..
..699009900996..
..699009900996..
..699000000996..
..669999999966..
...6699999966...
....66666666....
................
................
................`],
  [w8m, bitmap`
................
....66666666....
...6699999966...
..669999999966..
..699000000996..
..699009900996..
..699000000996..
..699009900996..
..699009900996..
..699000000996..
..669999999966..
...6699999966...
....66666666....
................
................
................`],
  [w10, bitmap`
................
....66666666....
...6633333366...
..663333333366..
..633333333336..
.66330330003366.
.63300330303336.
.63330330303336.
.63330330303336.
.66300030003366.
..633333333336..
..663333333366..
...6633333366...
....66666666....
................
................`],
  [w20, bitmap`
................
....66666666....
...6633333366...
..663333333366..
..633333333336..
.66300030003366.
.63333030303336.
.63300030303336.
.63303330303336.
.66300030003366.
..633333333336..
..663333333366..
...6633333366...
....66666666....
................
................`],
  [w25, bitmap`
................
....66666666....
...6633333366...
..663333333366..
..633333333336..
.66300030003366.
.63333030333336.
.63300030003336.
.63303333303336.
.66300030003366.
..633333333336..
..663333333366..
...6633333366...
....66666666....
................
................`],
  [w30, bitmap`
................
....66666666....
...6633333366...
..663333333366..
..633333333336..
.66300030003366.
.63333030303336.
.63300030303336.
.63333030303336.
.66300030003366.
..633333333336..
..663333333366..
...6633333366...
....66666666....
................
................`],
  [chip, bitmap`
................
................
.....333333.....
....33111133....
...3313331333...
...3131111133...
...3131111133...
...3313331333...
....33111133....
.....333333.....
................
................
................
................
................
................`],
  [skull, bitmap`
................
................
.....111111.....
....11111111....
...1100110011...
...1100110011...
...1111111111...
...1110001111...
....11111111....
.....101010.....
.....111111.....
......1111......
................
................
................
................`],
  [cherry, bitmap`
0000000000000000
0111111111111110
0111111411111110
0111114411111110
0111144111111110
0111333311111110
0113333331111110
0113333331111110
0111333311111110
0111133111111110
0111111111111110
0111111111111110
0111111111111110
0111111111111110
0000000000000000
0000000000000000`],
  [lemon, bitmap`
0000000000000000
0111111111111110
0111111111111110
0111116661111110
0111166666111110
0111666666611110
0116666666661110
0116666666661110
0116666666661110
0111666666611110
0111166666111110
0111116661111110
0111111111111110
0111111111111110
0000000000000000
0000000000000000`],
  [bell, bitmap`
0000000000000000
0111111111111110
0111116666111110
0111166666611110
0111666666661110
0111666666661110
0116666666666110
0110000000000110
0111110000111110
0111111001111110
0111111111111110
0111111111111110
0111111111111110
0111111111111110
0000000000000000
0000000000000000`],
  [bar, bitmap`
0000000000000000
0111111111111110
0111111111111110
0110000000000110
0110222222220110
0110200200200110
0110222222220110
0110000000000110
0111111111111110
0111111111111110
0111111111111110
0111111111111110
0111111111111110
0111111111111110
0000000000000000
0000000000000000`],
  [seven, bitmap`
0000000000000000
0111111111111110
0113333333331110
0113333333331110
0111111113311110
0111111133111110
0111111331111110
0111113311111110
0111133111111110
0111331111111110
0111331111111110
0111111111111110
0111111111111110
0111111111111110
0000000000000000
0000000000000000`],
  [num1, bitmap`
0666666666666660
0611111111111160
0611111111111160
0611111131111160
0611111331111160
0611111131111160
0611111131111160
0611111131111160
0611111131111160
0611113333311160
0611111111111160
0611131111311160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [num2, bitmap`
0666666666666660
0611111111111160
0611111111111160
0611113333311160
0611131111131160
0611111111131160
0611111113311160
0611111331111160
0611133111111160
0611133333331160
0611111111111160
0611131111311160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [num3, bitmap`
0666666666666660
0611111111111160
0611111111111160
0611133333311160
0611111111131160
0611111111131160
0611113333311160
0611111111131160
0611111111131160
0611133333311160
0611111111111160
0611131111311160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [num4, bitmap`
0666666666666660
0611111111111160
0611111111111160
0611133113311160
0611133113311160
0611133113311160
0611133333331160
0611111113311160
0611111113311160
0611111113311160
0611111111111160
0611131111311160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [num5, bitmap`
0666666666666660
0611111111111160
0611111111111160
0611133333331160
0611133111111160
0611133111111160
0611133333311160
0611111111131160
0611111111131160
0611133333311160
0611111111111160
0611131111311160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [num6, bitmap`
0666666666666660
0611111111111160
0611111111111160
0611113333311160
0611133111111160
0611133111111160
0611133333311160
0611133111131160
0611133111131160
0611113333311160
0611111111111160
0611131111311160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [num7, bitmap`
0666666666666660
0611111111111160
0611111111111160
0611133333331160
0611111111131160
0611111113311160
0611111133111160
0611111331111160
0611111331111160
0611111331111160
0611111111111160
0611131111311160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [num8, bitmap`
0666666666666660
0611111111111160
0611111111111160
0611113333311160
0611133111131160
0611133111131160
0611113333311160
0611133111131160
0611133111131160
0611113333311160
0611111111111160
0611131111311160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [num9, bitmap`
0666666666666660
0611111111111160
0611111111111160
0611113333311160
0611133111131160
0611133111131160
0611113333331160
0611111111131160
0611111111131160
0611113333311160
0611111111111160
0611131111311160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [slotTopL, bitmap`
................
................
....666666666666
...6699999999996
..66999999999996
..69966666666666
.66966666666666.
.6999999999996..
.6999999999996..
.6999999999996..
.6999999999996..
.6999999999996..
.6999999999996..
..99999999996...
..0000000000....
................`],
  [slotTop, bitmap`
................
................
6666666666666666
6999999999999996
6999999999999996
6666666666666666
.66666666666666.
..999999999999..
..999999999999..
..999999999999..
..999999999999..
..999999999999..
..999999999999..
...9999999999...
....00000000....
................`],
  [slotTopR, bitmap`
................
................
666666666666....
69999999999966..
699999999999966.
666666666669996.
.666666666669966
..6999999999996.
..6999999999996.
..6999999999996.
..6999999999996.
..6999999999996.
..6999999999996.
...6999999999...
....0000000000..
................`],
  [slotSideL, bitmap`
................
..6666666666....
.669999999966...
.699999999996...
.699666666666...
.6996...........
.6996...........
.6996...........
.6996...........
.6996...........
.699666666666...
.699999999996...
.669999999966...
..6666666666....
................
................`],
  [slotSideR, bitmap`
................
....6666666666..
...669999999966.
...699999999996.
...666666666996.
...........6996.
...........6996.
...........6996.
...........6996.
...........6996.
...666666666996.
...699999999996.
...669999999966.
....6666666666..
................
................`],
  [slotBaseL, bitmap`
................
..000000000000..
.6999999999996..
.6999999999996..
.6996666666696..
.6996......696..
.6996......696..
.6996666666696..
.6999999999996..
.6999999999996..
.6666666666666..
..333333333333..
...3333333333...
....00000000....
................
................`],
  [slotBase, bitmap`
................
0000000000000000
6999999999999996
6999999999999996
6996666666666996
6996........6996
6996........6996
6996666666666996
6999999999999996
6999999999999996
6666666666666666
3333333333333333
.33333333333333.
..000000000000..
................
................`],
  [slotBaseR, bitmap`
................
..000000000000..
..6999999999996.
..6999999999996.
..6996666666696.
..696......6996.
..696......6996.
..6996666666696.
..6999999999996.
..6999999999996.
..6666666666666.
..333333333333..
...3333333333...
....00000000....
................
................`],
  [reelFrame, bitmap`
6666666666666666
6999999999999996
69............96
69............96
69............96
69............96
69............96
69............96
69............96
69............96
69............96
69............96
69............96
6999999999999996
6666666666666666
................`],
  [slotHandle, bitmap`
................
.........6666...
........699996..
........699996..
.........6666...
.......66.......
.....66.........
....66..........
...66...........
..66............
.66.............
66..............
6...............
................
................
................`],
  [slotHandleDown, bitmap`
................
66..............
.66.............
..66............
...66...........
....66..........
.....66.........
.......66.......
.........6666...
........699996..
........699996..
.........6666...
................
................
................
................`],
  [cardBack, bitmap`
0666666666666660
0611111111111160
0611113333311160
0611111111311160
0611111113311160
0611111133111160
0611111331111160
0611111331111160
0611111111111160
0611111331111160
0611111111111160
0611111111111160
0611111111111160
0611111111111160
0666666666666660
0000000000000000`],
  [bg, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`]
);
setSolids([]);
setBackground(bg);
const blankMap = map`
..........
..........
..........
..........
..........
..........
..........
..........`;
setMap(blankMap);
let bgmPlayback = null, bgmTimer = null;
let bank = 150, jackpot = randJackpot();
let state = "title";
let reels = [cherry, lemon, seven], finalReels = [cherry, lemon, seven];
let currentCard = 5, nextCard = 5, cardReady = false;
let lastStartCard = 0, lastNextCard = 0;
let wheelIndex = 0, wheelSteps = 0, wheelFinal = 0, wheelDelay = 0, wheelCursor = null;
let slotTimer = null, cardTimer = null, wheelTimer = null, fxTimer = null, transitionTimer = null, titleTimer = null;
let tick = 0, lastStake = 0, lastStakeAllIn = false, heat = 0, fx = 0;
let resultText = "", resultGood = false, lastGame = "none";
let pendingWin = 0, pendingText = "", pendingBig = false, justRisked = false;
let introFx = 0;
const wheelPos = [[4, 2], [5, 2], [6, 3], [6, 4], [5, 5], [4, 5], [3, 4], [3, 3]];
let wheel = [], wheelMode = "safe", wheelBoost = 1, wheelBoosting = false;
let wheelBoards = { safe: null, hot: null }, wheelBoardIndexes = { safe: 0, hot: 0 };
const SAFE_MULT_POOL = [[1, 34], [2, 30], [3, 14], [4, 7], [5, 4], [6, 3],
  [8, 2], [10, 2], [15, 1], [20, 1], [25, 1], [30, 1]];
const HOT_MULT_POOL = [[1, 10], [2, 22], [3, 20], [4, 14], [5, 10], [6, 7],
  [8, 5], [10, 4], [15, 3], [20, 2], [25, 2], [30, 1]];
const BOOST_MULT_POOL = [[1, 14], [2, 30], [3, 22], [4, 12], [5, 8], [6, 5],
  [8, 3], [10, 2], [15, 2], [20, 1], [30, 1]];
const BOOST_POOL = [[1.5, 76], [2, 60], [3, 36], [4, 16], [5, 8], [8, 3], [10, 1]];
function wheelTypeForMult(mult) {
  if (mult === 1) return w1;
  if (mult === 2) return w2;
  if (mult === 3) return w3;
  if (mult === 4) return w4;
  if (mult === 5) return w5;
  if (mult === 6) return w6m;
  if (mult === 8) return w8m;
  if (mult === 10) return w10;
  if (mult === 15) return w15;
  if (mult === 20) return w20;
  if (mult === 25) return w25;
  return w30;
}
function wheelWeightForMult(mult) {
  if (mult <= 1) return 22;
  if (mult <= 2) return 18;
  if (mult <= 3) return 10;
  if (mult <= 5) return 6;
  if (mult <= 8) return 3;
  if (mult <= 10) return 2;
  return 1;
}
const BGM_STATES = ["title", "lobby", "slot", "slotChoice", "card", "wheel"];
const BET_STATES = ["lobby", "slot", "wheel"];
const STAKE_TIERS = [[5, [1, "ALL"]], [10, [1, 2, 5, "ALL"]], [25, [1, 2, 5, 10, "ALL"]],
  [75, [1, 5, 10, 25, "ALL"]], [300, [5, 10, 25, 50, 75, "ALL"]],
  [750, [5, 10, 25, 50, 75, 100, "ALL"]], [1500, [10, 25, 50, 75, 100, 250, "ALL"]],
  [3000, [25, 50, 75, 100, 250, 500, "ALL"]], [Infinity, [50, 75, 100, 250, 500, 1000, "ALL"]]];
const SLOT_TRIPLES = [[seven, "JACKPOT", 0, 3, true], [bar, "BAR", 15, 2, true],
  [bell, "BELL", 8, 2, true], [lemon, "WIN", 4, 1, false], [cherry, "WIN", 2, 1, false]];
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randJackpot() { return randInt(450, 850); }
function resetJackpot() { jackpot = randJackpot(); }
function feedJackpotByBet(gameState, amount) {
  if (gameState === "slot") {
    jackpot += Math.max(3, Math.floor(amount * 0.12));
  } else if (gameState === "wheel") {
    jackpot += Math.max(2, Math.floor(amount * 0.08));
  } else if (gameState === "card") {
    jackpot += Math.max(1, Math.floor(amount * 0.05));
  }
}
function feedJackpotByWin(returnedAmount, big) {
  const profit = returnedAmount - lastStake;
  if (profit <= 0) return;
  const rate = big ? 0.05 : 0.03;
  jackpot += Math.max(1, Math.floor(profit * rate));
}
function reduceJackpot(amount) { jackpot -= amount; if (jackpot < 450) resetJackpot(); }
function canBgmPlay() { return BGM_STATES.includes(state); }
function startBgm() {
  if (bgmPlayback === null && bgmTimer === null && state !== "bust" && canBgmPlay()) {
    bgmPlayback = playTune(bgm, Infinity);
  }
}
function stopBgm() {
  if (bgmTimer !== null) {
    clearTimeout(bgmTimer);
    bgmTimer = null;
  }
  if (bgmPlayback !== null) {
    bgmPlayback.end();
    bgmPlayback = null;
  }
}
function duckBgm(delay) {
  if (state === "bust") return;
  if (bgmTimer !== null) {
    clearTimeout(bgmTimer);
  }
  if (bgmPlayback !== null) {
    bgmPlayback.end();
    bgmPlayback = null;
  }
  bgmTimer = setTimeout(() => {
    bgmTimer = null;
    startBgm();
  }, delay);
}
function playSound(t, delay = 0) { if (delay > 0) duckBgm(delay); playTune(t); }
function goBust() { stopBgm(); state = "bust"; playTune(bustSfx); render(); }
function updateStakes() {
  const oldStake = stakes[stakeIndex];
  stakes = STAKE_TIERS.find(([limit]) => bank < limit)[1];
  if (oldStake === "ALL") {
    stakeIndex = stakes.length - 1;
    return;
  }
  const exact = stakes.indexOf(oldStake);
  if (exact >= 0) {
    stakeIndex = exact;
    return;
  }
  stakeIndex = stakes.reduce((best, s, i) =>
    s !== "ALL" && s <= oldStake ? i : best, 0);
}
function fmt(n) { return n >= 10000 ? Math.floor(n / 1000) + "K" : "" + n; }
function moneyText(label, returnedAmount) {
  const profit = returnedAmount - lastStake;
  if (profit > 0) return label + " +" + fmt(profit);
  if (profit < 0) return label + " " + fmt(-profit);
  return label + " +0";
}
function lossText(label) {
  if (label === "LOSS") return "LOST " + fmt(lastStake);
  if (label === "RISK") return "RISK LOST";
  if (label === "NO TIE") return "NO TIE";
  if (label === "TIE") return "TIE LOSS";
  return label;
}
function multLabel(mult) { return "" + mult; }
const TEXT_W = 20;
function centerText(text) { return Math.max(0, Math.floor((TEXT_W - text.length) / 2)); }
function rightText(text) { return Math.max(0, TEXT_W - text.length); }
function textUnderSprite(spriteX, text) { return Math.max(0, Math.round(spriteX * 2 + 1 - text.length / 2)); }
function clampHeat() { heat = Math.max(0, Math.min(8, heat)); }
function stakeLabel() { const s = stakes[stakeIndex]; return s === "ALL" ? "ALL" : "" + s; }
function stakeValue() { const s = stakes[stakeIndex]; return s === "ALL" ? bank : Math.min(s, bank); }
function cardSprite(n) { return cards[n - 1]; }
function prepScreen(showHud = true) { clearText(); setMap(blankMap); if (showHud) drawHud(); }
function clearGameTimers() {
  stopTitleFx();
  if (slotTimer !== null) {
    clearInterval(slotTimer);
    slotTimer = null;
  }
  if (cardTimer !== null) {
    clearInterval(cardTimer);
    cardTimer = null;
  }
  if (wheelTimer !== null) {
    clearTimeout(wheelTimer);
    wheelTimer = null;
  }
}
function clearTransition() { if (transitionTimer !== null) { clearTimeout(transitionTimer); transitionTimer = null; } }
function stopTitleFx() { if (titleTimer !== null) { clearInterval(titleTimer); titleTimer = null; } }
function startTitleFx() {
  stopTitleFx();
  introFx = 0;
  titleTimer = setInterval(() => {
    if (state !== "title") {
      stopTitleFx();
      return;
    }
    introFx = (introFx + 1) % 8;
    render();
  }, 220);
}
function stopFx() { if (fxTimer !== null) { clearInterval(fxTimer); fxTimer = null; } fx = 0; }
function startFx() {
  stopFx();
  fx = 1;
  fxTimer = setInterval(() => {
    fx++;
    if (fx > 12) {
      stopFx();
    }
    render();
  }, 100);
}
function playTick() {
  if (Math.random() < 0.5) {
    playTune(tickSfx);
  } else {
    playTune(tickSfx2);
  }
}
function isProtectedSprite(type) {
  return type === reelFrame ||
    type === slotTopL || type === slotTop || type === slotTopR ||
    type === slotSideL || type === slotSideR ||
    type === slotBaseL || type === slotBase || type === slotBaseR ||
    type === slotHandle || type === slotHandleDown;
}
function setTileType(x, y, type) {
  const sprites = getTile(x, y);
  for (const spr of sprites) {
    if (!isProtectedSprite(spr.type)) {
      spr.type = type;
      spr.bitmapKey = type;
      return;
    }
  }
}
function txt(s, x, y, c) { addText(s, { x, y, color: c }); }
function txtC(s, y, c) { txt(s, centerText(s), y, c); }
function txtR(s, y, c) { txt(s, rightText(s), y, c); }
function sprs(list) {
  for (const [x, y, t] of list) {
    addSprite(x, y, t);
  }
}
function drawBack(y) { txtR("K BACK", y, color`9`); }
function drawSlotMachine(a, b, c, pulled) {
  sprs([
    [2, 2, slotTopL], [3, 2, slotTop], [4, 2, slotTop], [5, 2, slotTop], [6, 2, slotTopR],
    [2, 3, slotSideL], [6, 3, slotSideR], [7, 3, pulled ? slotHandleDown : slotHandle],
    [2, 4, slotBaseL], [3, 4, slotBase], [4, 4, slotBase], [5, 4, slotBase], [6, 4, slotBaseR]
  ]);
  [a, b, c].forEach((t, i) => {
    addSprite(3 + i, 3, t);
    addSprite(3 + i, 3, reelFrame);
  });
}
function drawFx() {
  if (fx <= 0) return;
  sprs(fx % 2 === 0
    ? [[1, 2, spark], [7, 2, spark], [1, 5, spark], [7, 5, spark]]
    : [[2, 2, spark], [6, 2, spark], [2, 5, spark], [6, 5, spark]]);
}
function drawHud() { const betText = "BET " + stakeLabel(); txt("BANK " + fmt(bank), 1, 1, color`4`); txtR(betText, 1, color`3`); }
function drawTitle() {
  prepScreen(false);
  txtC("CASINO", 2, color`6`);
  sprs([
    [2, 4, cherry],
    [3, 4, lemon],
    [4, 4, seven],
    [6, 4, cardSprite(7)],
    [8, 4, wheelIcon]
  ]);
  if (introFx % 2 === 0) {
    sprs([[1, 2, spark], [8, 2, spark], [1, 6, spark], [8, 6, spark]]);
  } else {
    sprs([[2, 2, spark], [7, 2, spark], [2, 6, spark], [7, 6, spark]]);
  }
  txtC("PRESS ANY KEY", 11, color`7`);
  txtC("ssoggytacoman", 14, color`H`);
}
function drawLobby() {
  prepScreen(true);
  txtC("CASINO", 3, color`6`);
  sprs([
    [1, 4, cherry],
    [2, 4, lemon],
    [3, 4, seven],
    [5, 4, cardSprite(5)],
    [8, 4, wheelIcon]
  ]);
  txt("J", 2, 7, color`2`);
  txt("I", 8, 7, color`2`);
  txt("L", 15, 7, color`2`);
  txt("SLOT", 1, 10, color`D`);
  txt("CARD", 7, 10, color`8`);
  txt("WHEEL", 12, 10, color`6`);
  txtC("JACKPOT " + fmt(jackpot), 12, color`6`);
  txtC("A/D BET", 14, color`H`);
}
function drawSlot() {
  prepScreen(true);
  drawSlotMachine(reels[0], reels[1], reels[2], false);
  txtC("JACKPOT " + fmt(jackpot), 10, color`6`);
  txt("J SPIN", 1, 13, color`7`);
  drawBack(13);
  txtC("A/D BET", 14, color`H`);
}
function drawSlotSpin() {
  prepScreen(true);
  drawSlotMachine(reels[0], reels[1], reels[2], true);
  txtC("SPINNING", 13, color`6`);
}
function drawSlotChoice() {
  prepScreen(true);
  drawSlotMachine(reels[0], justRisked ? chip : reels[1], reels[2], false);
  if (pendingBig) {
    drawFx();
  }
  txtC(pendingText, 10, color`6`);
  txt("J RISK", 0, 14, color`3`);
  txtR("L CASH", 14, color`4`);
}
function drawRiskRoll() {
  prepScreen(true);
  drawSlotMachine(reels[0], chip, reels[2], true);
  txtC("DOUBLE?", 10, color`6`);
}
function drawCardTable(leftCard, rightCard, revealRight) {
  addSprite(3, 3, cardSprite(leftCard));
  addSprite(6, 3, revealRight ? cardSprite(rightCard) : cardBack);
  txt("CARD", textUnderSprite(3, "CARD"), 9, color`2`);
  txt("NEXT?", textUnderSprite(6, "NEXT?"), 9, color`2`);
}
function drawCard() {
  prepScreen(true);
  drawCardTable(currentCard, nextCard, false);
  drawBack(3);
  txtC("A/D BET", 12, color`H`);
  txt("J LOW", 0, 14, color`7`);
  txtC("I TIE", 14, color`6`);
  txtR("L HIGH", 14, color`7`);
}
function drawCardRoll() {
  prepScreen(true);
  drawCardTable(currentCard, nextCard, true);
  txtC("DRAW", 11, color`2`);
}
function drawWheelLights() {
  const phase = state === "wheelSpin" ? wheelIndex % 2 : introFx % 2;
  if (phase === 0) {
    sprs([[2, 2, spark], [7, 5, spark]]);
  } else {
    sprs([[7, 2, spark], [2, 5, spark]]);
  }
}
function drawWheelBase(showCursor) {
  drawWheelLights();
  for (let i = 0; i < wheel.length; i++) {
    const p = wheelPos[i];
    addSprite(p[0], p[1], wheel[i].type);
  }
  if (showCursor) {
    const p = wheelPos[wheelIndex];
    addSprite(p[0], p[1], cursorMark);
    wheelCursor = getFirst(cursorMark);
  }
}
function drawWheel() {
  prepScreen(true);
  drawWheelBase(true);
  txtC((wheelMode === "hot" ? "HOT" : "SAFE") + " JP " + fmt(jackpot), 12, wheelMode === "hot" ? color`3` : color`6`);
  txt("J SPIN", 0, 14, color`7`);
  txtC(wheelMode === "hot" ? "I SAFE" : "I HOT", 14, color`H`);
  drawBack(14);
}
function drawWheelSpin() {
  prepScreen(true);
  drawWheelBase(true);
  txtC(wheelBoosting ? "OVERCHARGE" : "SPINNING", 12, color`6`);
}
function drawLastBoard() {
  if (lastGame === "slot") {
    drawSlotMachine(
      reels[0],
      justRisked ? chip : reels[1],
      reels[2],
      false
    );
  } else if (lastGame === "card") {
    addSprite(3, 3, cardSprite(currentCard));
    addSprite(6, 3, cardSprite(nextCard));
  } else if (lastGame === "wheel") {
    drawWheelBase(false);
    const p = wheelPos[wheelIndex];
    addSprite(p[0], p[1], cursorMark);
  }
}
function drawResult() {
  prepScreen(true);
  drawLastBoard();
  if (resultGood && lastGame !== "wheel") {
    drawFx();
  }
  if (lastGame === "wheel" && resultGood) {
    addSprite(4, 3, spark);
  }
  if (resultGood && lastGame === "wheel" && wheel[wheelIndex].mult >= 5) {
    sprs([[2, 3, spark], [7, 3, spark]]);
  }
  const y = lastGame === "wheel" ? 12 : 10;
  txtC(resultText, y, resultGood ? color`6` : color`2`);
}
function drawLoss() {
  prepScreen(true);
  drawLastBoard();
  if (lastGame === "none" || lastGame === "wheel") {
    addSprite(4, 3, skull);
  }
  const y = lastGame === "wheel" ? 12 : 10;
  txtC(resultText, y, color`3`);
  txtC("...", y + 2, color`3`);
}
function drawBust() {
  prepScreen(false);
  addSprite(4, 3, skull);
  txtC("BUST", 10, color`3`);
  txtC("RESTART", 12, color`2`);
  txtC("ANY KEY", 14, color`2`);
}
const screens = { title: drawTitle, lobby: drawLobby, slot: drawSlot, slotSpin: drawSlotSpin,
  slotChoice: drawSlotChoice, riskRoll: drawRiskRoll, card: drawCard, cardRoll: drawCardRoll,
  wheel: drawWheel, wheelSpin: drawWheelSpin, result: drawResult, loss: drawLoss, bust: drawBust };
function render() { screens[state](); }
function weightedPick(weights) {
  let total = 0;
  for (const w of weights) {
    total += w[1];
  }
  let roll = Math.floor(Math.random() * total);
  for (const w of weights) {
    if (roll < w[1]) return w[0];
    roll -= w[1];
  }
  return weights[0][0];
}
function shuffleList(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}
function buildWheel(boosted = false, mode = wheelMode) {
  const entries = [];
  let skullCount = 2;
  let multPool = mode === "hot" ? HOT_MULT_POOL : SAFE_MULT_POOL;
  let skullWeight = 22;
  let chipWeight = 10;
  let sparkChance = mode === "hot" ? 55 : 18;
  let sparkWeight = mode === "hot" ? 4 : 3;
  let jackpotChance = mode === "hot" ? 65 : 25;
  let jackpotWeight = mode === "hot" ? 9 : 6;
  if (boosted) {
    skullCount = weightedPick([
      [1, 85],
      [2, 15]
    ]);
    multPool = BOOST_MULT_POOL;
    skullWeight = 8;
    chipWeight = 11;
    sparkChance = 18;
    sparkWeight = 2;
    jackpotChance = 0;
  } else if (mode === "safe") {
    skullCount = weightedPick([
      [1, 45],
      [2, 55]
    ]);
    skullWeight = 24;
  } else {
    skullCount = weightedPick([
      [2, 60],
      [3, 40]
    ]);
    skullWeight = 28;
    chipWeight = 9;
  }
  for (let i = 0; i < skullCount; i++) {
    entries.push({
      kind: "skull",
      type: skull,
      mult: 0,
      weight: skullWeight
    });
  }
  entries.push({
    kind: "chip",
    type: chip,
    mult: 0,
    weight: chipWeight
  });
  if (Math.random() * 100 < sparkChance) {
    entries.push({
      kind: "spark",
      type: spark,
      mult: 0,
      weight: sparkWeight
    });
  }
  if (Math.random() * 100 < jackpotChance) {
    entries.push({
      kind: "jackpot",
      type: seven,
      mult: 0,
      weight: jackpotWeight
    });
  }
  while (entries.length < 8) {
    const mult = weightedPick(multPool);
    entries.push({
      kind: "mult",
      type: wheelTypeForMult(mult),
      mult,
      weight: wheelWeightForMult(mult)
    });
  }
  return shuffleList(entries);
}
function randomizeWheel(boosted = false) {
  wheel = buildWheel(boosted, wheelMode);
  wheelIndex = randInt(0, wheel.length - 1);
  wheelCursor = null;
  if (!boosted) {
    wheelBoards[wheelMode] = wheel;
    wheelBoardIndexes[wheelMode] = wheelIndex;
  }
}
function loadWheelMode(mode) {
  wheelMode = mode;
  if (wheelBoards[mode]) {
    wheel = wheelBoards[mode];
    wheelIndex = wheelBoardIndexes[mode] || 0;
    wheelCursor = null;
  } else {
    randomizeWheel(false);
  }
}
function drawStartCard() {
  let n = randInt(3, 7);
  let tries = 0;
  while (n === lastStartCard && tries < 8) {
    n = randInt(3, 7);
    tries++;
  }
  lastStartCard = n;
  return n;
}
function drawFinalNextCard() {
  let n = randInt(1, 9);
  let tries = 0;
  while (n === lastNextCard && tries < 6) {
    n = randInt(1, 9);
    tries++;
  }
  lastNextCard = n;
  return n;
}
function prepareCardRound() {
  currentCard = drawStartCard();
  nextCard = 5;
  cardReady = true;
}
function pressure() {
  const before = bank + lastStake;
  if (before <= 0) return 1;
  return lastStake / before;
}
function spendStake() {
  const stake = stakeValue();
  lastStakeAllIn = stakes[stakeIndex] === "ALL";
  if (stake <= 0 || bank <= 0) {
    goBust();
    return 0;
  }
  bank -= stake;
  lastStake = stake;
  feedJackpotByBet(state, stake);
  return stake;
}
function slotSymbol() {
  const p = pressure();
  if (lastStakeAllIn || p >= 0.65 || heat >= 6) {
    return weightedPick([
      [cherry, 43],
      [lemon, 29],
      [bell, 18],
      [bar, 8],
      [seven, 2]
    ]);
  }
  if (p >= 0.3 || heat >= 3) {
    return weightedPick([
      [cherry, 37],
      [lemon, 28],
      [bell, 21],
      [bar, 10],
      [seven, 4]
    ]);
  }
  return weightedPick([
    [cherry, 31],
    [lemon, 26],
    [bell, 22],
    [bar, 14],
    [seven, 7]
  ]);
}
function weightedNot(symbol) {
  let s = slotSymbol(), tries = 0;
  while (s === symbol && tries < 20) { s = slotSymbol(); tries++; }
  return s;
}
function makePairResult(symbol) { const out = [symbol, symbol, symbol]; out[randInt(0, 2)] = weightedNot(symbol); return out; }
function makeSlotResult() {
  const p = pressure();
  let lose = 48;
  let pair = 25;
  let smallTriple = 16;
  let bigTriple = 9;
  let jackpotOdds = 2;
  if (lastStakeAllIn || p >= 0.65 || heat >= 6) {
    lose = 60;
    pair = 22;
    smallTriple = 10;
    bigTriple = 6;
    jackpotOdds = 2;
  } else if (p >= 0.3 || heat >= 3) {
    lose = 55;
    pair = 23;
    smallTriple = 13;
    bigTriple = 7;
    jackpotOdds = 2;
  }
  const outcome = weightedPick([
    ["lose", lose],
    ["pair", pair],
    ["small", smallTriple],
    ["big", bigTriple],
    ["jackpot", jackpotOdds]
  ]);
  if (outcome === "jackpot") return [seven, seven, seven];
  if (outcome === "big") {
    return Math.random() < 0.55
      ? [bar, bar, bar]
      : [bell, bell, bell];
  }
  if (outcome === "small") {
    return Math.random() < 0.55
      ? [lemon, lemon, lemon]
      : [cherry, cherry, cherry];
  }
  if (outcome === "pair") {
    const symbol = weightedPick([
      [cherry, 48],
      [lemon, 30],
      [bell, 15],
      [bar, 6],
      [seven, 1]
    ]);
    return makePairResult(symbol);
  }
  let a = slotSymbol();
  let b = weightedNot(a);
  let c = weightedNot(b);
  let tries = 0;
  while ((a === b || b === c || a === c) && tries < 20) {
    a = slotSymbol();
    b = weightedNot(a);
    c = weightedNot(b);
    tries++;
  }
  return [a, b, c];
}
function openSlot() {
  if (state !== "lobby") return;
  stopFx();
  clearTransition();
  state = "slot";
  playSound(betSfx);
  render();
}
function startSlotSpin() {
  if (state !== "slot") return;
  stopFx();
  clearTransition();
  const stake = spendStake();
  if (stake === 0) return;
  justRisked = false;
  lastGame = "slot";
  state = "slotSpin";
  tick = 0;
  finalReels = makeSlotResult();
  playSound(spinSfx, 500);
  render();
  slotTimer = setInterval(() => {
    tick++;
    if (tick % 5 === 0) {
      playTick();
    }
    reels[0] = tick < 18 ? slotSymbol() : finalReels[0];
    reels[1] = tick < 34 ? slotSymbol() : finalReels[1];
    reels[2] = tick < 50 ? slotSymbol() : finalReels[2];
    setTileType(3, 3, reels[0]);
    setTileType(4, 3, reels[1]);
    setTileType(5, 3, reels[2]);
    if (tick >= 50) {
      finishSlot();
    }
  }, 65);
}
function finishSlot() {
  clearInterval(slotTimer);
  slotTimer = null;
  reels = finalReels;
  setTileType(3, 3, reels[0]);
  setTileType(4, 3, reels[1]);
  setTileType(5, 3, reels[2]);
  transitionTimer = setTimeout(() => {
    scoreSlot();
  }, 450);
}
function offerSlotWin(amount, text, big) {
  pendingWin = amount;
  pendingText = text;
  pendingBig = big;
  state = "slotChoice";
  if (big) {
    startFx();
  } else {
    stopFx();
  }
  render();
  if (big) {
    playSound(bigWinSfx, 1200);
  } else {
    playSound(winSfx, 900);
  }
}
function takeSlotWin() {
  if (state !== "slotChoice") return;
  bank += pendingWin;
  const taken = pendingWin;
  feedJackpotByWin(taken, pendingBig);
  pendingWin = 0;
  pendingText = "";
  pendingBig = false;
  showResult(moneyText("CASH", taken), true, 1000);
  playSound(winSfx, 900);
}
function riskSlotWin() {
  if (state !== "slotChoice") return;
  stopFx();
  clearTransition();
  justRisked = true;
  state = "riskRoll";
  playSound(spinSfx, 500);
  render();
  transitionTimer = setTimeout(() => {
    const won = Math.random() < 0.45;
    if (won) {
      const doubled = pendingWin * 2;
      heat += 1;
      clampHeat();
      pendingWin = doubled;
      pendingText = moneyText("DOUBLE", doubled);
      pendingBig = true;
      state = "slotChoice";
      startFx();
      render();
      playSound(bigWinSfx, 1200);
    } else {
      heat -= 1;
      clampHeat();
      pendingWin = 0;
      pendingText = "";
      pendingBig = false;
      if (bank <= 0) {
        goBust();
      } else {
        showLoss(lossText("RISK"), 1800);
        playSound(loseSfx, 1200);
      }
    }
  }, 900);
}
function scoreSlot() {
  justRisked = false;
  const [a, b, c] = reels;
  if (a === b && b === c) {
    const rule = SLOT_TRIPLES.find(([symbol]) => symbol === a);
    if (rule) {
      const [symbol, label, mult, heatGain, big] = rule;
      const jackpotPrize = lastStake < 10 ? Math.floor(jackpot * 0.5) : jackpot;
      const payout = symbol === seven ? lastStake + jackpotPrize : lastStake * mult;
      if (symbol === seven) {
        lastStake < 10 ? reduceJackpot(jackpotPrize) : resetJackpot();
      }
      heat += heatGain;
      clampHeat();
      offerSlotWin(payout, moneyText(label, payout), big);
      return;
    }
  }
  if (a === b || b === c || a === c) {
    const refund = Math.floor(lastStake * 0.75);
    bank += refund;
    showResult(moneyText("PAIR", refund), false, 1100);
    playTune(tickSfx);
    return;
  }
  heat -= 1;
  clampHeat();
  if (bank <= 0) {
    goBust();
    return;
  }
  showLoss(lossText("LOSS"), 1900);
  playSound(loseSfx, 1200);
}
function startCard() {
  if (state !== "lobby") return;
  stopFx();
  clearTransition();
  if (!cardReady) {
    prepareCardRound();
  }
  state = "card";
  playSound(betSfx);
  render();
}
function cardPayoutMultiplier(choice) {
  if (choice === "tie") {
    let mult = 8.2 + heat * 0.05;
    if (lastStakeAllIn) {
      mult -= 0.15;
    }
    if (mult < 7.5) mult = 7.5;
    if (mult > 9) mult = 9;
    return mult;
  }
  let winningNumbers = 0;
  if (choice === "high") {
    winningNumbers = 9 - currentCard;
  } else {
    winningNumbers = currentCard - 1;
  }
  let mult = 9 / winningNumbers * 0.88 + 0.2;
  if (mult < 1.45) mult = 1.45;
  if (mult > 5.5) mult = 5.5;
  mult += heat * 0.03;
  if (lastStakeAllIn) {
    mult -= 0.08;
  }
  if (mult < 1.35) mult = 1.35;
  return mult;
}
function guessCard(choice) {
  if (state !== "card") return;
  const stake = spendStake();
  if (stake === 0) return;
  lastGame = "card";
  cardReady = false;
  const finalNextCard = drawFinalNextCard();
  let rollTicks = 0;
  nextCard = randInt(1, 9);
  state = "cardRoll";
  playSound(spinSfx, 500);
  render();
  cardTimer = setInterval(() => {
    rollTicks++;
    nextCard = randInt(1, 9);
    setTileType(6, 3, cardSprite(nextCard));
    if (rollTicks % 5 === 0) {
      playTick();
    }
    if (rollTicks >= 24) {
      clearInterval(cardTimer);
      cardTimer = null;
      nextCard = finalNextCard;
      setTileType(6, 3, cardSprite(nextCard));
      transitionTimer = setTimeout(() => {
        resolveCardGame(choice, stake);
      }, 1300);
    }
  }, 70);
}
function resolveCardGame(choice, stake) {
  let won = false;
  if (choice === "tie") {
    won = nextCard === currentCard;
  } else if (choice === "high") {
    won = nextCard > currentCard;
  } else {
    won = nextCard < currentCard;
  }
  if (won) {
    const payout = Math.floor(stake * cardPayoutMultiplier(choice));
    const label = choice === "tie"
      ? moneyText("TIE", payout)
      : moneyText("WIN", payout);
    heat += choice === "tie" ? 2 : 1;
    clampHeat();
    payWin(payout, label, choice === "tie");
    playSound(choice === "tie" ? bigWinSfx : winSfx, choice === "tie" ? 1200 : 900);
  } else {
    heat -= 1;
    clampHeat();
    if (bank <= 0) {
      goBust();
    } else if (choice === "tie") {
      showLoss(lossText("NO TIE"), 1900);
      playSound(loseSfx, 1200);
    } else if (nextCard === currentCard) {
      showLoss(lossText("TIE"), 2100);
      playSound(loseSfx, 1200);
    } else {
      showLoss(lossText("LOSS"), 1900);
      playSound(loseSfx, 1200);
    }
  }
}
function startWheel() {
  if (state !== "lobby") return;
  stopFx();
  clearTransition();
  state = "wheel";
  playSound(betSfx);
  render();
}
function pickWheelFinal() {
  const options = [];
  for (let i = 0; i < wheel.length; i++) {
    options.push([i, wheel[i].weight]);
  }
  return weightedPick(options);
}
function pickWheelBoost() { return weightedPick(BOOST_POOL); }
function chipReturnAmount(baseAmount) { return baseAmount + Math.max(2, Math.floor(baseAmount * 0.2)); }
function toggleWheelMode() {
  if (state !== "wheel") return;
  wheelBoardIndexes[wheelMode] = wheelIndex;
  loadWheelMode(wheelMode === "safe" ? "hot" : "safe");
  playSound(tickSfx);
  render();
}
function startWheelSpinFromCurrent() {
  wheelFinal = pickWheelFinal();
  const offset = (wheelFinal - wheelIndex + wheel.length) % wheel.length;
  const cycles = 5 + randInt(0, 1);
  wheelSteps = cycles * wheel.length + offset;
  wheelDelay = 18;
  state = "wheelSpin";
  playSound(spinSfx, 500);
  render();
  advanceWheelSpin();
}
function showWheelBoostText() {
  clearTransition();
  resultText = "BOOST " + multLabel(wheelBoost) + "X";
  resultGood = true;
  state = "result";
  startFx();
  render();
  transitionTimer = setTimeout(() => {
    stopFx();
    randomizeWheel(true);
    startWheelSpinFromCurrent();
  }, 950);
}
function spinWheel() {
  if (state !== "wheel") return;
  const stake = spendStake();
  if (stake === 0) return;
  lastGame = "wheel";
  wheelBoost = 1;
  wheelBoosting = false;
  startWheelSpinFromCurrent();
}
function advanceWheelSpin() {
  wheelTimer = setTimeout(() => {
    wheelIndex = (wheelIndex + 1) % wheel.length;
    wheelSteps--;
    if (wheelSteps % 2 === 0 && wheelDelay > 35) {
      playTick();
    }
    if (wheelSteps <= 2) {
      wheelDelay += 145;
    } else if (wheelSteps <= 5) {
      wheelDelay += 85;
    } else if (wheelSteps <= 10) {
      wheelDelay += 45;
    } else if (wheelSteps <= 18) {
      wheelDelay += 15;
    } else {
      wheelDelay += 1;
    }
    if (wheelCursor) {
      const p = wheelPos[wheelIndex];
      wheelCursor.x = p[0];
      wheelCursor.y = p[1];
    }
    if (wheelSteps <= 0) {
      freezeWheelResult();
    } else {
      advanceWheelSpin();
    }
  }, wheelDelay);
}
function freezeWheelResult() {
  clearTimeout(wheelTimer);
  wheelTimer = null;
  wheelIndex = wheelFinal;
  if (wheelCursor) {
    const p = wheelPos[wheelIndex];
    wheelCursor.x = p[0];
    wheelCursor.y = p[1];
  }
  const landed = wheel[wheelIndex];
  if (landed.kind === "skull") {
    addSprite(4, 3, skull);
    playSound(loseSfx, 1200);
  } else if (landed.kind === "jackpot") {
    addSprite(4, 3, seven);
    sprs([[2, 3, spark], [7, 3, spark]]);
    playSound(bigWinSfx, 1200);
  } else if (landed.kind === "spark" || landed.mult >= 5) {
    addSprite(4, 3, spark);
    sprs([[2, 3, spark], [7, 3, spark]]);
    playSound(bigWinSfx, 1200);
  } else {
    playSound(winSfx, 900);
  }
  transitionTimer = setTimeout(() => {
    finishWheel();
  }, landed.kind === "spark" && !wheelBoosting ? 650 : 1100);
}
function finishWheel() {
  clearTransition();
  const landed = wheel[wheelIndex];
  if (landed.kind === "spark" && !wheelBoosting) {
    wheelBoost = pickWheelBoost();
    wheelBoosting = true;
    showWheelBoostText();
    return;
  }
  if (landed.kind === "spark" && wheelBoosting) {
    const returned = Math.floor(lastStake * wheelBoost);
    heat += returned > lastStake ? 1 : 0;
    clampHeat();
    wheelBoosting = false;
    payWin(
      returned,
      moneyText("BOOST CASH", returned),
      wheelBoost >= 4
    );
    return;
  }
  if (landed.kind === "jackpot") {
    const prize = Math.max(1, Math.floor(jackpot * (lastStake < 10 ? 0.25 : 0.5)));
    const returned = lastStake + prize;
    reduceJackpot(prize);
    heat += 2;
    clampHeat();
    wheelBoosting = false;
    payWin(
      returned,
      moneyText("JACKPOT", returned),
      true,
      false
    );
    return;
  }
  if (landed.kind === "skull") {
    heat -= 1;
    clampHeat();
    wheelBoosting = false;
    if (bank <= 0) {
      goBust();
    } else {
      showLoss(lossText("LOSS"), 1900);
    }
    return;
  }
  if (landed.kind === "chip") {
    const baseAmount = Math.floor(lastStake * wheelBoost);
    const returned = chipReturnAmount(baseAmount);
    heat += 1;
    clampHeat();
    const big = wheelBoost >= 3;
    wheelBoosting = false;
    payWin(returned, moneyText("CHIP", returned), big);
    return;
  }
  if (landed.mult === 1 && wheelBoost === 1) {
    bank += lastStake;
    wheelBoosting = false;
    showResult(moneyText("1X", lastStake), false, 1100);
    return;
  }
  const payout = Math.floor(lastStake * landed.mult * wheelBoost);
  heat += landed.mult >= 5 || wheelBoost >= 3 ? 2 : 1;
  clampHeat();
  const label = landed.mult + "X";
  const big = landed.mult >= 5 || wheelBoost >= 3;
  wheelBoosting = false;
  payWin(
    payout,
    moneyText(label, payout),
    big
  );
}
function payWin(amount, text, big, feedJackpot = true) {
  bank += amount;
  if (feedJackpot) {
    feedJackpotByWin(amount, big);
  }
  showResult(text, true, big ? 1500 : 1200);
}
function finishRoundToLobby(currentState) {
  stopFx();
  updateStakes();
  if (state === currentState) {
    if (bank <= 0) {
      goBust();
      return;
    }
    if (lastGame === "slot") {
      state = "slot";
    } else if (lastGame === "wheel") {
      wheelBoost = 1;
      wheelBoosting = false;
      randomizeWheel(false);
      state = "wheel";
    } else if (lastGame === "card") {
      prepareCardRound();
      state = "card";
    } else {
      state = "lobby";
    }
    render();
    startBgm();
  }
}
function showResult(text, good, delay) {
  clearTransition();
  state = "result";
  resultText = text;
  resultGood = good;
  if (good) {
    startFx();
  } else {
    stopFx();
  }
  render();
  transitionTimer = setTimeout(() => {
    finishRoundToLobby("result");
  }, delay);
}
function showLoss(text, delay) {
  clearTransition();
  stopFx();
  state = "loss";
  resultText = text;
  resultGood = false;
  render();
  transitionTimer = setTimeout(() => {
    finishRoundToLobby("loss");
  }, delay);
}
function canChangeBet() {
  return BET_STATES.includes(state) || state === "card";
}
function changeStake(delta) {
  if (!canChangeBet()) return;
  updateStakes();
  stakeIndex = (stakeIndex + delta + stakes.length) % stakes.length;
  playSound(tickSfx);
  render();
}
function nextStake() { changeStake(1); }
function prevStake() { changeStake(-1); }
function newGame() {
  clearGameTimers();
  clearTransition();
  stopFx();
  bank = 150;
  resetJackpot();
  stakeIndex = 1;
  updateStakes();
  state = "lobby";
  reels = [cherry, lemon, seven];
  finalReels = [cherry, lemon, seven];
  currentCard = 5;
  nextCard = 5;
  cardReady = false;
  lastStartCard = 0;
  lastNextCard = 0;
  wheelMode = "safe";
  wheelBoost = 1;
  wheelBoosting = false;
  wheelBoards = { safe: null, hot: null };
  wheelBoardIndexes = { safe: 0, hot: 0 };
  randomizeWheel(false);
  wheelSteps = 0;
  wheelFinal = 0;
  wheelDelay = 0;
  wheelCursor = null;
  tick = 0;
  lastStake = 0;
  lastStakeAllIn = false;
  heat = 0;
  fx = 0;
  resultText = "";
  resultGood = false;
  lastGame = "none";
  pendingWin = 0;
  pendingText = "";
  pendingBig = false;
  justRisked = false;
  setMap(blankMap);
  playSound(betSfx);
  render();
  startBgm();
}
function goLobby() {
  if (state === "wheel") {
    wheelBoost = 1;
    wheelBoosting = false;
  }
  lastGame = "none";
  state = "lobby";
  playSound(betSfx);
  render();
  startBgm();
}
function enterLobbyFromTitle() {
  stopTitleFx();
  state = "lobby";
  playSound(betSfx);
  render();
  startBgm();
}
function wakeBgm() { if (state !== "bust") startBgm(); }
function titleOrBust() {
  if (state === "title") {
    enterLobbyFromTitle();
    return true;
  }
  if (state === "bust") {
    newGame();
    return true;
  }
  return false;
}
onInput("a", () => {
  if (titleOrBust()) return;
  wakeBgm();
  if (state !== "slotChoice") prevStake();
});
onInput("d", () => {
  if (titleOrBust()) return;
  wakeBgm();
  if (state !== "slotChoice") nextStake();
});
onInput("j", () => {
  if (titleOrBust()) return;
  wakeBgm();
  if (state === "lobby") {
    openSlot();
  } else if (state === "card") {
    guessCard("low");
  } else if (state === "slotChoice") {
    riskSlotWin();
  } else if (state === "slot") {
    startSlotSpin();
  } else if (state === "wheel") {
    spinWheel();
  }
});
onInput("i", () => {
  if (titleOrBust()) return;
  wakeBgm();
  if (state === "lobby") {
    startCard();
  } else if (state === "card") {
    guessCard("tie");
  } else if (state === "wheel") {
    toggleWheelMode();
  }
});
onInput("k", () => {
  if (titleOrBust()) return;
  wakeBgm();
  if (state === "slotChoice") {
    takeSlotWin();
  } else if (state === "slot" || state === "card" || state === "wheel") {
    goLobby();
  }
});
onInput("l", () => {
  if (titleOrBust()) return;
  wakeBgm();
  if (state === "lobby") {
    startWheel();
  } else if (state === "card") {
    guessCard("high");
  } else if (state === "slotChoice") {
    takeSlotWin();
  }
});
onInput("w", () => {
  titleOrBust();
});
onInput("s", () => {
  titleOrBust();
});
randomizeWheel(false);
updateStakes();
startTitleFx();
startBgm();
render();
