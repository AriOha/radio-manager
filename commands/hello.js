module.exports = {
  name: 'hello',
  description: 'Greets the user.',
  execute(message) {
    const displayName = message.member.displayName;
    message.reply(`Hello, ${displayName}!\nHow can I assist you today?`);
  },
};
