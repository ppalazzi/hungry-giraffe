# Hungry Giraffe Game Specification

Build a small browser game inspired by the 1985 Casio CG-91 "Hungry Giraffe" LCD handheld.

## Core concept

The player controls a giraffe standing on the right side of the screen. A tree is on the left side. Leaves appear on several vertical positions along the tree. The giraffe stretches its neck toward the tree to eat leaves. A monkey moves on the tree and can interfere with the giraffe.

The goal is to eat as many leaves as possible without being hit or interrupted by the monkey.

## Screen layout

Use a fixed retro LCD-style layout:

* Left side: tree trunk with several branches.
* Right side: giraffe body.
* Between them: giraffe neck path.
* Tree contains 4 or 5 possible leaf positions.
* Monkey occupies branch positions on the left/tree area.
* Top-right HUD: score.
* Right HUD: remaining lives.
* Game-over text appears when lives reach zero.

Use monochrome or very limited colors to mimic an LCD handheld.

## Controls

Keyboard controls:

* Arrow Up: move giraffe head target upward.
* Arrow Down: move giraffe head target downward.
* Space / Enter: Eat.
* Optional: Arrow Left or separate key: Jump / dodge.

Touch buttons should also exist for mobile:

* UP
* DOWN
* EAT
* JUMP
* START

## Game state

Maintain these state values:

* `gameStatus`: idle, running, paused, gameOver
* `score`
* `lives`, starting at 3
* `giraffeHeadPosition`
* `neckExtended`, boolean
* `leafPositions`
* `activeLeafPosition`
* `monkeyPosition`
* `monkeyAction`
* `speedLevel`
* `tickInterval`

## Gameplay loop

When the game starts:

1. Reset score to 0.
2. Reset lives to 3.
3. Place the giraffe in neutral position.
4. Spawn leaves at random valid tree positions.
5. Start a repeated game tick.

On every tick:

1. Move or animate the monkey.
2. Possibly change the active leaf position.
3. Check whether the monkey is threatening the giraffe.
4. Increase speed gradually as score rises.
5. Update LCD-style sprite visibility.

## Eating mechanic

When the player presses EAT:

1. Extend the giraffe neck toward the currently selected vertical position.
2. If the giraffe head matches a leaf position and the monkey is not blocking it:
   * remove/eat that leaf
   * add points
   * play a short success sound
   * spawn or reveal a new leaf
3. If the giraffe eats at the wrong position:
   * no score
   * short miss delay
4. If the monkey is attacking/blocking during the eat action:
   * lose one life
   * retract neck
   * play fail sound

## Monkey hazard

The monkey moves between branches on the tree. It should behave like a timed obstacle.

Possible monkey states:

* idle
* moving
* blocking
* attacking

The monkey should periodically threaten one of the eating lanes. If the giraffe extends into the threatened lane at the wrong time, the player loses a life.

## Scoring

Suggested scoring:

* Successful leaf eaten: +10 points.
* Optional bonus for quick consecutive eats: +5 extra.
* Every 100 points, slightly increase game speed.

## Lives and game over

The player starts with 3 lives.

Lose one life when:

* the monkey hits/intercepts the giraffe
* the giraffe keeps its neck extended during danger
* optionally, the player misses too many times

When lives reach 0:

* stop the game loop
* show GAME OVER
* keep final score visible
* allow restart with START

## Visual style

The game must feel like an old LCD handheld:

* Fixed sprite positions, not smooth free movement.
* Sprites turn on/off like LCD segments.
* Simple frame-based animation.
* No scrolling.
* No physics engine.
* Limited sound effects.
* Crisp pixel-art or LCD-segment look.

## Implementation preference

Implement the game as a deterministic state machine. Avoid complex animation systems.

Recommended structure:

* `GameState`
* `InputController`
* `GameLoop`
* `Renderer`
* `SoundManager`
* `CollisionRules`
* `ScoringRules`

The important behavior is not realistic movement. The important behavior is the old handheld rhythm: choose a lane, time the eat action, avoid the monkey, score points, speed increases, lose lives, game over.
