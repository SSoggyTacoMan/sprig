{\rtf1\ansi\ansicpg1252\cocoartf2907
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 /*\
@title: Pocket Vermin LCD\
@description: Sprig remake of Vermin with LCD-style timing, bursts, misses, and five-lane mole logic.\
@author: SSoggyTacoMan\
@tags: ['test', 'review']\
@addedOn: 2026-09-11\
\
Controls:\
A / D = move left / right\
J     = start Game A\
L     = start Game B\
I     = clock screen\
K     = reset / ACL\
\
Important:\
Sprig is tile-based and cannot use the original PNG screen layers directly.\
This version translates the original LCD logic and uses hand-converted 16x16 LCD silhouettes.\
*/\
\
const S_BG = "Z";\
const S_HOLE = "V";\
const S_MAN1 = "a";\
const S_MAN2 = "b";\
const S_MAN3 = "c";\
const S_LU1 = "d";\
const S_LU2 = "e";\
const S_LU3 = "f";\
const S_RU1 = "g";\
const S_RU2 = "h";\
const S_RU3 = "i";\
const S_LD1 = "j";\
const S_LD2 = "k";\
const S_LD3 = "l";\
const S_RD1 = "m";\
const S_RD2 = "n";\
const S_RD3 = "o";\
const S_MOLE1 = "p";\
const S_MOLE2 = "q";\
const S_MOLE3 = "r";\
const S_MOLE4 = "s";\
const S_MOLE5 = "t";\
const S_H11 = "u";\
const S_H12 = "v";\
const S_H13 = "w";\
const S_H21 = "x";\
const S_H22 = "y";\
const S_H23 = "z";\
const S_H31 = "A";\
const S_H32 = "B";\
const S_H33 = "C";\
const S_H41 = "D";\
const S_H42 = "E";\
const S_H43 = "F";\
const S_H51 = "G";\
const S_H52 = "H";\
const S_H53 = "I";\
const S_MISS = "J";\
const S_NUM0 = "K";\
const S_NUM1 = "L";\
const S_NUM2 = "M";\
const S_NUM3 = "N";\
const S_NUM4 = "O";\
const S_NUM5 = "P";\
const S_NUM6 = "Q";\
const S_NUM7 = "R";\
const S_NUM8 = "S";\
const S_NUM9 = "T";\
const S_COLON = "U";\
\
setLegend(\
  [ S_BG, bitmap`\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222\
2222222222222222` ],\
  [ S_HOLE, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
................\
......0000......\
....00000000....\
......0000......\
................\
................\
................` ],\
  [ S_MAN1, bitmap`\
................\
.......00.......\
.....000000.....\
.....000000.....\
....00000000....\
....00000000....\
.....000000.....\
.......00.......\
.......00.......\
......0000......\
......0000......\
......000.......\
......0000......\
.....00..000....\
....000...0.....\
................` ],\
  [ S_MAN2, bitmap`\
................\
.......00.......\
......0000......\
.....000000.....\
....00000000....\
....00000000....\
.....000000.....\
.......00.......\
.......00.......\
......0000......\
......0000......\
.......00.......\
......0000......\
......0..0......\
....000..000....\
................` ],\
  [ S_MAN3, bitmap`\
................\
.......000......\
.....000000.....\
.....000000.....\
....00000000....\
....00000000....\
......00000.....\
.......00.......\
.......00.......\
......0000......\
......0000......\
.......00.......\
......0000......\
....000..00.....\
.....0...000....\
................` ],\
  [ S_LU1, bitmap`\
...00...........\
.....0..........\
......0.........\
.......0........\
........0.......\
..........0.....\
...........00...\
................\
................\
................\
................\
................\
................\
................\
................\
................` ],\
  [ S_LU2, bitmap`\
..000...........\
.....0..........\
................\
.......0........\
........0.......\
..........0.....\
...........00...\
................\
................\
................\
................\
................\
................\
................\
................\
................` ],\
  [ S_LU3, bitmap`\
..000...........\
.....0..........\
......0.........\
.......0........\
........0.......\
..........0.....\
...........00...\
................\
................\
................\
................\
................\
................\
................\
................\
................` ],\
  [ S_RU1, bitmap`\
..........000...\
.........0......\
........0.......\
.......0........\
......0.........\
....0...........\
..00............\
................\
................\
................\
................\
................\
................\
................\
................\
................` ],\
  [ S_RU2, bitmap`\
..........000...\
.........0......\
........0.......\
.......0........\
......0.........\
....0...........\
..00............\
................\
................\
................\
................\
................\
................\
................\
................\
................` ],\
  [ S_RU3, bitmap`\
..........000...\
.........0......\
................\
.......0........\
......0.........\
....0...........\
..00............\
................\
................\
................\
................\
................\
................\
................\
................\
................` ],\
  [ S_LD1, bitmap`\
................\
................\
................\
................\
................\
............0...\
................\
..........0.....\
....00..........\
....000.........\
..00..0.........\
................\
................\
................\
................\
................` ],\
  [ S_LD2, bitmap`\
................\
................\
................\
................\
............0...\
................\
...........0....\
..........0.....\
....00..........\
....000.........\
..00..0.........\
................\
................\
................\
................\
................` ],\
  [ S_LD3, bitmap`\
................\
................\
................\
................\
............0...\
................\
...........0....\
..........0.....\
....000.........\
....000.........\
..00..00........\
................\
................\
................\
................\
................` ],\
  [ S_RD1, bitmap`\
................\
................\
................\
................\
..0.............\
................\
...0............\
....0...........\
......0..00.....\
........000.....\
.......00..00...\
................\
................\
................\
................\
................` ],\
  [ S_RD2, bitmap`\
................\
................\
................\
................\
..0.............\
................\
...0............\
....0...........\
.........00.....\
........000.....\
.......00..00...\
................\
................\
................\
................\
................` ],\
  [ S_RD3, bitmap`\
................\
................\
................\
................\
..0.............\
................\
...0............\
....0...........\
.........00.....\
........000.....\
.......00..00...\
................\
................\
................\
................\
................` ],\
  [ S_MOLE1, bitmap`\
................\
................\
................\
................\
................\
................\
................\
......0000......\
.....00000000...\
.....0000000....\
....00000000....\
....000000000...\
....0.00.0000...\
................\
................\
................` ],\
  [ S_MOLE2, bitmap`\
................\
................\
................\
................\
................\
................\
................\
......0000......\
......0000000...\
.....0000000....\
....00000000....\
....000000000...\
...00.0..0000...\
................\
................\
................` ],\
  [ S_MOLE3, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
.......00.......\
......0000......\
.....000000.....\
....00000000....\
...000....000...\
................\
................\
................` ],\
  [ S_MOLE4, bitmap`\
................\
................\
................\
................\
................\
................\
................\
......000.......\
...0000000......\
....0000000.....\
....0000000.....\
...000000000....\
....000..0.0....\
................\
................\
................` ],\
  [ S_MOLE5, bitmap`\
................\
................\
................\
................\
................\
................\
................\
......0000......\
...0000000......\
....0000000.....\
...00000000.....\
...000000000....\
...0000..0.0....\
................\
................\
................` ],\
  [ S_H11, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.......000......\
.....000000.....\
...........0....\
................\
................\
................\
................` ],\
  [ S_H12, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.....00000......\
....0000000.....\
...0.......0....\
................\
................\
................\
................` ],\
  [ S_H13, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.......00.......\
.....00.000.....\
...........0....\
................\
................\
................\
................` ],\
  [ S_H21, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.......000......\
.....0000000....\
...........0....\
................\
................\
................\
................` ],\
  [ S_H22, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.....00000......\
....0000000.....\
...0.......0....\
................\
................\
................\
................` ],\
  [ S_H23, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
......000.......\
....000.00......\
..........0.....\
................\
................\
................\
................` ],\
  [ S_H31, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.......000......\
.....0000000....\
...........0....\
................\
................\
................\
................` ],\
  [ S_H32, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.....00000......\
....0000000.....\
...0.......0....\
................\
................\
................\
................` ],\
  [ S_H33, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.......00.......\
....000.000.....\
...........0....\
................\
................\
................\
................` ],\
  [ S_H41, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
......000.......\
....0000000.....\
....0...........\
................\
................\
................\
................` ],\
  [ S_H42, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.....00000......\
....0000000.....\
...0.......0....\
................\
................\
................\
................` ],\
  [ S_H43, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.......000......\
.....000.000....\
....0...........\
................\
................\
................\
................` ],\
  [ S_H51, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
......000.......\
....0000000.....\
....0...........\
................\
................\
................\
................` ],\
  [ S_H52, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
......0000......\
....0000000.....\
...0.......0....\
................\
................\
................\
................` ],\
  [ S_H53, bitmap`\
................\
................\
................\
................\
................\
................\
................\
................\
................\
.......000......\
.....00..000....\
....0...........\
................\
................\
................\
................` ],\
  [ S_MISS, bitmap`\
................\
................\
................\
................\
................\
.......00.......\
.......00.......\
....00.00.00....\
....00000000....\
.....000000.....\
................\
................\
................\
................\
................\
................` ],\
  [ S_NUM0, bitmap`\
................\
................\
................\
.......000......\
......00000.....\
......0..00.....\
.....00..00.....\
................\
.....00..0......\
.....00..0......\
.....00..0......\
.....00000......\
......000.......\
................\
................\
................` ],\
  [ S_NUM1, bitmap`\
................\
................\
................\
................\
........00......\
........00......\
........00......\
................\
........0.......\
........0.......\
.......00.......\
.......00.......\
........0.......\
................\
................\
................` ],\
  [ S_NUM2, bitmap`\
................\
................\
................\
.......000......\
.......0000.....\
.........00.....\
.........00.....\
.......000......\
.....0000.......\
.....00.........\
.....00.........\
.....000........\
......000.......\
................\
................\
................` ],\
  [ S_NUM3, bitmap`\
................\
................\
................\
......000.......\
.......000......\
........00......\
........00......\
......000.......\
.......00.......\
........00......\
........0.......\
......000.......\
.....000........\
................\
................\
................` ],\
  [ S_NUM4, bitmap`\
................\
................\
................\
................\
.....00...0.....\
.....00..00.....\
.....00..00.....\
......0000......\
.......000......\
.........0......\
........00......\
.........0......\
.........0......\
................\
................\
................` ],\
  [ S_NUM5, bitmap`\
................\
................\
................\
......000.......\
.....0000.......\
.....00.........\
.....00.........\
......000.......\
.......000......\
........00......\
........00......\
......0000......\
......000.......\
................\
................\
................` ],\
  [ S_NUM6, bitmap`\
................\
................\
................\
.......000......\
......000.......\
......0.........\
.....00.........\
.......000......\
.....00000......\
.....00..00.....\
.....00..00.....\
.....00000......\
......000.......\
................\
................\
................` ],\
  [ S_NUM7, bitmap`\
................\
................\
................\
......000.......\
.......000......\
........00......\
........00......\
................\
........0.......\
........00......\
........0.......\
........0.......\
........0.......\
................\
................\
................` ],\
  [ S_NUM8, bitmap`\
................\
................\
................\
.......000......\
......00000.....\
......0..00.....\
.....00..00.....\
.......000......\
.....00000......\
.....00..0......\
.....00..0......\
.....00000......\
......000.......\
................\
................\
................` ],\
  [ S_NUM9, bitmap`\
................\
................\
................\
.......000......\
.....000000.....\
.....00..00.....\
.....00..00.....\
......0000......\
.......000......\
.........0......\
........00......\
......0000......\
......000.......\
................\
................\
................` ],\
  [ S_COLON, bitmap`\
................\
................\
................\
................\
................\
........0.......\
................\
................\
................\
.......0........\
................\
................\
................\
................\
................\
................` ]\
);\
\
setBackground(S_BG);\
\
setMap(map`\
..........\
..........\
..........\
..........\
..........\
..........\
..........\
..........`);\
\
const NO_GAME = 0;\
const GAME_A = 1;\
const GAME_B = 2;\
const GAME_OVER = 3;\
const CLOCK = 4;\
\
const GAME_SPEED_MAXIMUM = 300;\
\
const PLAYER_X = [0, 1, 4, 7];\
const HOLE_X = [0, 0, 2, 4, 6, 8];\
\
const Y_ARM_UP = 1;\
const Y_MAN = 2;\
const Y_ARM_DOWN = 3;\
const Y_MOLE = 4;\
const Y_HILL = 5;\
const Y_SCORE = 6;\
const Y_MISS = 7;\
\
const MAN_SPR = [null, S_MAN1, S_MAN2, S_MAN3];\
const LU_SPR = [null, S_LU1, S_LU2, S_LU3];\
const RU_SPR = [null, S_RU1, S_RU2, S_RU3];\
const LD_SPR = [null, S_LD1, S_LD2, S_LD3];\
const RD_SPR = [null, S_RD1, S_RD2, S_RD3];\
const MOLE_SPR = [null, S_MOLE1, S_MOLE2, S_MOLE3, S_MOLE4, S_MOLE5];\
\
const HILL_SPR = [\
  null,\
  [null, S_H11, S_H12, S_H13],\
  [null, S_H21, S_H22, S_H23],\
  [null, S_H31, S_H32, S_H33],\
  [null, S_H41, S_H42, S_H43],\
  [null, S_H51, S_H52, S_H53]\
];\
\
const NUM_SPR = [\
  S_NUM0, S_NUM1, S_NUM2, S_NUM3, S_NUM4,\
  S_NUM5, S_NUM6, S_NUM7, S_NUM8, S_NUM9\
];\
\
let game = NO_GAME;\
let demo = false;\
let hitting = 0;\
let pos = 2;\
\
let life = 3;\
let score = 0;\
let highScoreA = 0;\
let highScoreB = 0;\
\
let gameSpeed = 1000;\
let scorePrev = 9;\
let missed = false;\
let pause = false;\
let moleHit = false;\
let moleSurfaced = false;\
let moleHittablePos = false;\
\
let molesAtOnce = 0;\
let molesAtOnceGame = 0;\
let molesPresentCached = 0;\
\
let hammerDown = "";\
let clockColonOn = true;\
\
let gameID = null;\
let hitID = null;\
let liftID = null;\
let missedID = null;\
let demoID = null;\
let timeID = null;\
\
let molePresent = makeMoleArray();\
\
function makeMoleArray() \{\
  const a = [];\
\
  for (let row = 0; row <= 5; row++) \{\
    a[row] = [];\
    for (let stage = 0; stage <= 5; stage++) \{\
      a[row][stage] = false;\
    \}\
  \}\
\
  return a;\
\}\
\
function clearTimer(id) \{\
  if (id !== null) clearTimeout(id);\
\}\
\
function stopGameTimers() \{\
  clearTimer(gameID);\
  clearTimer(hitID);\
  clearTimer(liftID);\
  clearTimer(missedID);\
\
  gameID = null;\
  hitID = null;\
  liftID = null;\
  missedID = null;\
\}\
\
function stopAllTimers() \{\
  stopGameTimers();\
  clearTimer(demoID);\
  clearTimer(timeID);\
\
  demoID = null;\
  timeID = null;\
\}\
\
function clearBoard() \{\
  clearText();\
\
  for (let y = 0; y < height(); y++) \{\
    for (let x = 0; x < width(); x++) \{\
      clearTile(x, y);\
    \}\
  \}\
\}\
\
function addAt(x, y, sprite) \{\
  if (x >= 0 && x < width() && y >= 0 && y < height()) \{\
    addSprite(x, y, sprite);\
  \}\
\}\
\
function renderDigitsNumber(n) \{\
  if (n > 999) addAt(4, Y_SCORE, NUM_SPR[Math.floor((n / 1000) % 10)]);\
  if (n > 99) addAt(5, Y_SCORE, NUM_SPR[Math.floor((n % 1000) / 100)]);\
  if (n > 9) addAt(6, Y_SCORE, NUM_SPR[Math.floor((n % 100) / 10)]);\
\
  addAt(7, Y_SCORE, NUM_SPR[n % 10]);\
\}\
\
function renderTimeDigits() \{\
  const now = new Date();\
  const h = now.getHours();\
  const m = now.getMinutes();\
\
  if (h >= 10) addAt(4, Y_SCORE, NUM_SPR[Math.floor(h / 10)]);\
  addAt(5, Y_SCORE, NUM_SPR[h % 10]);\
\
  if (clockColonOn) addAt(6, Y_SCORE, S_COLON);\
\
  addAt(7, Y_SCORE, NUM_SPR[Math.floor(m / 10)]);\
  addAt(8, Y_SCORE, NUM_SPR[m % 10]);\
\}\
\
function renderStaticHoles() \{\
  for (let row = 1; row <= 5; row++) \{\
    addAt(HOLE_X[row], Y_HILL, S_HOLE);\
  \}\
\}\
\
function renderMoles() \{\
  for (let row = 1; row <= 5; row++) \{\
    if (molePresent[row][1]) addAt(HOLE_X[row], Y_HILL, HILL_SPR[row][1]);\
    if (molePresent[row][2]) addAt(HOLE_X[row], Y_HILL, HILL_SPR[row][2]);\
    if (molePresent[row][3]) addAt(HOLE_X[row], Y_HILL, HILL_SPR[row][3]);\
    if (molePresent[row][4]) addAt(HOLE_X[row], Y_MOLE, MOLE_SPR[row]);\
  \}\
\}\
\
function renderMan() \{\
  addAt(PLAYER_X[pos], Y_MAN, MAN_SPR[pos]);\
\
  if (hammerDown === "left") \{\
    addAt(HOLE_X[pos], Y_ARM_DOWN, LD_SPR[pos]);\
  \} else \{\
    addAt(PLAYER_X[pos] - 1, Y_ARM_UP, LU_SPR[pos]);\
  \}\
\
  if (hammerDown === "right") \{\
    addAt(HOLE_X[pos + 2], Y_ARM_DOWN, RD_SPR[pos]);\
  \} else \{\
    addAt(PLAYER_X[pos] + 1, Y_ARM_UP, RU_SPR[pos]);\
  \}\
\}\
\
function renderMisses() \{\
  const misses = 3 - life;\
\
  for (let i = 1; i <= misses; i++) \{\
    addAt(i - 1, Y_MISS, S_MISS);\
  \}\
\}\
\
function renderTitleSegments() \{\
  renderStaticHoles();\
\
  for (let row = 1; row <= 5; row++) \{\
    addAt(HOLE_X[row], Y_HILL, HILL_SPR[row][1]);\
    addAt(HOLE_X[row], Y_HILL, HILL_SPR[row][2]);\
    addAt(HOLE_X[row], Y_HILL, HILL_SPR[row][3]);\
    addAt(HOLE_X[row], Y_MOLE, MOLE_SPR[row]);\
  \}\
\
  pos = 2;\
  renderMan();\
\
  addAt(0, Y_MISS, S_MISS);\
  addAt(1, Y_MISS, S_MISS);\
  addAt(2, Y_MISS, S_MISS);\
\
  addAt(4, Y_SCORE, S_NUM1);\
  addAt(5, Y_SCORE, S_NUM2);\
  addAt(6, Y_SCORE, S_COLON);\
  addAt(7, Y_SCORE, S_NUM0);\
  addAt(8, Y_SCORE, S_NUM0);\
\}\
\
function render() \{\
  clearBoard();\
\
  if (game === NO_GAME) \{\
    renderTitleSegments();\
    addText("J:A  L:B", \{ x: 4, y: 14, color: color`0` \});\
    return;\
  \}\
\
  renderStaticHoles();\
  renderMoles();\
  renderMan();\
\
  if (game === CLOCK) \{\
    renderTimeDigits();\
    return;\
  \}\
\
  renderMisses();\
  renderDigitsNumber(score);\
\
  if (game === GAME_OVER) \{\
    addText("GAME OVER", \{ x: 5, y: 14, color: color`0` \});\
  \}\
\}\
\
function moleHittable(p) \{\
  if (moleHit) return false;\
\
  if (molePresent[p][4] && !molePresent[p][5]) return "left";\
  if (molePresent[p + 2][4] && !molePresent[p + 2][5]) return "right";\
\
  return false;\
\}\
\
function moleOut() \{\
  let out = false;\
  moleSurfaced = false;\
\
  for (let row = 5; row > 0; row--) \{\
    if (molePresent[row][5]) \{\
      out = row;\
    \} else if (molePresent[row][4]) \{\
      moleSurfaced = row;\
    \}\
  \}\
\
  return out;\
\}\
\
function molesMove() \{\
  if (pause) return;\
\
  clearTimer(hitID);\
  hitID = null;\
\
  /*\
    Original LCD logic:\
    Do NOT clear stage 1 here.\
    The stages accumulate visually: hill1, hill2, hill3, mole, escaped.\
    Rows are reset only when hit or when the missed mole crawls back.\
  */\
  for (let row = 5; row > 0; row--) \{\
    for (let stage = 5; stage > 1; stage--) \{\
      molePresent[row][stage] = molePresent[row][stage - 1];\
    \}\
  \}\
\
  if (!demo) \{\
    const out = moleOut();\
\
    if (out && out !== moleHit) \{\
      stopGameTimers();\
      pause = true;\
      failed(out);\
    \} else \{\
      const side = moleHittable(pos);\
\
      if (side === "left") \{\
        hitID = setTimeout(() => hitLeft(), 100);\
      \} else if (side === "right") \{\
        hitID = setTimeout(() => hitRight(), 100);\
      \}\
    \}\
  \}\
\}\
\
function molesPresentNow() \{\
  let count = 0;\
\
  for (let row = 1; row <= 5; row++) \{\
    if (molePresent[row][1]) count++;\
  \}\
\
  if (moleSurfaced) count--;\
\
  return count;\
\}\
\
function molesPresentAtOnce() \{\
  if (score === scorePrev) \{\
    if (molesAtOnce < 2) \{\
      molesAtOnce++;\
    \} else \{\
      molesAtOnce = 0;\
    \}\
\
    if (game === GAME_B) \{\
      scorePrev += 7 - (molesAtOnce < 2 ? 1 : 2);\
    \} else \{\
      scorePrev += 7 - molesAtOnce;\
    \}\
  \}\
\
  molesAtOnceGame = molesAtOnce;\
\
  if (game === GAME_B && score > 2 && molesAtOnceGame < 2) \{\
    molesAtOnceGame++;\
  \}\
\
  return molesAtOnceGame;\
\}\
\
function newMolesDelay() \{\
  let delay = true;\
\
  if (molesAtOnceGame === 1 && molesPresentCached) \{\
    for (let row = 1; row <= 5; row++) \{\
      if (molePresent[row][3] && !moleSurfaced) \{\
        delay = false;\
      \}\
    \}\
  \} else \{\
    delay = false;\
  \}\
\
  return delay;\
\}\
\
function spawnMoleIfAllowed() \{\
  let row = 1;\
  let shouldSpawn = false;\
\
  molesPresentCached = molesPresentNow();\
  const allowedAtOnce = molesPresentAtOnce();\
\
  if (allowedAtOnce >= molesPresentCached || !molesPresentCached) \{\
    let guard = 0;\
\
    do \{\
      row = Math.floor(5 * Math.random()) + 1;\
      guard++;\
    \} while (\
      (molePresent[row][1] || (game === GAME_A && row === 3)) &&\
      !missed &&\
      guard < 100\
    );\
\
    if (!missed && guard < 100 && !newMolesDelay()) \{\
      shouldSpawn = true;\
    \}\
  \}\
\
  if (shouldSpawn) \{\
    molePresent[row][1] = true;\
  \}\
\}\
\
function clearMoleRow(row) \{\
  for (let stage = 1; stage <= 5; stage++) \{\
    molePresent[row][stage] = false;\
  \}\
\}\
\
function liftHammer() \{\
  hammerDown = "";\
  moleHit = false;\
  render();\
\}\
\
function moleHitNow() \{\
  const side = moleHittable(pos);\
  let row = false;\
\
  if (side === "left") row = pos;\
  if (side === "right") row = pos + 2;\
\
  if (row && !moleHit && !missed) \{\
    moleHit = row;\
    clearMoleRow(row);\
    scoreAdd(1);\
  \}\
\
  clearTimer(liftID);\
  liftID = setTimeout(liftHammer, 300);\
\}\
\
function hitLeft() \{\
  clearTimer(hitID);\
  clearTimer(liftID);\
\
  hitID = null;\
  liftID = null;\
\
  hammerDown = "left";\
  render();\
\
  if (!demo) moleHitNow();\
\}\
\
function hitRight() \{\
  clearTimer(hitID);\
  clearTimer(liftID);\
\
  hitID = null;\
  liftID = null;\
\
  hammerDown = "right";\
  render();\
\
  if (!demo) moleHitNow();\
\}\
\
function goLeft() \{\
  if (pos > 1) \{\
    pos--;\
    render();\
  \}\
\}\
\
function goRight() \{\
  if (pos < 3) \{\
    pos++;\
    render();\
  \}\
\}\
\
function leftInput() \{\
  if (game !== GAME_A && game !== GAME_B) return;\
\
  goLeft();\
\
  clearTimer(hitID);\
  hitID = null;\
\
  const side = moleHittable(pos);\
\
  if (side === "left" && !pause) \{\
    hitID = setTimeout(() => hitLeft(), 10);\
  \} else if (side === "right" && !pause) \{\
    hitID = setTimeout(() => hitRight(), 10);\
  \}\
\}\
\
function rightInput() \{\
  if (game !== GAME_A && game !== GAME_B) return;\
\
  goRight();\
\
  clearTimer(hitID);\
  hitID = null;\
\
  const side = moleHittable(pos);\
\
  if (side === "left" && !pause) \{\
    hitID = setTimeout(() => hitLeft(), 10);\
  \} else if (side === "right" && !pause) \{\
    hitID = setTimeout(() => hitRight(), 10);\
  \}\
\}\
\
function failed(row) \{\
  if (!row) return;\
\
  missed = true;\
  life--;\
  pause = true;\
  hammerDown = "";\
\
  missedStep(row);\
\}\
\
function missedStep(row) \{\
  pause = true;\
\
  clearTimer(missedID);\
  missedID = null;\
\
  if (molePresent[row][4]) \{\
    molePresent[row][5] = false;\
    molePresent[row][4] = false;\
  \} else \{\
    for (let stage = 1; stage < 4; stage++) \{\
      molePresent[row][stage] = molePresent[row][stage + 1];\
    \}\
  \}\
\
  render();\
\
  if (molePresent[row][1]) \{\
    missedID = setTimeout(() => missedStep(row), 1000);\
  \} else \{\
    missed = false;\
\
    if (life > 0) \{\
      missedID = setTimeout(gameGoNext, 1000);\
    \} else \{\
      if (game === GAME_A && score > highScoreA) highScoreA = score;\
      if (game === GAME_B && score > highScoreB) highScoreB = score;\
\
      game = GAME_OVER;\
      pause = true;\
      render();\
    \}\
  \}\
\}\
\
function speedUp(amount) \{\
  if (gameSpeed > GAME_SPEED_MAXIMUM) \{\
    gameSpeed -= amount;\
\
    if (gameSpeed < GAME_SPEED_MAXIMUM) \{\
      gameSpeed = GAME_SPEED_MAXIMUM;\
    \}\
  \}\
\}\
\
function scoreAdd(points) \{\
  for (let i = 0; i < points; i++) \{\
    score++;\
  \}\
\
  if (game === GAME_A && score === 10) \{\
    speedUp(350);\
  \} else if (score > 0 && score % 50 === 0) \{\
    if (gameSpeed > 500) \{\
      speedUp(100);\
    \} else if (gameSpeed > 440) \{\
      speedUp(40);\
    \} else if (gameSpeed > 400) \{\
      speedUp(20);\
    \} else if (gameSpeed > 360) \{\
      speedUp(10);\
    \} else \{\
      speedUp(5);\
    \}\
  \}\
\
  if (game === GAME_A && score > highScoreA) highScoreA = score;\
  if (game === GAME_B && score > highScoreB) highScoreB = score;\
\
  if (score > 999) \{\
    score = 0;\
  \}\
\
  render();\
\}\
\
function gameGo() \{\
  clearTimer(gameID);\
  gameID = null;\
\
  if (pause || (game !== GAME_A && game !== GAME_B)) return;\
\
  molesMove();\
\
  if (pause || game === GAME_OVER) \{\
    render();\
    return;\
  \}\
\
  spawnMoleIfAllowed();\
  render();\
\
  gameID = setTimeout(gameGo, gameSpeed);\
\}\
\
function gameGoNext() \{\
  clearTimer(hitID);\
  clearTimer(gameID);\
  clearTimer(liftID);\
\
  hitID = null;\
  gameID = null;\
  liftID = null;\
\
  molesPresentCached = molesPresentNow();\
  pause = false;\
\
  if (!demo && moleSurfaced) \{\
    const side = moleHittable(pos);\
\
    if (side === "left") \{\
      hitID = setTimeout(() => hitLeft(), 10);\
    \} else if (side === "right") \{\
      hitID = setTimeout(() => hitRight(), 10);\
    \}\
  \}\
\
  gameID = setTimeout(gameGo, gameSpeed);\
\}\
\
function resetGameVars() \{\
  stopAllTimers();\
\
  demo = false;\
  hitting = 0;\
\
  pos = 2;\
  life = 3;\
  score = 0;\
\
  missed = false;\
  pause = false;\
  moleHit = false;\
  moleSurfaced = false;\
  moleHittablePos = false;\
\
  molesAtOnce = 0;\
  molesAtOnceGame = 0;\
  molesPresentCached = 0;\
\
  hammerDown = "";\
  molePresent = makeMoleArray();\
\}\
\
function startGameA() \{\
  resetGameVars();\
\
  game = GAME_A;\
  gameSpeed = 1000;\
  scorePrev = 9;\
\
  render();\
  gameID = setTimeout(gameGo, 500);\
\}\
\
function startGameB() \{\
  resetGameVars();\
\
  game = GAME_B;\
  gameSpeed = 650;\
  scorePrev = 6;\
\
  render();\
  gameID = setTimeout(gameGo, 500);\
\}\
\
function showClock() \{\
  resetGameVars();\
\
  game = CLOCK;\
  clockColonOn = true;\
\
  render();\
\
  timeID = setInterval(() => \{\
    clockColonOn = !clockColonOn;\
    render();\
  \}, 500);\
\}\
\
function hardReset() \{\
  resetGameVars();\
\
  game = NO_GAME;\
  render();\
\}\
\
onInput("a", () => \{\
  leftInput();\
\});\
\
onInput("d", () => \{\
  rightInput();\
\});\
\
onInput("j", () => \{\
  startGameA();\
\});\
\
onInput("l", () => \{\
  startGameB();\
\});\
\
onInput("i", () => \{\
  showClock();\
\});\
\
onInput("k", () => \{\
  hardReset();\
\});\
\
hardReset();}
