
export interface Langtypes {
    root: {
        bans: {
            global: string,
            guild: string,
            reggeltGlobal: string,
            reggeltGuild: string,
        }
    },
    events: {
        reggelt: {
            channel: string,
            keyWord: string,
            onCooldown: string,
            noPerms: string,
            noSend: string,
            notReggelt: string,
        },
        reggeltUpdate: {
            editSend: string,
        }
    }
    commands: {
        ping: {
            gateway: string,
            internal: string,
            status: string,
            error: string,
            po: string,
            mo: string,
            dp: string,
            aso: string,
        },
        link: {
            aal: string,
            als: string,
            noMail: string,
            noCode: string,
        },
        leaderboard: {
            leaderboard: string,
            numberNaN: string,
            notOneTwenty: string,
        },
        help: {
            title: string,
            f1: string,
            f11: string,
            f2: string,
            f21: string,
            f3: string,
            f31: string,
            f4: string,
            f41: string,
            f5: string,
            f51: string,
            ping: string,
            uptime: string,
            setlang1: string,
            setlang2: string,
        },
        fact: {
            errorGF: string,
            noId: string,
            title1: string,
            title2: string,
            fact: string,
            factid: string,
            add: string,
            addF: string,
            noFact: string,
        },
        count: {
            f1: string,
            f2: string,
        },
        cooldown: {
            title: string,
            
        }
    }
}

export interface Guildconfig {
    cd: number,
    disabled: boolean,
    lang: string,
    premium: boolean,
    reggeltlang: string,
    testing: boolean,
    saylang: string,
    verified: boolean,
}

export interface Regggeltconfig {
    channel: string,
    keyWord: string,
    onCooldown: string,    
    noPrems: string,
    noSend: string,
    notReggelt: string,
}
