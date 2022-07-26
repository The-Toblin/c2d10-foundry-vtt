export default class C2D10Item extends Item {

  chatTemplate = {
    trait: "systems/c2d10/templates/partials/chat-templates/trait-chat.hbs"
  };

  async showDescription() {
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker()
    };

    const cardData = {
      ...this.data,
      owner: this.actor.id
    };

    chatData.content = await renderTemplate(
      this.chatTemplate[this.type],
      cardData
    );
    chatData.roll = true;

    return ChatMessage.create(chatData);
  }

  async modifyResource(n, res) {
    const updateData = {};
    const system = this.data.data; // FIXME: V10 update.
    const currentValue = system[res];
    const max = 5;

    if (currentValue === max && n > 0) {
      return;
    }

    const newValue = currentValue + n;

    if (newValue < 0) {
      return;
    }

    updateData[`data.${res}`] = newValue;

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
}

