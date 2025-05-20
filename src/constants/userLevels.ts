export const USER_LEVELS = {
    COMUM: 1,
    ADMIN: 2
} as const;

export const USER_LEVEL_LABELS = {
    [USER_LEVELS.COMUM]: 'Usuário Comum',
    [USER_LEVELS.ADMIN]: 'Administrador'
} as const; 