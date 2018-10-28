const UUIDGeneratorBrowser = () =>
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
const myUUID = UUIDGeneratorBrowser();
const ws = new WebSocket('ws://' + location.hostname + ':8080');
const href = location.href;
let roomID = "";
if (href.indexOf('#') >= 0) {
    roomID = href.slice(href.lastIndexOf('/') + 1);
    document.querySelector('input[name="RName"]').value = roomID;
}

document.querySelector('button.start').addEventListener('click', function () {
    var msg = {
        type: "startRound",
        message: {
            room: document.querySelector('input[name="RName"]').value,
            pw: document.querySelector('input[name="RPass"]').value,
        }
    }
    console.log(msg);
    ws.send(JSON.stringify(msg));
})
document.querySelector('div.new button').addEventListener('click', function createRoom() {
    var msg = {
        type: "newRoom",
        message: {
            room: document.querySelector('input[name="RName"]').value,
            pw: document.querySelector('input[name="RPass"]').value,
            name: document.querySelector('input[name="Name"]').value,
            uuid: myUUID
        }
    }
    console.log(msg);
    ws.send(JSON.stringify(msg));
})

document.querySelector('div.join button').addEventListener('click', function createRoom() {
    var msg = {
        type: "joinRoom",
        message: {
            room: document.querySelector('input[name="RName"]').value,
            pw: document.querySelector('input[name="RPass"]').value,
            name: document.querySelector('input[name="Name"]').value,
            uuid: myUUID
        }
    }
    console.log(msg);
    ws.send(JSON.stringify(msg));
})

document.querySelector('div.chat button').addEventListener('click', function createRoom() {
    var msg = {
        type: "chat",
        message: {
            room: document.querySelector('input[name="RName"]').value,
            pw: document.querySelector('input[name="RPass"]').value,
            message: document.querySelector('div.chat input[name="Input"]').value,
            uuid: myUUID
        }
    }
    console.log(msg);
    ws.send(JSON.stringify(msg));
})


ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log(data);
    handleData[data.type](data);
}
const handleData = {
    chat: function (data) {
        document.querySelector('div.hehe').innerHTML += (`<p>${data.message.from}: ${data.message.message}</p>`)
    },
    allPlayers: function (data) {
        console.table(data.message)
            ;
    },
    error: function (data) {
        console.error(data.message)
    },
    roundStart: function (data) {
        console.info("Round Started ", data.message)
    }
}