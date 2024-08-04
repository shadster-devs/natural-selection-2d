export const saveToLocalStorage = (key : string ,obj: object) => {
    localStorage.setItem(key, JSON.stringify(obj));
};

export const getFromLocalStorage = (key : string) => {
    const obj = localStorage.getItem(key);
    return obj ? JSON.parse(obj) : null;
};


export const LocalStorageKeys = {
    CONFIG: 'config',
}