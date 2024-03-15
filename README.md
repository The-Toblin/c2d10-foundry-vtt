A repository for the second edition of the CD10 Roleplaying System module for Foundry VTT.

DISCLAIMER:
This is public, but in no way in any shape or form in release territory. This is extremely alpha, very in-dev and breakage is a guarantee. If you install this system, expect broken-ness. Releases will be added to Foundry when it's considered somewhat stable.

Made by the Toblin
tobias@celenia.se

# CHANGELOG 
## 0.601
Implemented new health system inspired by FATE.

## 0.606
- New traits in place
- Sheets updated
- Fixed CSS on roll messages in chat
- Removed DC setting
- Added global crisis

## 0.607
- Minor chat styling
- Journal background removed

## 0.608
- Traits renamed to "Hooks" - Credit to Nina Lanfer for this excellent suggestion.
- Removed the "plus" sign on the "Add Trait" button and made the whole button clickable. It also now responds to hover.
- Renamed the "Title" field on the character sheet to "Citizen class" to be more usable for other settings.
- Removed the ability to perform special attacks and defend rolls from chat messages.  This was too much automation for the system and complicated more than it helped.

## 0.611
- Removed multiple asterisks on skills because of multiple focuses.
- Focuses moved from `system.skills.focus` to their respective parent skills (eg `system.skills.physical.acrobatics.focus["parkour"]`).
- Implemented proper migration scripts to handle version updates.
- Removed old trait `item`s from characters since traits are now "Hooks" and are text based.
- Above done to ensure that no old active-effects are still present when migrating characters.
- Temporarily disabled the function to check for Fated outcomes in `./module/dice/C2D10Roll.js`. The recursive function is currently bugged and endlessly loops.
- Since active effects and the old traits are gone, you can't be Fated atm anyway, so this isn't a loss.

## 0.612
- Fixed a bug after misunderstanding the new v12 API. Completely removed the `type` attribute from the Chat message data in `./module/dice/C2D10Roll.js`. Now Foundry doesn't complain, and DiceSoNice works as expected.

## 0.613
- Welp, turns out this doesn't work in v11 and DSN will break. Reverting change until v12 is live and DSN is updated.