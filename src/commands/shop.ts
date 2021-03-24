import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
const db = admin.firestore()

module.exports = {
    name: 'shop',
    async execute(bot: Discord.Client, message: Discord.Message, args: Array<string>) {
        const userref = db.collection('dcusers').doc(message.author.id);
        const emoteref = userref.collection('inventory').doc('emotes');

        const emotedoc = await emoteref.get();
        const userdoc = await userref.get()

        /*
        if(!emotedoc.exists) {
            const emotes: string[] = [];

            if(!emotes.find(e => e === '☕')) {
                emotes.push('☕');
            }

            if(!emotes.find(e => e === '🍵')) {
                emotes.push('🍵');
            }
            
            emoteref.set({
                have: emotes,
            }, {merge:true}).catch(e => {
                message.reply('Error createing profile! Please try again later!')
            })
        }
        */
        if(!args[0]) {
            message.reply('Please specify action!');
            return;
        }

        switch(args[0]) {
            case 'set':
                if(!args[1]) {
                    message.reply('Please specify thing to set!');
                    return;
                }
                if(args[1] === 'reggeltemote') {
                    const emote = args[2];
                    let array: string[] = emotedoc.data()?.have || [];
    
                    if(!array.find(e => e === '☕')) {
                        array.push('☕');
                    }
    
                    if(!array.find(e => e === '🍵')) {
                        array.push('🍵');
                    }
                    
    
                    if(array.find(e => e === emote)) {
                        userref.update({
                            reggeltemote: args[2]
                        }).then(d => {
                            message.reply(`Reggeltemote updated to: ${args[2]}`)
                        }).catch(e => {
                            message.reply('Error! this dumass probably messed something up <@423925286350880779>')
                        })
                    } else {
                        message.reply('You dont own this emote!')
                    }
                }
                break;
            case 'add':
                if(!args[1]) {
                    message.reply('Please specify thing to add!');
                    return;
                }
    
                if(args[1] === "emote") {
                    let array: string[] = emotedoc.data()?.have || [];
    
                    if(!args[2]) {
                        message.reply('Please specify emote!');
                    } else if(array.find(e => e === args[2])) {
                        message.reply('You already own this emote!')
                    } else if(array[4]) {
                        message.reply(`You reatched the limit (3 emotes) \n You use these emote: [${array.join(' ')}]`)
                    } else {
                        array.push(args[2]);
                        console.log(array)
                        if(!array.find(e => e === '☕')) {
                            array.push('☕');
                        }

                        if(!array.find(e => e === '🍵')) {
                            array.push('🍵');
                        }
                        
                        console.log(array)

                        if(!userdoc.data()?.coins) {
                            if(!userdoc.data()?.reggeltcount) {
                                message.reply(`You dont have any coins! Start whising mornigng to people in <#${message.guild?.channels.cache.find(e => e.name === "reggelt")?.id}>`)
                            } else {
                                userref.update({
                                    coins: userdoc.data()?.reggeltcount,
                                }).then(d => {
                                    addemotes();
                                }).catch(e => {
                                    message.reply('Error! this dumass probably messed something up <@423925286350880779>')
                                })
                            }
                        } else {
                            addemotes()
                        }

                        function addemotes() {
                            if(userdoc.data()?.coins > 20) {
                                userref.update({
                                    coins: admin.firestore.FieldValue.increment(-20),
                                }).then(d1 => {
                                    emoteref.set({
                                        have: array,
                                    }, {merge: true}).then(d => {
                                        message.reply(`Emote added \n Your current emotes: [${array.join(' ')}]`);
                                    }).catch(e => {
                                        message.reply('Error! this dumass probably messed something up <@423925286350880779>')
                                    })
                                }).catch(e => {
                                    message.reply('Error! this dumass probably messed something up <@423925286350880779>')
                                })

                            } else {
                                message.reply(`You dont have enough coin to by an emote \n Your current coins: ${userdoc.data()?.coins}`)
                            }


                        }

                    }
                }
                break;
        }
    }
}