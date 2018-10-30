const href = location.href;
let roomID = "";
if (href.indexOf('#') >= 0) {
    roomID = href.slice(href.lastIndexOf('/') + 1);
    document.querySelector('input[name="RName"]').value = roomID;
}
const players = [];
let roundNr = 0;
const UUIDGeneratorBrowser = () =>
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
const myUUID = UUIDGeneratorBrowser();
// END Game specific Init

const socket = io();
function send(topic, data) {
    const payload = {
            uuid: myUUID,
            room: document.querySelector('input[name="RName"]').value,
            pw: document.querySelector('input[name="RPass"]').value,
            ...data        
    }
    console.log(`%c --> sending`, "color: green; font-weight: bold");
    console.log(payload);
    socket.emit(topic, payload);
}
socket.on('error-msg', (data) => console.error(data));
socket.on('chat', function(data) {
    document.querySelector('div.hehe').innerHTML += (`<p>${data.from}: ${data.message}</p>`);
});
socket.on('allPlayers', function (data) {
    console.table(data);
    data.forEach(player => {
        if (!players.some(x => x.uuid === player.uuid)) {
            players.push(player)
            document.querySelector('div.playerlist').innerHTML += (`<p>${player.name}: <span data-uuid="${player.uuid}">${player.points}</p>`);
        }
        document.querySelector(`span[data-uuid="${player.uuid}"]`).innerHTML = player.points;
    })
});
socket.on('roundStart', function (data) {
    console.info("Round Started ", data);
    roundNr = data.roundNr;
    document.querySelector('div.black-card').innerHTML += (`<p>${data.blackCard.text}</p>`);
});
socket.on('yourCards',  function (data) {
    console.info('Your cards are: ', data);
    document.querySelector('div.your-cards').innerHTML = "";
    data.forEach(card => {
        document.querySelector('div.your-cards').innerHTML += (`
            <input type="checkbox" name="${card}">
            <label for="${card}">${card}</label>
            `);
    })
});
socket.on('allAnswers', function (data) {
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
});

document.querySelector('button.start').addEventListener('click', () => send("startRound"));

document.querySelector('div.new button').addEventListener('click', () => send("newRoom", { name: document.querySelector("input[name=Name]").value }));

document.querySelector('div.join button').addEventListener('click', () => send("joinRoom", { name: document.querySelector("input[name=Name]").value }));

document.querySelector('div.chat button').addEventListener('click', () => send("chat", { message: document.querySelector("input[name=chat]").value }));

document.querySelector("button.confirm").addEventListener('click', () => {
    const value = Array.from(document.querySelectorAll("input[type=checkbox]:checked")).map(item => item.name);
    send("playCard", {
        roundNr: roundNr,
        textArray: value
    })
})
