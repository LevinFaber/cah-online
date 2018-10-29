const UUIDGeneratorBrowser = () =>
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
const myUUID = UUIDGeneratorBrowser();
const ws = new WebSocket(`ws://${location.hostname}:${location.port}`);
const href = location.href;
let roomID = "";
if (href.indexOf('#') >= 0) {
    roomID = href.slice(href.lastIndexOf('/') + 1);
    document.querySelector('input[name="RName"]').value = roomID;
}
function send(topic, data) {
    const payload = {
        type: topic,
        message: {
            uuid: myUUID,
            room: document.querySelector('input[name="RName"]').value,
            pw: document.querySelector('input[name="RPass"]').value,
            ...data
        }
    }
    console.log(`%c --> sending ${payload.type}`, "color: green; font-weight: bold");
    console.log(payload.message);
    ws.send(JSON.stringify(payload));
}
document.querySelector('button.start').addEventListener('click', () => send("startRound"));
document.querySelector('div.new button').addEventListener('click', () => send("newRoom", { name: document.querySelector("input[name=Name]").value }));
document.querySelector('div.join button').addEventListener('click', () => send("joinRoom", { name: document.querySelector("input[name=Name]").value }));
document.querySelector('div.chat button').addEventListener('click', () => send("chat", { message: document.querySelector("input[name=chat]").value }));
document.querySelector("button.confirm").addEventListener('click', () => {
    const value = document.querySelector("input[type=checkbox]:checked").name;
    send("playCard", {
        roundNr: roundNr,
        text: value
    })
})

ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log(`%c --> recieved ${data.type}`, "color: blue; font-weight: bold");
    console.log(data.message);
    handleData[data.type](data.message);
}
const players = [];
const cards = [];
let roundNr = 0;
const handleData = {
    chat: function (data) {
        document.querySelector('div.hehe').innerHTML += (`<p>${data.from}: ${data.message}</p>`);
    },
    allPlayers: function (data) {
        console.table(data);
        data.forEach(player => {
            if (!players.some(x => x.uuid === player.uuid)) {
                players.push(player)
                document.querySelector('div.playerlist').innerHTML += (`<p>${player.name}: <span data-uuid="${player.uuid}">${player.points}</p>`);
            }
            document.querySelector(`span[data-uuid="${player.uuid}"]`).innerHTML = player.points;
        })
    },
    error: function (data) {
        console.error(data);
    },
    roundStart: function (data) {
        console.info("Round Started ", data);
        roundNr = data.roundNr;
        document.querySelector('div.black-card').innerHTML += (`<p>${data.blackCard.text}</p>`);
    },
    yourCards: function (data) {
        console.info('Your cards are: ', data);
        data.forEach(card => {
            if (!cards.some(x => x === card)) {
                cards.push(card)
                document.querySelector('div.your-cards').innerHTML += (`
                <input type="checkbox" name="${card}">
                <label for="${card}">${card}</label>
                `);
            }
        })
    },
    allAnswers: function (data) {
        console.info('The players played: ', data);
        Object.keys(data).forEach(key => {
            if (key !== "blackCard") {
                document.querySelector('div.answers').innerHTML += `<p data-uuid="${key}">${data[key].answer}</p>`
            }
        })
        const answers = Object.keys(data).length - 1;
        console.log(answers);
        let vote = [];
        document.querySelectorAll('div.answers p').forEach(element => {
            element.addEventListener('click', function () {
                vote = [...vote, this.dataset.uuid];
                if (vote.length == answers) send("vote", { vote: vote });
            })
        })
    }
}



