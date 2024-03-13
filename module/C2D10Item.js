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

  prepareData() {
    super.prepareData();
  }

  // Minor migration for armor and weapons here
  async prepareBaseData() {
    super.prepareBaseData();
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
      damage: parseInt(this.system.damage)
    };

    chatData.content = await renderTemplate(
      this.chatTemplate[this.type],
      cardData
    );

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

  async toggleEffects() {
    const relevantEffects = this.effects;

    if (relevantEffects.length === 0) return;
    let currentFlag;
    relevantEffects.forEach(async e => {
      currentFlag = e.disabled;
      await e.update(
        {
          disabled: !currentFlag,
          isSuppressed: false
        }
      );
    });

    await this.setFlag("c2d10", "activeEffect", currentFlag);
  }
}
