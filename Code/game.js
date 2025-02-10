let p1_hand = []; let p2_hand = []
let p1_point = 0; let p2_point = 0
let p1_selected_card = []; let p2_selected_card = []

const card_num = 8
let WIN_POINT = card_num*30+10
let WIN_TURN = 10

let dropped_cards_p1 = []; let dropped_cards_p2 = []

let turn = "p1"
let time = "game"
let numTurn = 1
let p1_is_acting = false

const WindowSize = window.innerWidth
const elementToNumber = {"H": 1, "He": 2, "Li": 3, "Be": 4, "B": 5, "C": 6, "N": 7, "O": 8, "F": 9, "Ne": 10,"Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 15, "S": 16, "Cl": 17, "Ar": 18, "K": 19, "Ca": 20,"Fe": 26, "Cu": 29, "Zn": 30, "I": 53}
const elements = [...Array(6).fill('H'), ...Array(4).fill('O'), ...Array(4).fill('C'),'He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I']
const element = ['H','O','C','He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I']
let deck = [...elements, ...elements]
let materials = []
let imageCache = {}

//　load materials
async function loadMaterials() {
    const response = await fetch('../compound/standard.json')
    const data = await response.json()
    if (!data.material || !Array.isArray(data.material)) {
        return []
    }
    return data.material
}


// main code
async function view_p2_hand() {
    const area = document.getElementById('p2_hand')
    p2_hand.forEach((elem, index) => {
        const image = document.createElement("img")
        image.src = imageCache[elementToNumber[elem]].src
        image.alt = elem
        image.style.width = `${WindowSize/15}px`
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
                img.src = imageCache[elementToNumber[this.alt]].src
                img.style.width = `${WindowSize/24}px`
                img.style.border = "1px solid #000"
                document.getElementById("dropped_area_p2").appendChild(img)
                this.classList.remove("selected")
                this.classList.add("selected")
                let newElem = drawCard()
                this.src = imageCache[elementToNumber[newElem]].src
                this.alt = newElem
                this.style.width = `${WindowSize/15}px`
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
        image.src = imageCache[0].src
        image.alt = "相手の手札"
        image.style.width = `${WindowSize/15}px`
        image.style.padding = "10px"
        image.style.margin = "5px"
        image.style.border = "1px solid #000"
        image.classList.add("selected")
        area.appendChild(image)
    })
}

async function search(components) {
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

    return makeable_material;
}

async function p2_make() {
    // ボタンの表示を変更
    document.getElementById("generate_button").style.display = "none";
    const button = document.getElementById("done_button");
    button.style.display = "inline";

    // 以前のイベントリスナーを削除
    button.replaceWith(button.cloneNode(true));
    const newButton = document.getElementById("done_button");

    // ボタンクリックを待機
    return new Promise((resolve) => {
        newButton.addEventListener("click", function () {
            const p2_make_material = search(arrayToObj(p2_selected_card));
            resolve(p2_make_material);
        });
    });
}


async function get_dora() {
    return element[Math.round(Math.random()*23)]
}

async function done(who, isRon = false) {
    const p2_make_material = await p2_make();
    const p1_make_material = await p1_make();
    
    dora = await get_dora();
    console.log(`ドラ: ${dora}`);
    
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
        who == "p2" ? thisGame_p2_point /= 1.2 : thisGame_p1_point /= 1.2
    }

    who == "p2" ? thisGame_p1_point /= 1.5 : thisGame_p2_point /= 1.5;

    // 小数点以下を四捨五入
    thisGame_p2_point = Math.round(thisGame_p2_point);
    thisGame_p1_point = Math.round(thisGame_p1_point);

    // 得点を更新
    p1_point += await thisGame_p1_point;
    p2_point += await thisGame_p2_point;

    // 画面に反映
    document.getElementById("p2_point").innerHTML += `+${thisGame_p2_point}`;
    document.getElementById("p1_point").innerHTML += `+${thisGame_p1_point}`;
    document.getElementById("p2_explain").innerHTML = `生成物質：${p2_make_material.name}, 組成式：${p2_make_material.formula}`;
    document.getElementById("p1_explain").innerHTML = `生成物質：${p1_make_material[0].name}, 組成式：${p1_make_material[0].formula}`;

    //updateGeneratedMaterials(p2_make_material.name); //ここは、もしかしたらAI作成に使えるかも

    // 勝者判定
    const winner = await win_check();
    
    document.getElementById("done_button").style.display = "none";
    const button = document.getElementById("nextButton");
    button.style.display = "inline";

    if (!winner) {
        console.log("次のゲーム");
        numTurn += 1;
        button.textContent = "次のゲーム";
        button.addEventListener("click", function () {
            resetGame();
            button.style.display = "none"
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
    } else {
        console.log("ゲーム終了");
        button.textContent = "ラウンド終了";
        button.addEventListener("click", function () {
            returnToStartScreen()
            p1_point = 0;
            p2_point = 0;
            numTurn = 0;
            resetGame();
            button.style.display = "none"
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
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
    // Ensure the target card exists and is valid
    if (!p1_hand[targetElem]) {
        console.error("Invalid target element in p1_hand.")
        return
    }
    // Create a new image for the dropped card area
    const newImg = document.createElement("img")
    newImg.src = imageCache[elementToNumber[p1_hand[targetElem]]].src
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
    img.src = imageCache[0].src
    img.alt = newElem
    img.style.width = `${WindowSize / 15}px`
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
                time = "make"
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
    return deck.length > 0 ? deck.pop() : (time = "make", done("no-draw"));
}

async function search_materials(components) {
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
        //findMostPointMaterial()
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
        setTimeout(() => p1_action(), 500);  // `setTimeout` で 1回だけ `p1_action()` を実行
    }
}

function preloadImages() {
    let imageNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 30, 53];

    imageNumbers.forEach(num => {
        let img = new Image();
        img.src = `../images/${num}.png`;
        imageCache[num] = img; // キャッシュに保存
    });

    console.log("画像プリロード完了", imageCache);
}

async function init_json() {
    materials = await loadMaterials()
}

document.addEventListener('DOMContentLoaded', function () {
    preloadImages()
    init_json()
    deck = [...elements, ...elements]
    deck = shuffle(deck)
    random_hand()
    view_p1_hand()
    view_p2_hand()
    turn = Math.random()>=0.5 ? "p1" : "p2"
    if (turn == "p1") {p1_action()}
})

async function checkRon(droppedCard) {
    // P2のロン判定
    const possibleMaterialsP2 = await search_materials(arrayToObj([...p2_hand, droppedCard]));
    if (possibleMaterialsP2.length > 0) {
        const ronButton = document.getElementById("ron_button");
        ronButton.style.display = "inline";
        ronButton.replaceWith(ronButton.cloneNode(true));  // 古いイベントリスナーを削除
        const newRonButton = document.getElementById("ron_button");

        newRonButton.addEventListener("click", function () {
            newRonButton.style.display = "none";
            p2_selected_card = [droppedCard];
            time = "make";
            done("p2", true);
        });
    }

    // P1のロン判定（捨てられたカードを含める）
    const possibleMaterialsP1 = await search_materials(arrayToObj([...p1_hand, droppedCard]));
    const highPointMaterialsP1 = possibleMaterialsP1.filter(material => material.point >= 70);

    if (highPointMaterialsP1.length > 0) {
        // **P1の手札に捨てたカードがもうない可能性があるため、戻す**
        p1_hand.push(droppedCard);
        
        // P1のロン処理のため、ロンに使うカードを選択
        p1_selected_card = [droppedCard];

        // `time` を "make" に変更
        time = "make";

        // P1のロン処理を実行
        done("p1", true);
    }
}

function updateGeneratedMaterials(materialName) {
    if (!materialName || materialName === "なし") return;

    // LocalStorage からデータを取得（なければ空のオブジェクト）
    let generatedMaterials = JSON.parse(localStorage.getItem("generatedMaterials")) || {};

    // 物質のカウントを更新
    if (generatedMaterials[materialName]) {
        generatedMaterials[materialName] += 1;
    } else {
        generatedMaterials[materialName] = 1;
    }

    // LocalStorage に保存
    localStorage.setItem("generatedMaterials", JSON.stringify(generatedMaterials));
}

function showRules() {
    alert("【ゲームの遊び方】\n" +
        "1. 手札の元素を使って化合物を作ろう！\n" +
        "2. 交換したい場合は、クリックしてカードを捨てよう。\n" +
        "3. 生成できる化合物があれば、「ツモ」または「ロン」ボタンを押して作ろう！\n" +
        "4. 相手と250ポイント以上の差がつくか、10ゲームが終わった時点でポイントの多い方が勝利！\n" +
        "【補足説明】\n" + 
        "「ツモ」は自分の手札だけで化合物を作成すること、「ロン」は相手が最後に捨てたカードも利用して化合物を作成すること。\n" + 
        "ドラも実装されています。（ドラのカードが含まれていたらポイント1.5倍）\n" + 
        "勝利条件のポイント差やゲーム数は、設定（右下）から変えられる。");
}

document.getElementById("setting_icon").addEventListener("click", function() {
    document.getElementById("winSettingsModal").style.display = "inline"
})

// クリック時にモーダルを表示
function openWinSettings() {
    document.getElementById("winSettingsModal").style.display = "block";
}

// 入力された値を取得し変数に設定
function saveWinSettings() {
    let winPointInput = parseInt(document.getElementById("winPointInput").value, 10);
    let winTurnInput = parseInt(document.getElementById("winTurnInput").value, 10);

    if (isNaN(winPointInput) || winPointInput < 1) {
        alert("WIN_POINT は 1 以上の数値を入力してください。");
        return;
    }
    if (isNaN(winPointInput) || winPointInput > 999) {
        alert("WIN_POINT の最大値は 999 です。");
        return;
    }
    if (isNaN(winTurnInput) || winTurnInput < 1) {
        alert("WIN_TURN は 1 以上の数値を入力してください。");
        return;
    }

    WIN_POINT = winPointInput;
    WIN_TURN = winTurnInput;
    closeWinSettings();
}

// モーダルを閉じる
function closeWinSettings() {
    document.getElementById("winSettingsModal").style.display = "none";
}

async function findMostPointMaterial() {
    const possibleMaterials = await search_materials(arrayToObj(p2_hand)); // p2_hand で作れる物質を検索
    
    if (possibleMaterials.length === 0) {
        console.log("p2_hand 内で作成可能な物質はありません。");
    } else {
        const highestMaterial = possibleMaterials.reduce((max, material) => 
            material.point > max.point ? material : max, possibleMaterials[0]);
        console.log(`p2_hand 内で最もポイントが高い物質: ${highestMaterial.name} (ポイント: ${highestMaterial.point})`);
    }
}

let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    let now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();  // ダブルタップを無効化
    }
    lastTouchEnd = now;
}, false);
