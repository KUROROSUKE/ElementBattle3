let p1_hand = []; let p2_hand = []
let p1_point = 0; let p2_point = 0
let p1_selected_card = []; let p2_selected_card = []

const card_num = 8
const WIN_POINT = card_num*30+10
const WIN_TURN = 10

let droped_cards_p1 = []; let droped_cards_p2 = []

let turn = "p1"
let time = "game"
let numTurn = 1

const WindowSize = window.innerWidth
const elementToNumber = {"H": 1, "He": 2, "Li": 3, "Be": 4, "B": 5, "C": 6, "N": 7, "O": 8, "F": 9, "Ne": 10,"Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 15, "S": 16, "Cl": 17, "Ar": 18, "K": 19, "Ca": 20,"Fe": 26, "Cu": 29, "Zn": 30, "I": 53}
const elements = [...Array(30).fill('H'), ...Array(25).fill('O'), ...Array(20).fill('C'),'He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I']
const element = ['H','O','C','He', 'Li', 'Be', 'B', 'N', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca','Fe', 'Cu', 'Zn', 'I']

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
                droped_cards_p2.push(this.alt)
                const img = document.createElement("img")
                img.alt = this.alt
                img.src=`../images/${elementToNumber[this.alt]}.png`
                img.style.width = `${WindowSize/24}px`
                img.style.border = "1px solid #000"
                document.getElementById("droped_area_p2").appendChild(img)
                this.classList.remove("selected")
                this.classList.add("selected")
                let newElem = elements[Math.floor(Math.random()*(elements.length-1))]
                this.src = `../images/${elementToNumber[newElem]}.png`
                this.alt = newElem
                this.style.width = `${WindowSize/12}px`
                this.style.padding = "10px"
                this.style.margin = "5px"
                this.style.border = "1px solid #000"
                p2_hand[index] = newElem
                turn = "p1"
                setTimeout(() => {p1_exchange()},500)
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
    const materials = await loadMaterials()
    return materials.filter(material => {
        for (const element in components) {
            if (!material.components[element] || material.components[element] !== components[element]) {
                return false
            }
        }
        for (const element in material.components) {
            if (!components[element]) {
                return false
            }
        }
        return true
    })
}

async function p1_make() {
    //console.log("P1はアガるための元素を選んでください。")
    //FIXME:ここに上がるための元素を選択するコードを実装（相手の元素の読みなどを含めて）

    //return [返す元素のデータ]
    return materials.then(array => {return array[1]})
}

async function p2_make() {
    // ボタンの表示を変更
    document.getElementById("generate_button").style.display = "none"
    const button = document.getElementById("done_button")
    button.style.display = "inline"
    // ボタンクリックを待機
    return new Promise((resolve) => {
        button.addEventListener("click", function () {
            const p2_make_material = search(arrayToObj(p2_selected_card))
            resolve(p2_make_material) // ボタンクリック後にデータを返す
        })
    })
}

async function get_dora() {
    return element[Math.round(Math.random()*23)]
}

async function done() {
    const p2_make_material = await p2_make()
    const p1_make_material = await p1_make()
    console.log(p2_make_material[0])
    dora = await get_dora()
    console.log(`dora: ${dora}`)
    let thisGame_p2_point = p2_make_material[0].point
    let thisGame_p1_point = p1_make_material.point
    // if you're material has advantage, you get more point
    if (Boolean(p2_make_material[0].advantageous.includes(p1_make_material.formula))) {
        thisGame_p2_point = thisGame_p2_point*(1.5+Math.random()/2)
    } else if (Boolean(p1_make_material.advantageous.includes(p2_make_material[0].formula))) {
        thisGame_p1_point = thisGame_p1_point*(1.5+Math.random()/2)
    }
    // if you're material's elements include dora, you get more point
    if (Boolean(Object.keys(p2_make_material[0].components).includes(dora))) {
        thisGame_p2_point = thisGame_p2_point*1.5
    } else if (Boolean(Object.keys(p1_make_material.components).includes(dora))) {
        thisGame_p1_point = thisGame_p1_point*1.5
    }
    // after multipulication, the value often float number, so round to integer.
    p2_point += Math.round(thisGame_p2_point)
    p1_point += Math.round(thisGame_p1_point)
    document.getElementById("p2_point").innerHTML = `ポイント：${p2_point}`
    document.getElementById("p1_point").innerHTML = `ポイント：${p1_point}`
    document.getElementById("p2_explain").innerHTML = `生成物質：${p2_make_material[0].name}`
    document.getElementById("p1_explain").innerHTML = `生成物質：${p1_make_material.name}`
    // win check.
    winner = await win_check()
    console.log(`winner: ${winner} (if no winner, then this properties are show "null".)`)
    document.getElementById("done_button").style.display = "none"
    const button = document.getElementById("nextButton")
    button.style.display = "inline"
    if (!winner) {
        console.log("次のゲーム")
        numTurn += 1
        button.textContent = "次のゲーム"
        button.addEventListener("click", function () {resetGame()})
    } else {
        console.log("ゲーム終了")
        button.textContent = "ラウンド終了"
        button.addEventListener("click", function () {console.log("ラウンド終了")})
    }
}

async function win_check() {
    return Math.abs(p1_point - p2_point) >= WIN_POINT ? p1_point>p2_point ? "p1": "p2" : numTurn >= WIN_TURN ? p1_point>p2_point ? "p1": "p2" : null
}

async function p1_exchange() {
    // Select a random card index from p1_hand
    const targetElem = Math.floor(Math.random() * p1_hand.length)
    droped_cards_p1.push(p1_hand[targetElem])
    // Ensure the target card exists and is valid
    if (!p1_hand[targetElem]) {
        console.error("Invalid target element in p1_hand.")
        return
    }
    // Create a new image for the dropped card area
    const newimg = document.createElement("img")
    newimg.src = `../images/${elementToNumber[p1_hand[targetElem]]}.png`
    newimg.style.width = `${WindowSize / 24}px`
    newimg.style.border = "1px solid #000"
    document.getElementById("droped_area_p1").appendChild(newimg)
    // Update the player's hand with a new element
    const img = document.querySelectorAll("#p1_hand img")[targetElem]
    if (!img) {
        console.error("Image element not found in p1_hand.")
        return
    }
    // Select a new random element and replace the target card
    const newElem = elements[Math.floor(Math.random() * (elements.length-1))]
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

function objToArray(obj) {
    let result = []
    for (const [key, value] of Object.entries(obj)) {
        for (let i = 0; i < value; i++) {
            result.push(key)
        }
    }
    return result
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
    for (let i=0;i<card_num;i++){
        p1_hand.push(elements[Math.round(Math.random()*95)])
        p2_hand.push(elements[Math.round(Math.random()*95)])
    }
}

document.getElementById("generate_button").addEventListener("click", function () {
    if (turn == "p2") {
        time = "make"
        done()
    }
})

function resetGame() {
    p1_hand = []; p2_hand = []; droped_cards_p1 = []; droped_cards_p2 = []; p1_selected_card = []; p2_selected_card = []
    time = "game"
    document.getElementById("p1_point").innerHTML = "ポイント："
    document.getElementById("p1_explain").innerHTML = "　"
    document.getElementById("p2_point").innerHTML = "ポイント："
    document.getElementById("p2_explain").innerHTML = "　"
    let p1_hand_element = document.getElementById("p1_hand")
    while (p1_hand_element.firstChild) {p1_hand_element.removeChild(p1_hand_element.firstChild)}
    let droped_area_p1_element = document.getElementById("droped_area_p1")
    while (droped_area_p1_element.firstChild) {droped_area_p1_element.removeChild(droped_area_p1_element.firstChild)}
    let p2_hand_element = document.getElementById("p2_hand")
    while (p2_hand_element.firstChild) {p2_hand_element.removeChild(p2_hand_element.firstChild)}
    let droped_area_p2_element = document.getElementById("droped_area_p2")
    while (droped_area_p2_element.firstChild) {droped_area_p2_element.removeChild(droped_area_p2_element.firstChild)}
    document.getElementById("generate_button").style.display = "inline"
    document.getElementById("done_button").style.display = "none"
    document.getElementById("nextButton").style.display = "none"
    random_hand()
    view_p1_hand()
    view_p2_hand()
}

document.addEventListener('DOMContentLoaded', function () {
    random_hand()
    view_p1_hand()
    view_p2_hand()
    turn = Math.random()>=0.5 ? "p1" : "p2"
    if (turn == "p1") { p1_exchange()}
})
