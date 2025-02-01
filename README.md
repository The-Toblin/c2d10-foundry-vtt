A repository for the second edition of the CD10 Roleplaying System module for Foundry VTT.

DISCLAIMER:
This is public, but in no way in any shape or form in release territory. This is extremely alpha, very in-dev and breakage is a guarantee. If you install this system, expect broken-ness. Releases will be added to Foundry when it's considered somewhat stable.

Made by the Toblin
tobias@celenia.se

Major release

# CHANGELOG 
## 0.601
Implemented new health system inspired by FATE.
- Health is now no longer separated into "Superficial" and "Critical". Instead, each pip represents damage to the tracker, without  distinction. 
- Each pip on the Strain and Stress tracker is no longer a "hit point" track, instead it's a representative of a value, which the first pip representing 1 damage, the fifth representing 5 damage. If you take, for example, 3 damage, you only mark the 3 pip, not the 1,2 and 3 pip. You can, after that, take 2 damage and mark the 2 pip. 
- If a pip that is already filled needs to be filled again, say, taking 3 damage twice in a row, then the second instance is upgraded one pip, resulting in the 4 pip being marked instead.
- If a character exceeds their tracker (ie, they can't mark a pip without going off the tracker), they must take a Consequence. Consequences represent 2, 4 and 6 damage respectively.
- Stress and Strain are both cleared after a scene/conflict ends, whatever makes most sense narratively. Consequences must be cleared over time and are more long-lasting. See the rules for details.

## 0.606
- New traits in place
- Sheets updated
- Fixed CSS on roll messages in chat
- Removed DC setting
- Reworked Crisis. No longer tied to character's health. Instead it's a value the Keeper can increase, using Villain points, that gives EVERYONE Crisis dice. 
- The party can spend hero points to reduce Crisis.

## 0.607
- Minor chat styling
- Journal background removed

## 0.608
- Traits renamed to "Hooks" - Credit to Nina Lanfer for this excellent suggestion.
- Removed the "plus" sign on the "Add Trait" button and made the whole button clickable. It also now responds to hover.
- Renamed the "Title" field on the character sheet to "Citizen class" to be more usable for other settings.
- Removed the ability to perform special attacks and defend rolls from chat messages.  This was too much automation for the system and complicated more than it helped.

## 0.611
- Removed multiple asterisks on skills because of multiple focuses. It will now only ever show one asterisk, if a Focus is present.
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

## 0.614
- Fixed a major bug that broke saving of Hooks. Turns out the HBS autoformat breaks quote marks within variables. It changed `name="{{concat "system.traits." traitID ".description" }}` to `name="{{concat " system.traits." traitID ".description" }}` which broke saving of hooks. Fixed.

## 0.620 
- Reworked item handling to be uniform across all sheets. A left click will now bring up the item's sheet, while a right click will provide a context menu for handling item specific actions, such as equipping as well as deleting the item from the character.

## 0.622
- Addressed a bug that prevented altering the quantity of an asset type, because the clickbox for the asset's sheet overrode the plus and minus buttons. 

## 0.623
- Actually addressed the bug mentioned in 0.622. Turns out you shouldn't be lazy. 
- When I was in there, I fixed the powers tab and allowed variants to be properly interacted with, in addition to changing all `{{#Select}}` hbs helpers to `{{selectOptions}}`, as per the v12 update.
- While I was doing that, I noticed that posting descriptions from the assets tab didn't work, and it turns out context menues interact differently with the HTML classes than standard listeners, so I had to do an ugly hack of adding the `data-id` to every row of the assets. Until I can figure out a prettier solution to that, this is what will be.

## 0.624 and 0.625
- Styling changes to add styling to Foundry elements like Labels, Select drop downs and Inline rolls (with tooltips). 

## 0.626
- Styling changes on the Chat box as it was completely borked.

## 0.627
- Further styling changes to adjust the roll select box.

## 0.630
- Implemented cybernetic implants
- Implant sheets added
- Implants can be added to a character now

## 0.631
- Implant cyberload is now calculated and added to the character. Not shown on sheets (yet).

## 0.632
- Added cybernetic load to sheet under cybernetics tab
- Reworked how Focuses are fetched from Actor to Sheet, since the old method was causing some weird cases where Focus would be blanked while updating the sheet, leading to the sort function exploding.