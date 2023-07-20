export const validId = (str) => {
    const newStr = str.replaceAll(/([\s.\+\-\/0-9])/g, '');
    return newStr;
}

export const capitaliseEachWord = (str) => {
    const newStr = str.replaceAll(/(?<!\b)(\w)/g, d => d.toLowerCase());
    return newStr;
}
