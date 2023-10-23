export default class C2D10Item extends Item {

  chatTemplate = {
    trait: "systems/c2d10/templates/partials/chat-templates/trait-chat.hbs",
    weapon: "systems/c2d10/templates/cards/weapon-card.hbs"
  };

  async _preCreate(data, options, user) {
    /* Hijack preCreate to create a unique ID for items that is persistent across characters.
        This is mainly used to match powers with their combat skills. */

    if (!this.isEmbedded && this.type === "power") {
      if (typeof this.system.powerId === "undefined" || this.system.powerId === "") {
        const updateData = {};
        const powerId = randomID();

        updateData["system.powerId"] = powerId;

        await this.updateSource(updateData);
      }
    }

    return await super._preCreate(data, options, user);
  }

  /*
  * On creation of the item, check if it's embedded, and if so, apply effects.
  */
  async _onCreateDocuments() {
    console.log("OnCreate Triggered");
    if (this.isEmbedded && this.parent.getFlag("c2d10", "preCreateFlag")) {
      this.parent.setFlag("c2d10", "preCreateFlag", false);
    } else {
      this.parent.setFlag("c2d10", "preCreateFlag", true);
    }
  }

  async _onDeleteDocuments() {
    console.log("OnDelete Triggered");
    if (this.isEmbedded) {
      this.parent.unsetFlag("c2d10", "preCreateFlag");
    }
  }

  async showDescription() {
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker()
    };

    const cardData = {
      ...this,
      itemId: this.id,
      owner: this.actor.id,
      damageType: this.system.critical !== 0 ? "Critical" : "Superficial",
      damage: this.system.critical !== 0 ? parseInt(this.system.critical) : parseInt(this.system.superficial)
    };

    chatData.content = await renderTemplate(
      this.chatTemplate[this.type],
      cardData
    );

    console.warn("Creating chat message");
    return ChatMessage.create(chatData);
  }

  async modifyResource(n, res) {
    const updateData = {};
    const system = this.system;
    const currentValue = system[res];
    const max = 5;

    if (currentValue === max && n > 0) {
      return;
    }

    const newValue = currentValue + n;

    if (newValue < 0) {
      return;
    }

    updateData[`system.${res}`] = newValue;

    await this.update(updateData);
  }

  async roll() {
    let chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker()
    };

    let cardData = {
      ...this.data,
      owner: this.actor.id
    };

    chatData.content = await renderTemplate(
      this.chatTemplate[this.type],
      cardData
    );
    chatData.roll = false;

    return ChatMessage.create(chatData);
  }

  /**
   *  This function allows for equipping and unequipping equipment
   * @param {boolean} unequip Optional parameter to guarantee an unequip.
   */
  equipItem(unequip) {
    const sys = this.actor.system;
    const type = this.type === "weapon" || this.type === "armor" ? this.type : null;
    const updateData = {};

    if (unequip || this.id === sys.equipment[type]) {
      updateData[`system.equipment.${type}`] = null;
    }

    else if (type != null) {
      updateData[`system.equipment.${type}`] = this.id;
    }

    this.actor.update(updateData);

  }
}
