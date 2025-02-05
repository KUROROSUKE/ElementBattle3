let p1_hand = []; let p2_hand = []
let p1_point = 0; let p2_point = 0
let p1_selected_card = []; let p2_selected_card = []

const card_num = 8
const WIN_POINT = card_num*30+10
const WIN_TURN = 10

let dropped_cards_p1 = []; let dropped_cards_p2 = []

let turn = "p1"
let time = "game"
let numTurn = 1
let p1_is_acting = false

let collectedData = []
var rate = 0

const WindowSize = window.innerWidth
const elementToNumber = {"H": 1, "He": 2, "Li": 3, "Be": 4, "B": 5, "C": 6, "N": 7, "O": 8, "F": 9, "Ne": 10,"Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 15, "S": 16, "Cl": 17, "Ar": 18, "K": 19, "Ca": 20,"Fe": 26, "Cu": 29, "Zn": 30, "I": 53}
const elements = [...Array(15).fill('H'), ...Array(10).fill('O'), ...Array(10).fill('C'),'He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I']
const element = ['H','O','C','He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I']
let deck = [...elements, ...elements]

//　load materials
async function loadMaterials() {
    const response = await fetch('../compound/standard.json')
    const data = await response.json()
    if (!data.material || !Array.isArray(data.material)) {
        return []
    }
    return data.material
}
const materials = loadMaterials()


// main code
async function view_p2_hand() {
    const area = document.getElementById('p2_hand')
    p2_hand.forEach((elem, index) => {
        const image = document.createElement("img")
        image.src = `../images/${elementToNumber[elem]}.png`
        image.alt = elem
        image.style.width = `${WindowSize/12}px`
        image.style.padding = "10px"
        image.style.margin = "5px"
        image.style.border = "1px solid #000"
        image.classList.add("selected")
        image.addEventListener("click", function() {
            const button = document.getElementById("ron_button")
            button.style.display = "none"
            if (time == "make") {
                this.classList.toggle("selected")
                if (this.classList.contains("selected")){
                    this.style.border = "1px solid #000"
                    this.style.padding = "10px"
                    p2_selected_card.splice(p2_selected_card.indexOf(this.alt),1)
                } else {
                    this.style.border = "5px solid #F00"
                    this.style.padding = "6px"
                    p2_selected_card.push(this.alt)
                }}
            if (turn == "p2" && time == "game") {
                dropped_cards_p2.push(this.alt)
                const img = document.createElement("img")
                img.alt = this.alt
                img.src=`../images/${elementToNumber[this.alt]}.png`
                img.style.width = `${WindowSize/24}px`
                img.style.border = "1px solid #000"
                recordGameData(0,this.alt)
                document.getElementById("dropped_area_p2").appendChild(img)
                this.classList.remove("selected")
                this.classList.add("selected")
                let newElem = drawCard()
                this.src = `../images/${elementToNumber[newElem]}.png`
                this.alt = newElem
                this.style.width = `${WindowSize/12}px`
                this.style.padding = "10px"
                this.style.margin = "5px"
                this.style.border = "1px solid #000"
                p2_hand[index] = newElem
                turn = "p1"
                setTimeout(() => {p1_action()},500)
            }
        })
        area.appendChild(image)
    })
}

async function view_p1_hand() {
    const area = document.getElementById('p1_hand')
    p1_hand.forEach((elem, index) => {
        const image = document.createElement("img")
        image.src = `../images/0.png`
        image.alt = elem
        image.style.width = `${WindowSize/12}px`
        image.style.padding = "10px"
        image.style.margin = "5px"
        image.style.border = "1px solid #000"
        image.classList.add("selected")
        area.appendChild(image)
    })
}

async function search(components) {
    const materials = await loadMaterials();
    return materials.find(material => {
        for (const element in components) {
            if (!material.components[element] || material.components[element] !== components[element]) {
                return false;
            }
        }
        for (const element in material.components) {
            if (!components[element]) {
                return false;
            }
        }
        return true;
    }) || materials[0];
}

async function p1_make() {
    // console.log("P1はアガるための元素を選んでください。")
    // FIXME: ここに上がるための元素を選択するコードを実装（相手の元素の読みなどを含めて）

    // TODO: とりあえず最もポイントが高い元素を利用する / from AI.js
    const makeable_material = await search_materials(arrayToObj(p1_hand));

    // 作れる物質がない場合は "なし" を返す
    if (!makeable_material || makeable_material.length === 0) {
        return [{
            "name": "なし",
            "formula": "なし",
            "point": 0,
            "components": {},
            "advantageous": [],
            "number": 0
        }];
    }

    // ポイントが高い順にソート
    makeable_material.sort((a, b) => b.point - a.point);
    console.log(makeable_material);

    return makeable_material;
}

async function p2_make() {
    // ボタンの表示を変更
    document.getElementById("generate_button").style.display = "none";
    const button = document.getElementById("done_button");
    button.style.display = "inline";

    // ボタンクリックを待機
    return new Promise((resolve) => {
        button.addEventListener("click", function () {
            const p2_make_material = search(arrayToObj(p2_selected_card));
            resolve(p2_make_material)
        });
    });
}

async function get_dora() {
    return element[Math.round(Math.random()*23)]
}

async function done(who, isRon = false) {
    const p2_make_material = await p2_make();
    const p1_make_material = await p1_make();
    console.log(p2_make_material);
    recordGameData(1, p2_make_material.components);
    
    dora = await get_dora();
    console.log(`dora: ${dora}`);
    
    let thisGame_p2_point = p2_make_material.point;
    let thisGame_p1_point = p1_make_material[0].point;

    // 有利な生成物の場合のボーナス
    if (Boolean(p2_make_material.advantageous.includes(p1_make_material[0].formula))) {
        thisGame_p2_point *= (1.5 + Math.random() / 2);
    } else if (Boolean(p1_make_material[0].advantageous.includes(p2_make_material.formula))) {
        thisGame_p1_point *= (1.5 + Math.random() / 2);
    }

    // 役の中にドラが含まれる場合のボーナス
    if (Boolean(Object.keys(p2_make_material.components).includes(dora))) {
        thisGame_p2_point *= 1.5;
    } else if (Boolean(Object.keys(p1_make_material[0].components).includes(dora))) {
        thisGame_p1_point *= 1.5;
    }

    // **ロン時のボーナス**
    if (isRon) {
        thisGame_p2_point *= 2.25;
    }

    who == "p2" ? thisGame_p2_point /= 1.5 : thisGame_p1_point /= 1.5;

    // 小数点以下を四捨五入
    thisGame_p2_point = Math.round(thisGame_p2_point);
    thisGame_p1_point = Math.round(thisGame_p1_point);

    // 得点を更新
    p1_point += thisGame_p1_point;
    p2_point += thisGame_p2_point;

    // 画面に反映
    document.getElementById("p2_point").innerHTML += `+${thisGame_p2_point}`;
    document.getElementById("p1_point").innerHTML += `+${thisGame_p1_point}`;
    document.getElementById("p2_explain").innerHTML = `生成物質：${p2_make_material.name}, 組成式：${p2_make_material.formula}`;
    document.getElementById("p1_explain").innerHTML = `生成物質：${p1_make_material[0].name}, 組成式：${p1_make_material[0].formula}`;

    // 勝者判定
    const winner = await win_check();
    console.log(`winner: ${winner} (if no winner, then this properties are show "null".)`);
    
    document.getElementById("done_button").style.display = "none";
    const button = document.getElementById("nextButton");
    button.style.display = "inline";

    if (!winner) {
        console.log("次のゲーム");
        numTurn += 1;
        button.textContent = "次のゲーム";
        button.addEventListener("click", function () { resetGame();button.style.display = "none"});
    } else {
        console.log("ゲーム終了");
        button.textContent = "ラウンド終了";
        button.addEventListener("click", function () {
            localStorage.setItem("rate", `${rate + 10}`);
            p1_point = 0;
            p2_point = 0;
            numTurn = 0;
            resetGame();
            button.style.display = "none"
        });
    }
}

async function win_check() {
    return Math.abs(p1_point - p2_point) >= WIN_POINT ? p1_point>p2_point ? "p1": "p2" : numTurn >= WIN_TURN ? p1_point>p2_point ? "p1": "p2" : null
}

async function p1_exchange(targetElem) {
    // Select a random card index from p1_hand// TODO: from AI.js
    dropped_cards_p1.push(p1_hand[targetElem])
    var exchange_element = p1_hand[targetElem]
    console.log(exchange_element)
    // Ensure the target card exists and is valid
    if (!p1_hand[targetElem]) {
        console.error("Invalid target element in p1_hand.")
        return
    }
    // Create a new image for the dropped card area
    const newImg = document.createElement("img")
    newImg.src = `../images/${elementToNumber[p1_hand[targetElem]]}.png`
    newImg.style.width = `${WindowSize / 24}px`
    newImg.style.border = "1px solid #000"
    document.getElementById("dropped_area_p1").appendChild(newImg)
    // Update the player's hand with a new element
    const img = document.querySelectorAll("#p1_hand img")[targetElem]
    if (!img) {
        console.error("Image element not found in p1_hand.")
        return
    }
    // Select a new random element and replace the target card
    const newElem = drawCard()
    p1_hand[targetElem] = newElem
    // Update the image element's appearance
    img.src = `../images/0.png`
    img.alt = newElem
    img.style.width = `${WindowSize / 12}px`
    img.style.padding = "10px"
    img.style.margin = "5px"
    img.style.border = "1px solid #000"
    // Remove and reapply the 'selected' class to reset the state
    img.classList.remove("selected")
    img.classList.add("selected")
    // Switch the turn to "p1"
    turn = "p2"
    checkRon(exchange_element);
}

async function p1_action() {
    if (turn !== "p1" || p1_is_acting) {
        return;  // すでに行動中なら何もしない
    }
    p1_is_acting = true;  // 行動開始

    console.log(`P1のターン開始: ${turn}`);

    // Load materials data
    const materials = await loadMaterials();
    
    // フィルタリング
    const highPointMaterials = materials.filter(material => material.point > 50);
    
    // 最適な物質を選択
    const sortedMaterials = highPointMaterials.sort((a, b) => {
        let aMatchCount = Object.keys(a.components).reduce((count, elem) => count + Math.min(p1_hand.filter(e => e === elem).length, a.components[elem]), 0);
        let bMatchCount = Object.keys(b.components).reduce((count, elem) => count + Math.min(p1_hand.filter(e => e === elem).length, b.components[elem]), 0);
        return bMatchCount - aMatchCount || b.point - a.point;
    });

    const targetMaterial = sortedMaterials[0];

    if (!targetMaterial) {
        console.log("P1: 高得点の物質が見つからないため、交換します。");
        p1_exchange(Math.floor(Math.random() * p1_hand.length));
    } else {
        let canMake = true;
        for (const element in targetMaterial.components) {
            if (!p1_hand.includes(element) || p1_hand.filter(e => e === element).length < targetMaterial.components[element]) {
                canMake = false;
                break;
            }
        }

        if (canMake && targetMaterial.point > 50) {
            console.log(`P1: ${targetMaterial.name} を生成`);
            time = "make";
            await done("p1");
        } else {
            let unnecessaryCards = p1_hand.filter(e => {
                return !(e in targetMaterial.components) || p1_hand.filter(card => card === e).length > targetMaterial.components[e];
            });

            if (unnecessaryCards.length > 0) {
                let cardToExchange = unnecessaryCards[Math.floor(Math.random() * unnecessaryCards.length)];
                p1_exchange(p1_hand.indexOf(cardToExchange));
            } else {
                done("p1");
            }
        }
    }
    
    turn = "p2";  // `p1_action` が終了したらターンを `p2` に移す
    p1_is_acting = false;  // 行動終了
}



//便利系関数
function arrayToObj(array) {
    let result = {}
    array.forEach(item => {
        if (result[item]) {
            result[item]++
        } else {
            result[item] = 1
        }
    })
    return result
}

function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array
}

function drawCard() {
    return deck.length > 0 ? deck.pop() : done("no-draw")
}

async function search_materials(components) {
    const materials = await loadMaterials()
    return materials.filter(material => {
        for (const element in material.components) {
            if (!components[element] || material.components[element] > components[element]) {
                return false
            }
        }
        return true
    })
} // この関数は特徴量として使えそうかも

function random_hand() {
    for (let i = 0; i < card_num; i++) {
        p1_hand.push(drawCard())
        p2_hand.push(drawCard())
    }
}

document.getElementById("generate_button").addEventListener("click", function () {
    if (turn == "p2") {
        time = "make"
        const newRonButton = document.getElementById("ron_button");
        newRonButton.style.display = "none";
        done("p2")
    }
})

function resetGame() {
    p1_hand = [];
    p2_hand = [];
    dropped_cards_p1 = [];
    dropped_cards_p2 = [];
    p1_selected_card = [];
    p2_selected_card = [];
    time = "game";
    turn = Math.random() <= 0.5 ? "p1" : "p2";
    numTurn = 1;  // ターンカウントをリセット

    document.getElementById("p1_point").innerHTML = `ポイント：${p1_point}`;
    document.getElementById("p1_explain").innerHTML = "　";
    document.getElementById("p2_point").innerHTML = `ポイント：${p2_point}`;
    document.getElementById("p2_explain").innerHTML = "　";

    document.getElementById("generate_button").style.display = "inline";
    document.getElementById("done_button").style.display = "none";
    document.getElementById("nextButton").style.display = "none";

    deck = [...elements, ...elements];
    deck = shuffle(deck);

    document.getElementById("rate_area").innerHTML = `レート：${rate}`;

    const p1_hand_element = document.getElementById("p1_hand");
    const p2_hand_element = document.getElementById("p2_hand");
    p1_hand_element.innerHTML = "";
    p2_hand_element.innerHTML = "";

    const dropped_area_p1_element = document.getElementById("dropped_area_p1");
    const dropped_area_p2_element = document.getElementById("dropped_area_p2");
    dropped_area_p1_element.innerHTML = "";
    dropped_area_p2_element.innerHTML = "";

    random_hand();
    view_p1_hand();
    view_p2_hand();

    if (turn === "p1") {
        console.log("P1のターン開始");
        setTimeout(() => p1_action(), 500);  // `setTimeout` で 1回だけ `p1_action()` を実行
    }
}


document.addEventListener('DOMContentLoaded', function () {
    deck = [...elements, ...elements]
    deck = shuffle(deck)
    try {
        rate = Number(localStorage.getItem("rate"))
    } catch {
        rate = 0
    }
    document.getElementById("rate_area").innerHTML = `レート：${rate}`
    random_hand()
    view_p1_hand()
    view_p2_hand()
    turn = Math.random()>=0.5 ? "p1" : "p2"
    if (turn == "p1") {p1_action()}
})

function recordGameData(action,cards) {
    const dataEntry = {
        turn: numTurn,
        p2_hand: [...p2_hand],
        dropped_cards_p1: [...dropped_cards_p1],
        dropped_cards_p2: [...dropped_cards_p2],
        p1_point: p1_point,
        p2_point: p2_point,
        select_card: cards,
        rate:rate,
        action: action // 0: 交換, 1: 生成
    }
    collectedData.push(dataEntry)
}

function downloadGameData() {
    const jsonData = JSON.stringify(collectedData, null, 2)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "1.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

document.getElementById("dataDownload").addEventListener("click", function () {
    downloadGameData()
})

async function checkRon(droppedCard) {
    console.log(droppedCard);
    const possibleMaterials = await search_materials(arrayToObj([...p2_hand, droppedCard]));
    if (possibleMaterials.length > 0) {
        const ronButton = document.getElementById("ron_button");
        ronButton.style.display = "inline";

        // イベントリスナーが重複しないように一度削除
        ronButton.replaceWith(ronButton.cloneNode(true));
        const newRonButton = document.getElementById("ron_button");
        newRonButton.addEventListener("click", function () {
            newRonButton.style.display = "none";
            p2_selected_card = [droppedCard]; // 選択カードを更新
            time = "make";
            done("p2", true); // 「ロン」として完了
        });
    }
}
