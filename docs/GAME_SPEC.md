# Hungry Giraffe — Game Specification

A browser recreation of the 1985 Casio CG-91 "Hungry Giraffe" LCD handheld.

This document is the authority for gameplay. It was rewritten against the
CG-91 technical specification captured in HG-23; an earlier version described a
different, looser game (giraffe on the right, an explicit eat button, a monkey
that moved between branches) and no longer applies.

## Core concept

The giraffe stands at the bottom-left of a fixed LCD segment grid. A tree fills
the right side, with a monkey permanently stationed in the canopy at the
top-right. The giraffe eats leaves by extending its neck diagonally up and to
the right; the monkey drops coconuts down that same diagonal.

The tension is entirely in the neck: extending it is the only way to score, and
the only way to get hit.

## Playfield layout

The screen is a **fixed segment grid**. There are no continuous pixels and no
interpolation — every element occupies a discrete, predetermined cell and
switches on or off like an LCD segment.

* **Bottom-left**: the giraffe's body, permanently fixed.
* **Diagonal, running up and to the right**: the neck path.
* **Right side**: a static tree, bottom-right to top-right.
* **Top-right**: the monkey, permanently stationed in the canopy.
* **Top-left**: lives.
* **Top-right**: score.

Monochrome or very limited colour, mimicking an LCD handheld.

## The neck extension axis

Head position is **extension, not a lane**. There are four discrete positions:

| Position | Meaning |
|---|---|
| 0 | Home — fully retracted, head on the body at bottom-left |
| 1 | Mid-low — slightly extended diagonally up-right |
| 2 | Mid-high — extended further |
| 3 | Full — reaching the lower leaves at top-centre |

Extending to position N lights **every segment from 1 up to N**. This matters
for collisions: the whole lit neck is exposed, not just the head.

Position 0 is the **safe state**. It never holds a leaf and can never be struck.

## Controls

* **Arrow Up** — extend one segment.
* **Arrow Down** — retract one segment.
* **Jump** — Phase 2 only (see below).

There is **no eat button**. Eating is automatic.

Touch buttons mirror the same actions: UP, DOWN, START, and JUMP once Phase 2
exists. There must be no EAT button.

## Phase 1: leaves and coconuts

The primary loop. Score points while avoiding falling hazards.

### Leaves

Leaves appear at positions **1, 2 or 3** — never at home. Several may be lit at
once.

When the head lights up on the same position as a leaf, that leaf is cleared
automatically and scores **+1 point**. A new leaf is then revealed at a free
position. There is no highlighted or "active" leaf: every lit leaf is equally
edible.

### Coconuts

The monkey drops a coconut from the top-right. It falls a fixed **4-step**
diagonal path, advancing one step per clock tick:

| Step | Location | Level with neck position |
|---|---|---|
| 1 | Near the monkey (top-right) | 3 |
| 2 | Mid-high air (centre-right) | 2 |
| 3 | Mid-low air (centre-left) | 1 |
| 4 | Ground level / impact zone (bottom-left) | 0 |

The coconut descends while the neck ascends, so the two axes are **inverted**
against each other.

### Collision rule

A coconut strikes the giraffe when it passes over **any lit neck segment**.
Since extending to position N lights segments 1..N, a deeply extended neck is
exposed to the coconut for most of its fall, and a retracted neck is exposed to
none of it.

* At home (position 0) nothing is lit, so **no coconut can ever hit**.
* Step 4 is the landed frame at ground level and is **harmless** — it is what
  makes home a genuine safe state.

A strike costs **one life**, consumes the coconut so it cannot strike twice, and
knocks the neck back to home.

> Recorded decision: HG-23 gave two contradictory collision rules — an exact
> head-position match, and "the coconut will hit the neck structure on its way
> down". The neck-structure reading above was chosen because it makes retracting
> a real decision rather than a formality. See `isCoconutHit()` for the
> implementation.

## Phase 2: ground obstacle jump

At scoring intervals the perspective shifts to an obstacle-evasion sequence.

* The neck automatically retracts and **locks at position 0**. Up and down are
  disabled.
* The monkey sends ground obstacles — logs or rocks — from the bottom-right.
* Obstacles slide horizontally right-to-left along the floor toward the
  giraffe's feet, one segment per tick.
* **JUMP** lifts the giraffe: the ground segment turns off and a jumping segment
  directly above turns on, for a fixed window of 2 ticks, then it lands
  automatically.
* If an obstacle reaches the leftmost segment while the giraffe is grounded, a
  life is lost.

## Clock and difficulty

The game runs on a slow LCD tick, not an animation frame loop. The tick interval
starts at **600ms** and shortens as the score rises, down to a floor of
**250ms**. Everything — coconut steps, obstacle movement, leaf changes — advances
on this single tick, so the whole game accelerates together.

## Lives and game over

Three lives, shown top-left as three giraffe-shaped icons.

A life is lost when:

* a coconut strikes the lit neck in Phase 1, or
* a ground obstacle reaches a grounded giraffe in Phase 2.

Losing a life blinks the screen and removes one icon.

At zero lives: stop the clock, show GAME OVER, keep the final score visible, and
allow a restart.

## Visual style

* Fixed segment positions. No free movement, no interpolation, no scrolling.
* Segments switch on and off; no tweening or transitions.
* Simple frame-based animation.
* Score as a 3-4 digit 7-segment display.
* No physics engine.
* Crisp pixel-art or LCD-segment look.

## Implementation preference

A deterministic state machine. Randomness is injected rather than called
directly, so behaviour is reproducible under test.

The important quality is not realistic movement but the handheld rhythm: choose
an extension, take the leaf, retract before the coconut arrives, and do it
faster as the score climbs.

## Open decisions

These are specified loosely or not at all in HG-23 and are still to be settled:

* **Phase 2 trigger interval.** HG-23 says every 100 points, but scoring is +1
  per leaf, so that is 100 successful eats. The figure looks carried over from an
  earlier +10 scale. A much shorter interval is likely intended.
* **Phase 2 exit condition.** HG-23 never says how Phase 2 ends and Phase 1
  resumes — survive N obstacles, or a fixed duration.
* **Clock ramp shape.** The 600ms and 250ms endpoints are given, and the cadence
  ("every 50 points"), but not the decrement per step.
* **Jump duration.** Stated as "2 ticks / ~300ms", but 2 ticks is 1200ms at the
  slow clock and 500ms at the fast one. Treated as 2 ticks so the window scales
  with difficulty.
* **Sound.** Success and fail cues are desirable but currently owned by no
  ticket.
