import * as admin from 'firebase-admin';

module.exports = {
    name: 'rAdd',
    execute(bot: any) {
        bot.on('messageReactionAdd', async (react: any, user: any) => {
            console.log('react')
            console.log(react)
            console.log(react._emoji.name.toLowerCase().includes('green'));
            console.log('');
            console.log(user)

            if(react._emoji.name.toLowerCase().includes('red')) {
                const doc = await admin.firestore().collection('bots').doc('reggeltbot').collection('polls').doc(react.message.id).get()
                if(!doc.exists){

                    admin.firestore().collection('bots').doc('reggeltbot').collection('polls').doc(react.message.id).set({
                        red: 1,
                        green: 0,
                    })

                } else {

                    admin.firestore().collection('bots').doc('reggeltbot').collection('polls').doc(react.message.id).update({
                        red: admin.firestore.FieldValue.increment(1),
                        green: admin.firestore.FieldValue.increment(0),
                    })

                }

            } else if(react._emoji.name.toLowerCase().includes('green')) {
                const doc = await admin.firestore().collection('bots').doc('reggeltbot').collection('polls').doc(react.message.id).get()
                if(!doc.exists){
                    
                    admin.firestore().collection('bots').doc('reggeltbot').collection('polls').doc(react.message.id).set({
                        red: 0,
                        green: 1,
                    })

                } else {
                    admin.firestore().collection('bots').doc('reggeltbot').collection('polls').doc(react.message.id).update({
                        red: admin.firestore.FieldValue.increment(0),
                        green: admin.firestore.FieldValue.increment(1),
                    })
                }  
            }
        })
    }
}