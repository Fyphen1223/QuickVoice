function formattedDateTime(date) {
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    const h = ('0' + date.getHours()).slice(-2);
    const mi = ('0' + date.getMinutes()).slice(-2);
    const s = ('0' + date.getSeconds()).slice(-2);
    return `${y}/${m}/${d} ${h}:${mi}`;
}

function getCurrentTime() {
    return formattedDateTime(new Date());
}

module.exports = { getCurrentTime };