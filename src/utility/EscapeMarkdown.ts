export default (text: string) => {
    text = text.replace(/\*/g, '\\*');
    text = text.replace(/\|\|/g, '\\|\\|');
    return text;
}