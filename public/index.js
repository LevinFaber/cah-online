const UUIDGeneratorBrowser = () =>
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
const myUUID = UUIDGeneratorBrowser();
let myName = "";
const ws = new WebSocket('ws://' + location.hostname + ':8080');

ws.onopen = function (event) {
    var msg = {
        type: "newRoom",
        room: "hello",
        pw: "ggg",
        name: myName,
        uuid: myUUID
    };
    ws.send(JSON.stringify(msg));
};
ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    handleData[data.type](data);
}
const handleData = {
    chat: function (data) {
        document.querySelector('div').innerHTML += (`<p>${data.from}: ${data.message}</p>`)
    }
}
document.querySelector('input[name="Input"]').addEventListener('change', function () {
    var msg = {
        type: "chat",
        room: "hello",
        pw: "ggg",
        message: document.querySelector('input[name="Input"]').value,
        uuid: myUUID,
    };
    ws.send(JSON.stringify(msg));
})
document.querySelector('input[name="Name"]').addEventListener('change', function () {
    myName = document.querySelector('input[name="Name"]').value;
})