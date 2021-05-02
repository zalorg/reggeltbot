import { Message } from "discord.js";
import * as admin from "firebase-admin";

const db = admin.firestore();

export async function update(
  message: Message,
  reggeltcountIncriesment?: number
) {
  const userid = message.author.id;
  const userref = db.collection("dcusers").doc(userid);
  const doc = await userref.get();

  if (reggeltcountIncriesment) {

    //const ppres = await axios.get(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.gif`);

    //const ppurl = ppres.status == 200 ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.gif` : `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp`

    if (!doc.exists) {
      return userref.set(
        {
          reggeltcount: reggeltcountIncriesment,
          reggeltcount1: reggeltcountIncriesment,
          tag: message.author.tag,
          username: message.author.username,
          pp: message.author.avatarURL({dynamic:true}),
          coins: reggeltcountIncriesment,
        },
        { merge: true }
      );
    } else {
      if (!doc.data()?.coins) {
        return userref.set(
          {
            reggeltcount: admin.firestore.FieldValue.increment(
              reggeltcountIncriesment
            ),
            reggeltcount1: admin.firestore.FieldValue.increment(
              reggeltcountIncriesment
            ),
            tag: message.author.tag,
            username: message.author.username,
            pp: message.author.avatarURL({dynamic:true}),
            coins: doc.data()?.reggeltcount,
          },
          { merge: true }
        );
      } else {
        return userref.set(
          {
            reggeltcount1: admin.firestore.FieldValue.increment(
              reggeltcountIncriesment
            ),
            reggeltcount: admin.firestore.FieldValue.increment(
              reggeltcountIncriesment
            ),
            tag: message.author.tag,
            username: message.author.username,
            pp: message.author.avatarURL({dynamic:true}),
            coins: admin.firestore.FieldValue.increment(
              reggeltcountIncriesment
            ),
          },
          { merge: true }
        );
      }
    }
  }

  return userref.set(
    {
      tag: message.author.tag,
      username: message.author.username,
      pp: message.author.avatarURL({dynamic:true}),
    },
    { merge: true }
  );
}
