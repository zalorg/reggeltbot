var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
/* eslint-disable quotes */
/* eslint-disable no-undef */
var Discord = require("discord.js");
var bot = new Discord.Client();
var DBL = require("dblapi.js");
var ms = require("ms");
var admin = require("firebase-admin");
var https = require('https');
var express = require('express');
var app = express();
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://zal1000.firebaseio.com"
});
var rdb = admin.database();
var dblRef = rdb.ref("bots/reggeltbot/dblToken");
dblRef.once("value", function (snapshot) {
    new DBL(snapshot.val(), bot);
    console.debug(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});
bot.on("ready", function () { return __awaiter(_this, void 0, void 0, function () {
    var doc;
    return __generator(this, function (_a) {
        console.log(bot.user.username + " has started");
        doc = admin.firestore().collection("bots").doc("reggeltbot-count-all");
        doc.onSnapshot(function (docSnapshot) {
            bot.user.setActivity("for " + docSnapshot.data().reggeltcount + " morning message", { type: "WATCHING" });
        }, function (err) {
            console.log("Encountered error: " + err);
            bot.user.setActivity("Encountered error: " + err, { type: "PLAYING" });
        });
        return [2 /*return*/];
    });
}); });
bot.on("messageUpdate", function (_, newMsg) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (newMsg.author.bot)
                    return [2 /*return*/];
                if (!(newMsg.channel.name === "reggelt")) return [3 /*break*/, 2];
                if (!!newMsg.content.toLowerCase().includes("reggelt")) return [3 /*break*/, 2];
                return [4 /*yield*/, reggeltUpdateEdit(newMsg)];
            case 1:
                _a.sent();
                if (newMsg.deletable) {
                    newMsg["delete"]();
                    newMsg.author.send("Ebben a formában nem modósíthadod az üzenetedet.");
                }
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
app.get('/ping', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.status(200).send({
            ping: bot.ws.ping
        });
        return [2 /*return*/];
    });
}); });
bot.ws.on('INTERACTION_CREATE', function (interaction) { return __awaiter(_this, void 0, void 0, function () {
    var prefix, cmd, db, dcid, cityRef, doc, upmbed, upmbed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getPrefix()];
            case 1:
                prefix = (_a.sent()).prefix;
                cmd = interaction.data.name;
                if (!(cmd === "count" || cmd === "ciunt")) return [3 /*break*/, 3];
                db = admin.firestore();
                dcid = interaction.member.user.id;
                cityRef = db.collection("dcusers").doc(dcid);
                return [4 /*yield*/, cityRef.get()];
            case 2:
                doc = _a.sent();
                if (!doc.exists) {
                    interactionResponse(interaction, {
                        type: 4,
                        data: {
                            content: 'Error reading document!'
                        }
                    });
                }
                else {
                    upmbed = new Discord.MessageEmbed()
                        .setTitle("" + interaction.member.user.username)
                        .setColor("#FFCB5C")
                        .addField("Ennyiszer köszöntél be a #reggelt csatornába", doc.data().reggeltcount + " [(Megnyit\u00E1s a weboldalon)](https://reggeltbot.com/count?i=" + dcid + ")")
                        .setFooter(interaction.member.user.username)
                        .setThumbnail(doc.data().pp)
                        .setTimestamp(Date.now());
                    console.log(upmbed);
                    interactionResponse(interaction, {
                        type: 4,
                        data: {
                            embeds: [upmbed]
                        }
                    });
                }
                return [3 /*break*/, 4];
            case 3:
                if (cmd === "help") {
                    upmbed = new Discord.MessageEmbed()
                        .setTitle(interaction.member.user.username)
                        .setColor("#FFCB2B")
                        .addField(prefix + "count", "Megmondja, hogy h\u00E1nyszor k\u00F6sz\u00F6nt\u00E9l be a #reggelt csatorn\u00E1ba (vagy [itt](https://reggeltbot.com/count?i=" + interaction.member.user.id + ") is megn\u00E9zheted)")
                        .addField(prefix + "invite", "Bot meghívása")
                        .addField("Reggelt csatorna beállítása", "Nevezz el egy csatornát **reggelt**-nek és kész")
                        .addField("top.gg", "Ha bárkinek is kéne akkor itt van a bot [top.gg](https://top.gg/bot/749037285621628950) oldala")
                        .addField("Probléma jelentése", "Ha bármi problémát észlelnél a bot használata közben akkor [itt](https://github.com/zal1000/reggeltbot/issues) tudod jelenteni")
                        .addField('\u200B', '\u200B')
                        .addField("Bot ping", bot.ws.ping + "ms")
                        .addField("Uptime", "" + ms(bot.uptime))
                        .setFooter(interaction.member.user.username)
                        .setThumbnail(bot.user.avatarURL())
                        .setTimestamp(Date.now());
                    interactionResponse(interaction, {
                        type: 4,
                        data: {
                            embeds: [upmbed]
                        }
                    });
                }
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
bot.on("message", function (message) { return __awaiter(_this, void 0, void 0, function () {
    var prefix, messageArray, cmd, args, _a, db, ref, doc, cdref, cddoc, configref, configDoc, cdval, cd, upmbed, db_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (message.author.bot)
                    return [2 /*return*/];
                return [4 /*yield*/, getPrefix()];
            case 1:
                prefix = (_b.sent()).prefix;
                messageArray = message.content.split(" ");
                cmd = messageArray[0];
                args = messageArray.slice(1);
                _a = message.channel.name;
                return [4 /*yield*/, getReggeltChannel(process.env.PROD)];
            case 2:
                if (!(_a === (_b.sent()).channel)) return [3 /*break*/, 19];
                db = admin.firestore();
                if (!message.content.toLowerCase().includes("reggelt")) return [3 /*break*/, 16];
                ref = db.collection('dcusers').doc(message.author.id);
                return [4 /*yield*/, ref.get()];
            case 3:
                doc = _b.sent();
                cdref = db.collection('dcusers').doc(message.author.id).collection('cooldowns').doc(message.guild.id);
                return [4 /*yield*/, cdref.get()];
            case 4:
                cddoc = _b.sent();
                configref = db.collection('bots').doc('reggeltbot').collection('config').doc('default');
                return [4 /*yield*/, configref.get()];
            case 5:
                configDoc = _b.sent();
                cdval = configDoc.data().cd * 3600;
                cd = Math.floor(Date.now() / 1000) + cdval;
                console.log("Cooldown ends: " + cd);
                console.log(Math.floor(Date.now() / 1000));
                if (!cddoc.exists) return [3 /*break*/, 11];
                console.log('');
                console.log(cddoc.data().reggeltcount);
                if (!(cddoc.data().reggeltcount > Math.floor(Date.now() / 1000))) return [3 /*break*/, 6];
                message["delete"]();
                message.author.send('You are on cooldown!');
                return [3 /*break*/, 10];
            case 6:
                if (!!process.env.PROD) return [3 /*break*/, 9];
                return [4 /*yield*/, reggeltupdateall()];
            case 7:
                _b.sent();
                return [4 /*yield*/, reggeltupdatefs(message)];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9:
                cdref.update({
                    reggeltcount: cd
                });
                console.log(2);
                _b.label = 10;
            case 10:
                console.log(1);
                return [3 /*break*/, 15];
            case 11:
                cdref.set({
                    reggeltcount: cd
                });
                if (!!process.env.PROD) return [3 /*break*/, 14];
                return [4 /*yield*/, reggeltupdateall()];
            case 12:
                _b.sent();
                return [4 /*yield*/, reggeltupdatefs(message)];
            case 13:
                _b.sent();
                _b.label = 14;
            case 14:
                console.log('doc created');
                _b.label = 15;
            case 15:
                if (doc.exists) {
                    ref.update({
                        tag: message.author.tag,
                        username: message.author.username,
                        pp: message.author.avatarURL()
                    });
                }
                else {
                    ref.set({
                        tag: message.author.tag,
                        username: message.author.username,
                        pp: message.author.avatarURL()
                    });
                }
                console.log("message passed in: \"" + message.guild + ", by.: " + message.author.username + " (id: \"" + message.guild.id + "\")\"(HUN)");
                message.react("☕");
                return [3 /*break*/, 18];
            case 16:
                if (!message.deletable) {
                    message.channel.send('Missing permission!')["catch"](function (err) {
                        message.guild.owner.send('Missing permission! I need **Send Messages** to function correctly');
                        console.log(err);
                    });
                    message.guild.owner.send('Missing permission! I need **Manage Messages** to function correctly')["catch"]();
                }
                else {
                    message["delete"]();
                    message.author.send("Ide csak reggelt lehet \u00EDrni! (" + message.guild + ")")["catch"](function (error) {
                        message.reply("Error: " + error);
                        console.log("Error:", error);
                    });
                }
                return [4 /*yield*/, reggeltupdatefs(message, true)];
            case 17:
                _b.sent();
                _b.label = 18;
            case 18: return [3 /*break*/, 32];
            case 19:
                if (!(message.content === prefix + "help")) return [3 /*break*/, 20];
                upmbed = new Discord.MessageEmbed()
                    .setTitle(message.author.username)
                    .setColor("#FFCB2B")
                    .addField(prefix + "count", "Megmondja, hogy h\u00E1nyszor k\u00F6sz\u00F6nt\u00E9l be a #reggelt csatorn\u00E1ba (vagy [itt](https://reggeltbot.com/count?i=" + message.author.id + ") is megn\u00E9zheted)")
                    .addField(prefix + "invite", "Bot meghívása")
                    .addField("Reggelt csatorna beállítása", "Nevezz el egy csatornát **reggelt**-nek és kész")
                    .addField("top.gg", "Ha bárkinek is kéne akkor itt van a bot [top.gg](https://top.gg/bot/749037285621628950) oldala")
                    .addField("Probléma jelentése", "Ha bármi problémát észlelnél a bot használata közben akkor [itt](https://github.com/zal1000/reggeltbot/issues) tudod jelenteni")
                    .addField('\u200B', '\u200B')
                    .addField("Bot ping", bot.ws.ping + "ms")
                    .addField("Uptime", "" + ms(bot.uptime))
                    .setFooter(message.author.username)
                    .setThumbnail(bot.user.avatarURL())
                    .setTimestamp(message.createdAt);
                message.channel.send(upmbed);
                return [3 /*break*/, 32];
            case 20:
                if (!(message.content === prefix + "count")) return [3 /*break*/, 22];
                return [4 /*yield*/, getCountForUser(message)];
            case 21:
                _b.sent();
                return [3 /*break*/, 32];
            case 22:
                if (!(cmd === prefix + "link")) return [3 /*break*/, 23];
                if (!args[0]) {
                    message.reply("Please provide your email");
                }
                else if (!args[1]) {
                    message.reply("Please provide your link code");
                }
                else {
                    botTypeing(message.channel.id);
                    db_1 = admin.firestore();
                    admin
                        .auth()
                        .getUserByEmail(args[0])
                        .then(function (userRecord) {
                        accountLink(userRecord, db_1, message);
                    })["catch"](function (error) {
                        console.log("Error fetching user data:", error);
                    });
                }
                return [3 /*break*/, 32];
            case 23:
                if (!(cmd === prefix + "fact")) return [3 /*break*/, 29];
                if (!!args[0]) return [3 /*break*/, 25];
                return [4 /*yield*/, getRandomFact(message)];
            case 24:
                _b.sent();
                return [3 /*break*/, 28];
            case 25:
                if (!(args[0] === "id")) return [3 /*break*/, 28];
                if (!!args[1]) return [3 /*break*/, 26];
                message.reply('Please add fact id!');
                return [3 /*break*/, 28];
            case 26: return [4 /*yield*/, getRandomFactWithId(args[1], message)];
            case 27:
                _b.sent();
                _b.label = 28;
            case 28: return [3 /*break*/, 32];
            case 29:
                if (!(cmd === prefix + "restart")) return [3 /*break*/, 31];
                return [4 /*yield*/, restartRequest(message)];
            case 30:
                _b.sent();
                return [3 /*break*/, 32];
            case 31:
                if (cmd === prefix + "update") {
                    updateUser(message);
                }
                _b.label = 32;
            case 32: return [2 /*return*/];
        }
    });
}); });
function updateUser(message) {
    return __awaiter(this, void 0, void 0, function () {
        var ref, gme;
        return __generator(this, function (_a) {
            ref = admin.firestore().collection('dcusers').doc(message.author.id).collection('guilds').doc(message.guild.id);
            gme = message.guild.me;
            console.log(gme.permissions.toArray());
            ref.set({
                name: message.guild.name,
                owner: message.guild.ownerID,
                icon: message.guild.iconURL(),
                permissions: {
                    ADMINISTRATOR: gme.hasPermission("ADMINISTRATOR"),
                    MANAGE_CHANNELS: gme.hasPermission("MANAGE_CHANNELS"),
                    MANAGE_GUILD: gme.hasPermission("MANAGE_GUILD"),
                    MANAGE_MESSAGES: gme.hasPermission("MANAGE_MESSAGES")
                },
                allpermissions: gme.permissions.toArray()
            }).then(function () {
                message.reply('Server added/updated succesfuly!');
            })["catch"](function () {
                message.reply('Error adding the server, please try again later and open a new issue on Github(https://github.com/zal1000/reggeltbot/issues)');
            });
            return [2 /*return*/];
        });
    });
}
function getReggeltChannel(PROD) {
    return __awaiter(this, void 0, void 0, function () {
        var db, ref, doc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    ref = db.collection('bots').doc('reggeltbot-channels');
                    return [4 /*yield*/, ref.get()];
                case 1:
                    doc = _a.sent();
                    if (PROD === "false") {
                        return [2 /*return*/, {
                                channel: doc.data().test
                            }];
                    }
                    else if (PROD === "beta") {
                        return [2 /*return*/, {
                                channel: doc.data().beta
                            }];
                    }
                    else {
                        return [2 /*return*/, {
                                channel: doc.data().main
                            }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getPrefix() {
    return __awaiter(this, void 0, void 0, function () {
        var db, botRef, doc, PROD;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    botRef = db.collection("bots").doc("reggeltbot");
                    return [4 /*yield*/, botRef.get()];
                case 1:
                    doc = _a.sent();
                    PROD = process.env.PROD;
                    if (PROD === "false") {
                        return [2 /*return*/, {
                                prefix: doc.data().testprefix
                            }];
                    }
                    else if (PROD === "beta") {
                        return [2 /*return*/, {
                                prefix: doc.data().betaprefix
                            }];
                    }
                    else {
                        return [2 /*return*/, {
                                prefix: doc.data().prefix
                            }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function restartRequest(message) {
    return __awaiter(this, void 0, void 0, function () {
        var ref, doc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ref = admin.firestore().collection("bots").doc("reggeltbot");
                    return [4 /*yield*/, ref.get()];
                case 1:
                    doc = _a.sent();
                    if (message.author.id === doc.data().ownerid) {
                        message.reply('Restarting container...').then(function () {
                            bot.destroy();
                        }).then(function () {
                            process.exit();
                        });
                    }
                    else {
                        message.reply('Nope <3');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getRandomFactWithId(id, message) {
    return __awaiter(this, void 0, void 0, function () {
        var db, ref, doc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    ref = db.collection("facts").doc(id);
                    return [4 /*yield*/, ref.get()];
                case 1:
                    doc = _a.sent();
                    if (!doc.exists) {
                        message.reply('Cannot find that fact!');
                    }
                    else {
                        sendRandomFact(doc.id, doc.data(), message);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getRandomFact(message) {
    return __awaiter(this, void 0, void 0, function () {
        var db, quotes, key2;
        return __generator(this, function (_a) {
            db = admin.firestore();
            quotes = db.collection("facts");
            key2 = quotes.doc().id;
            quotes.where(admin.firestore.FieldPath.documentId(), '>=', key2).limit(1).get()
                .then(function (snapshot) {
                if (snapshot.size > 0) {
                    snapshot.forEach(function (doc) {
                        sendRandomFact(doc.id, doc.data(), message);
                    });
                }
                else {
                    quotes.where(admin.firestore.FieldPath.documentId(), '<', key2).limit(1).get()
                        .then(function (snapshot) {
                        snapshot.forEach(function (doc) {
                            sendRandomFact(doc.id, doc.data(), message);
                        });
                    })["catch"](function (err) {
                        message.reply("Error geting fact: **" + err + "**");
                        console.log('Error getting documents', err);
                    });
                }
            })["catch"](function (err) {
                message.reply("Error geting fact: **" + err.message + "**");
                console.log('Error getting documents', err);
            });
            return [2 /*return*/];
        });
    });
}
function sendRandomFact(docid, docdata, message) {
    return __awaiter(this, void 0, void 0, function () {
        var db, userRef, userDoc, upmbed, upmbed, dcRef, dcDoc, upmbed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    userRef = db.collection('users').doc("" + docdata.owner);
                    return [4 /*yield*/, userRef.get()];
                case 1:
                    userDoc = _a.sent();
                    if (!!docdata.owner) return [3 /*break*/, 2];
                    upmbed = new Discord.MessageEmbed()
                        .setTitle("Random fact")
                        .setColor("#FFCB5C")
                        .addField("Fact", docdata.fact)
                        .setFooter("This is a template fact")
                        .addField('\u200B', '\u200B')
                        .addField("Add your fact", "You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))")
                        .setTimestamp(message.createdAt);
                    message.channel.send(upmbed);
                    return [3 /*break*/, 5];
                case 2:
                    if (!!userDoc.data().dcid) return [3 /*break*/, 3];
                    upmbed = new Discord.MessageEmbed()
                        .setTitle("Random fact by.: " + docdata.author)
                        .setColor("#FFCB5C")
                        .addField("Fact", docdata.fact)
                        .addField("Fact id", docid)
                        .addField('\u200B', '\u200B')
                        .addField("Add your fact", "You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))")
                        .setFooter(docdata.author)
                        .setTimestamp(message.createdAt);
                    message.channel.send(upmbed);
                    return [3 /*break*/, 5];
                case 3:
                    dcRef = db.collection('dcusers').doc("" + userDoc.data().dcid);
                    return [4 /*yield*/, dcRef.get()];
                case 4:
                    dcDoc = _a.sent();
                    upmbed = new Discord.MessageEmbed()
                        .setTitle("Random fact by.: " + dcDoc.data().username)
                        .setColor("#FFCB5C")
                        .addField("Fact", docdata.fact)
                        .addField("Fact id", docid)
                        .addField('\u200B', '\u200B')
                        .addField("Add your fact", "You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))")
                        .setFooter(dcDoc.data().tag)
                        .setThumbnail(dcDoc.data().pp)
                        .setTimestamp(message.createdAt);
                    message.channel.send(upmbed);
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function reggeltupdateall() {
    return __awaiter(this, void 0, void 0, function () {
        var db, botRef, botDoc, incrementCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    botRef = db.collection("bots").doc("reggeltbot");
                    return [4 /*yield*/, botRef.get()];
                case 1:
                    botDoc = _a.sent();
                    incrementCount = botDoc.data().incrementCount;
                    return [4 /*yield*/, db.collection("bots").doc("reggeltbot-count-all").update({
                            reggeltcount: admin.firestore.FieldValue.increment(incrementCount)
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function reggeltupdatefs(message, decreased) {
    if (decreased === void 0) { decreased = false; }
    return __awaiter(this, void 0, void 0, function () {
        var db, reggeltRef, doc, botRef, botDoc, decreaseCount, incrementCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    reggeltRef = db.collection("dcusers").doc(message.author.id);
                    return [4 /*yield*/, reggeltRef.get()];
                case 1:
                    doc = _a.sent();
                    botRef = db.collection("bots").doc("reggeltbot");
                    return [4 /*yield*/, botRef.get()];
                case 2:
                    botDoc = _a.sent();
                    decreaseCount = botDoc.data().decreaseCount;
                    incrementCount = botDoc.data().incrementCount;
                    if (!doc.exists) {
                        reggeltRef.set({
                            reggeltcount: (decreased ? decreaseCount : incrementCount),
                            tag: message.author.tag,
                            username: message.author.username,
                            pp: message.author.avatarURL()
                        });
                    }
                    else {
                        reggeltRef.update({
                            reggeltcount: admin.firestore.FieldValue.increment(decreased ? decreaseCount : incrementCount),
                            tag: message.author.tag,
                            username: message.author.username,
                            pp: message.author.avatarURL()
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function reggeltUpdateEdit(message) {
    return __awaiter(this, void 0, void 0, function () {
        var db, botRef, botDoc, decreaseCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    botRef = db.collection("bots").doc("reggeltbot");
                    return [4 /*yield*/, botRef.get()];
                case 1:
                    botDoc = _a.sent();
                    decreaseCount = botDoc.data().decreaseCount;
                    return [4 /*yield*/, db.collection("bots").doc("reggeltbot-count-all").update({
                            reggeltcount: admin.firestore.FieldValue.increment(decreaseCount)
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.collection("dcusers").doc(message.author.id).update({
                            reggeltcount: admin.firestore.FieldValue.increment(decreaseCount)
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getCountForUser(message) {
    return __awaiter(this, void 0, void 0, function () {
        var db, dcid, cityRef, doc, upmbed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    dcid = message.author.id;
                    cityRef = db.collection("dcusers").doc(dcid);
                    return [4 /*yield*/, cityRef.get()];
                case 1:
                    doc = _a.sent();
                    if (!doc.exists) {
                        console.log("No such document!");
                        message.reply("Error reading document!");
                    }
                    else {
                        upmbed = new Discord.MessageEmbed()
                            .setTitle("" + message.author.username)
                            .setColor("#FFCB5C")
                            .addField("Ennyiszer köszöntél be a #reggelt csatornába", doc.data().reggeltcount + " [(Megnyit\u00E1s a weboldalon)](https://reggeltbot.com/count?i=" + dcid + ")")
                            .setFooter(message.author.username)
                            .setThumbnail(message.author.avatarURL())
                            .setTimestamp(message.createdAt);
                        console.log(upmbed);
                        message.channel.send(upmbed);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function botTypeing(channel) {
    return __awaiter(this, void 0, void 0, function () {
        var data, _a, _b, options, _c, _d, req;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    data = JSON.stringify({});
                    _b = (_a = console).log;
                    return [4 /*yield*/, getBotToken(process.env.PROD)];
                case 1:
                    _b.apply(_a, [(_g.sent()).token]);
                    _e = {
                        hostname: 'discord.com',
                        port: 443,
                        path: "/api/v8/channels/" + channel + "/typing",
                        method: 'POST'
                    };
                    _f = {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length
                    };
                    _c = 'Authorization';
                    _d = "Bot ";
                    return [4 /*yield*/, getBotToken(process.env.PROD)];
                case 2:
                    options = (_e.headers = (_f[_c] = _d + (_g.sent()).token,
                        _f),
                        _e);
                    req = https.request(options, function (res) {
                        console.log("statusCode: " + res.statusCode);
                        res.on('data', function (d) {
                            process.stdout.write(d);
                        });
                    });
                    req.on('error', function (error) {
                        console.error(error);
                    });
                    req.write(data);
                    req.end();
                    return [2 /*return*/];
            }
        });
    });
}
console.log(process.env.PROD);
var PROD = process.env.PROD;
botlogin(PROD);
function getBotToken(PROD) {
    return __awaiter(this, void 0, void 0, function () {
        var db, botRef, doc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    botRef = db.collection("bots").doc("reggeltbot");
                    return [4 /*yield*/, botRef.get()];
                case 1:
                    doc = _a.sent();
                    if (PROD === "false") {
                        return [2 /*return*/, {
                                token: doc.data().testtoken
                            }];
                    }
                    else if (PROD === "beta") {
                        return [2 /*return*/, {
                                token: doc.data().betatoken
                            }];
                    }
                    else {
                        return [2 /*return*/, {
                                token: doc.data().token
                            }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function accountLink(userRecord, db, message) {
    return __awaiter(this, void 0, void 0, function () {
        var messageArray, cmd, args, userRef, userDoc, dcUserRef, dcUserDoc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageArray = message.content.split(" ");
                    cmd = messageArray[0];
                    args = messageArray.slice(1);
                    userRef = db.collection("users").doc(userRecord.uid);
                    return [4 /*yield*/, userRef.get()];
                case 1:
                    userDoc = _a.sent();
                    dcUserRef = db.collection("dcusers").doc(message.author.id);
                    return [4 /*yield*/, dcUserRef.get()];
                case 2:
                    dcUserDoc = _a.sent();
                    if (userDoc.data().dclinked) {
                        message.reply("This account is already linked!", args[1]);
                    }
                    else if ("" + userDoc.data().dclink === args[1]) {
                        dcUserRef.update({
                            uid: message.author.id
                        });
                        userRef.update({
                            dclink: admin.firestore.FieldValue["delete"](),
                            dclinked: true,
                            dcid: message.author.id
                        });
                        message.reply("Account linked succesfuly!");
                    }
                    else {
                        message.reply("Error linking account");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function botlogin(PROD) {
    return __awaiter(this, void 0, void 0, function () {
        var db, botRef, doc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = admin.firestore();
                    botRef = db.collection("bots").doc("reggeltbot");
                    return [4 /*yield*/, botRef.get()];
                case 1:
                    doc = _a.sent();
                    if (PROD === "false") {
                        bot.login(doc.data().testtoken);
                    }
                    else if (PROD === "beta") {
                        bot.login(doc.data().betatoken);
                    }
                    else {
                        bot.login(doc.data().token);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function interactionResponse(interaction, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            bot.api.interactions(interaction.id, interaction.token).callback.post({ data: data });
            return [2 /*return*/];
        });
    });
}
app.listen(3000);
