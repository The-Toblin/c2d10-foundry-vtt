export const migrateTo0610 = async () => {

  const deleteTraits = async () => {
    // Delete old items

    for (const actor of game.actors) {
      for (const item of actor.items.contents) {
        if (item.type === "trait") await item.delete();
      }
    }
  };

  const migrateSkills = async () => {

    for (const actor of game.actors) {
      const updateData = {};
      const skills = actor.system.skills;

      const phys = skills.physical;
      const soc = skills.social;
      const men = skills.mental;

      for (const s in phys) {
        if (typeof phys[s] !== "object") {
          updateData[`system.skills.physical.${s}`] = {
            rank: typeof phys[s] === "number" ? parseInt(phys[s]) : 0,
            focus: []
          };
        }
      }

      for (const s in soc) {
        if (typeof soc[s] !== "object") {
          updateData[`system.skills.social.${s}`] = {
            rank: typeof soc[s] === "number" ? parseInt(soc[s]) : 0,
            focus: []
          };
        }}

      for (const s in men) {
        if (typeof men[s] !== "object") {
          updateData[`system.skills.mental.${s}`] = {
            rank: typeof men[s] === "number" ? parseInt(men[s]) : 0,
            focus: []
          };
        }}

      if (Object.keys(updateData).length > 0) {
        console.warn(`Updating ${actor.name}`, updateData);
        await actor.update(updateData);
      }
    }
  };

  const migrateFocus = async () => {
    for (const actor of game.actors) {
      const updateData = {};

      updateData["system.skills.physical"] = doFocusMigration(actor.system.skills.physical);
      updateData["system.skills.social"] = doFocusMigration(actor.system.skills.social);
      updateData["system.skills.mental"] = doFocusMigration(actor.system.skills.mental);

      /**
       * Small function to find all the focuses and add them to proper arrays for updating.
       * @param group
       */
      function doFocusMigration(group) {
        const focusUpdateData = {};
        for (const skill in group) {
          focusUpdateData[skill] = {
            focus: [],
            hasFocus: false
          };
          let i = 0;
          for (let f of actor.system.skills.focus) {
            const name = f.name;
            const parent = f.parent;

            if (skill === parent) {
              focusUpdateData[skill].focus[i] = f.name;
              focusUpdateData[skill].hasFocus = true;
              i += 1;
            }
          }
        }
        return focusUpdateData;
      }

      if (Object.keys(updateData).length > 0) {
        console.log(`==== C2D10 Migration: Updating actor ${actor.name}`);
        await actor.update(updateData);}
    }
  };

  const migrateItems = async () => {

    const doItemUpdate = async item => {
      if (item.type === "armor" && (item.system.albation || item.system.deflection)) {
        const updateData = {};
        let protection = item.system.deflection > 0 ? item.system.deflection : item.system.ablation;

        updateData["system.protection"] = protection;
        updateData["system.-=ablation"] = null;
        updateData["system.-=deflection"] = null;
        console.warn(`Updating ${item.name} protection to ${protection}`);

        return updateData;
      }

      if (item.type === "weapon" && (item.system.superficial || item.system.critical)) {
        const updateData = {};
        let damage = item.system.superficial > 0 ? item.system.superficial : item.system.critical;

        updateData["system.damage"] = damage;
        updateData["system.-=superficial"] = null;
        updateData["system.-=critical"] = null;
        console.warn(`Updating ${item.name} damage to ${damage}`);

        return updateData;
      }
    };


    for (const item of game.items.contents) {
      const updateData = await doItemUpdate(item);
      await item.update(updateData);
    }

    for (const actor of game.actors) {
      for (const item of actor.items.contents) {
        const updateData = await doItemUpdate(item);
        await item.update(updateData);
      }
    }
  };

  const removeOldFocus = async () => {
    const updateData = {};
    updateData["system.skills.-=focus"] = null;

    for (const actor of game.actors) {
      await actor.update(updateData);
    }
  };

  // Delete old items like Traits, Vices and Virtues.
  await deleteTraits();

  // Move all skills to the new data model
  await migrateSkills();

  // Move focuses from their own category to under their parent skill
  await migrateFocus();

  // Update a few old equipment items with old data.
  await migrateItems();

  // Finally, remove the remnant Focus entry under skills.
  await removeOldFocus();

};
