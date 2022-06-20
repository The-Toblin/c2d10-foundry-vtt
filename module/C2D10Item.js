export default class C2D10Item extends Item {


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
}

