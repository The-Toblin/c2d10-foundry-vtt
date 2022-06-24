export default class C2D10Asset extends Item {


  async showDescription() {
    const chatData = {
      user: game.user.data._id,
      speaker: ChatMessage.getSpeaker()
    };

    const cardData = {
      ...this.data,
      owner: this.actor.data._id
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
    const currentValue = this.data.data[res];
    if (currentValue === 5 && n > 0) {
      return;
    }
    const newValue = parseInt(currentValue + n);
    updateData[`data.${res}`] = newValue;

    await this.update(updateData);
  }
}

