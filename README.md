Axis&Allies
===========

Axis & Allies is a tabletop minatures game I played a lot as a kid. This is my HTML5 tribute to that game: it's animated, multiplayer, completely free, and (I think) a lot of fun, so give it a try! This is probably my largest solo project.

Tech stuff:
- Pure javascript (both client and server)
- Multiplayer over the web, with both synchronous and asynchronous gameplay
- Heavily database-driven: features autosave and instant replays
- Infrastructure built with Meteor.js, an awesome (and as of writing half-finished) web framework

Controls
--------

- Draft Phase: Click a unit's name to see its card. Choose your units using the number boxes in the cards.
- Deploy Phase: Click on the board to deploy a unit; click again to take it back.
- Movement and Assault Phases: Click a friendly unit to select it, then click an empty hex to move there. Or, right-click an enemy unit to inspect it.
- Assault Phase: with a unit selected, enemies within attack range will be highlighted. Click an enemy unit to attack.

How to Play
-----------

Axis and Allies is a turn-based strategy game for two players. The game is played in rounds, and each round has several phases. At the start of each round, one player is chosen randomly to play first during each phase of that round.

**Setup Round**
- Draft Phase: Build an army.
  * Each unit has a cost, and you have 100 points to spend.
- Deployment Phase: Place your troops.
  * If you are the first player to deploy, you can choose to deploy in the East or West.
  * Each unit must be placed within 3 hexes of your border.

**Play Rounds**
- Movement Phase: Move your units.
  * Each unit can move once during your movement phase.
  * Vehicles are slower moving through Forests and Hills, and cannot move through Marsh.
  * No units can move into Ponds.
- Assault Phase: Attack or move again.
  * Each unit can either attack or move (but not both) during your assault phase.
  * The Attacks table on each unit's card shows the number of attack dice it gets against each unit type. The number of attacks decreases when you attack from farther away.
  * An attack succeeds on a roll of 4+. The number of successes determines the attack's effect:
    + Less than enemy's defense: you missed.
    + Equal to enemy's defense: one hit.
    + Greater than enemy's defense: two hits.
    + Double the enemy's defense: three hits.
  * Hits from multiple attackers are added together.
- Casualty Phase: Hits from assault phase take effect.
  * 1 hits: Soldiers and vehicles are disrupted. Disruption lasts for 1 turn, preventing movement and weakening attacks (-1 to each die)
  * 2 hits: Soldiers and damaged vehicles are destroyed; undamaged vehicles take damage. Damage is a permanent -1 to movement range and attack rolls.
  * 3 hits: Undamaged vehicles are destroyed. Destroyed units are removed from play.
  * Units in defensive terrain (all units: Towns, Forests, Hills; soldiers only: Marsh, Shell Holes) can take cover, reducing multiple hits to 1.
  * Soldiers have a 50% chance of taking cover. Vehicles have a 33% chance of taking cover.

**Victory**
- Once 7 rounds have passed, you can win by controlling the objective. If only you have units on or immediately next to to the objective (the crosshairs), you win!
- Once 10 rounds have passed, you can also win by military superiority. If you have more points' worth of units still in play than your opponent, you win!
