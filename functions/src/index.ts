import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
export const senddcmessage = functions.firestore.document('bots/reggeltbot/sendmessage/{docId}').onCreate((change, context) => {
    admin.firestore().collection('bots').doc('reggeltbot').collection('messages').add({
        context: context,
        change: change,
    });
});