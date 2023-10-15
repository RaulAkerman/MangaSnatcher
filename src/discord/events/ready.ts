import Client from "discord.js"

export default (client:any): void => {
    client.on("ready",async () => {
        if (!client.user || !client.application){
            return;
        }
        console.log(`${client.user.username} is online`)
    });
};