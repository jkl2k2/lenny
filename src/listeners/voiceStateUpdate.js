const { Listener } = require(`discord-akairo`);

class VoiceStateUpdateListener extends Listener {
    constructor() {
        super(`voiceStateUpdate`, {
            emitter: `client`,
            event: `voiceStateUpdate`
        });
    }

    exec(oldState, newState) {
        console.log(`voiceStateUpdate emitted`);
        if ((oldState.member.id !== this.client.user.id && oldState.channel && oldState.channel.members.size === 1 && oldState.channel.members.has(this.client.user.id)) || (oldState.channel && !newState.channel)) {
            const subscription = this.client.subscriptions.get(oldState.guild.id);

            if (subscription) {
                subscription.voiceConnection.destroy();
                this.client.subscriptions.delete(oldState.guild.id);
            }
        }
    }
}

module.exports = VoiceStateUpdateListener;