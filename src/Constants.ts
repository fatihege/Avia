export const Bot = {
    ID: '838775980184436808',
    DEFAULT_PREFIX: 'a.',
    PREFIX_MESSAGES: ['ahelp', 'prefix'],
    PERMISSION_ROLE: 'Avia',
    COOLDOWN: 3000,
    SOURCE_SQUAD_LOGO: 'https://cdn.discordapp.com/icons/815870678406397962/8e7f69677d9db48d69a13976cf8e0fee.webp',
    AUTHOR_ID: '799520588485361675',
    INVITE_URL: 'https://discord.com/oauth2/authorize?client_id=838775980184436808&scope=bot&permissions=201583686',
    SUPPORT_URL: 'https://discord.gg/Xn3JRrbY8d',
    TOP_GG: 'https://top.gg',
    GITHUB: 'https://github.com/fatihege/Avia'
}

export const Colors = {
    DEFAULT: 0x1c1c1c,
    GREEN: 0x2bff3d,
    RED: 0xfc2b2b,
    BLUE: 0x2294e0
}

export const Emoji = {
    ROUND_PUSHPIN: ':round_pushpin:',
    PARTYING_FACE: ':partying_face:',
    GEM: ':gem:',
    OPEN_FILE_FOLDER: ':open_file_folder:',
    CATEGORY: {
        configuration: ':wrench:',
        game: ':video_game:',
        information: ':information_source:',
        moderation: ':gear:'
    },
    XOX: {
        X: '<:_x:842014745292570626>',
        O: '<:_o:842014745011421195>',
        NUMBERS: {
            1: '<:_one:842014744738136080>',
            2: '<:_two:842014745513951262>',
            3: '<:_three:842014745024135179>',
            4: '<:_four:842014744742985728>',
            5: '<:_five:842014744855969872>',
            6: '<:_six:842014745128206396>',
            7: '<:_seven:842014745162678273>',
            8: '<:_eight:842014744244518944>',
            9: '<:_nine:842014744663556108>',
        }
    }
}

export const Command = {
    COMMANDS_DIR: 'commands',
    EVENTS_DIR: 'events'
}

export const Logger = {
    LOG_FILE: 'log.txt'
}

export const Language = {
    DEFAULT_LANGUAGE: 'en_US',
    LANGUAGE_PATH: 'languages'
}

export const Status = {
    online: ':green_circle:',
    idle: ':yellow_circle:',
    offline: ':white_circle:',
    dnd: ':no_entry:'
}

export const ValidPermissions = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS'
]

export const Bytes = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB'
]