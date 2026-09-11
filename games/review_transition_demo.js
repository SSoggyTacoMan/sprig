/*
@title: Review Transition Demo
@author: SSoggyTacoMan
@description: A small fixture game used to exercise submission review transitions.
@tags: ['test', 'review']
@addedOn: 2026-09-11
*/

const player = "p";
const goal = "g";

setLegend(
  [player, bitmap`
    5 5 5 5 5
    5 5 5 5 5
    5 5 5 5 5
    5 5 5 5 5
    5 5 5 5 5
  `],
  [goal, bitmap`
    7 7 7 7 7
    7 7 7 7 7
    7 7 7 7 7
    7 7 7 7 7
    7 7 7 7 7
  `]
);
setSolids([]);
let level = 0;
setMap(map`
  p p p
  p g p
  p p p
`);
onInput("w", () => { level += 2; });
