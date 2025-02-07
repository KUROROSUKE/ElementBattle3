<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"        content="width=device-width, initial-scale=1.0, user-scalable=no">
    <link rel="shortcut icon"    href="https://kurorosuke.github.io/atom_game/favicon.ico" />
    <link rel="apple-touch-icon" href="https://kurorosuke.github.io/atom_game/touch-icon.png" sizes="180×180">
    <title>元素麻雀</title>
    <style>
        #p1_area {
            text-align: center;
        }
        #p2_area {
            text-align: center;
        }
        .buttons {
            width: 250px;
            height:60px;
        }
        #nextButton {
            display: none;
        }
        #done_button {
            display: none;
        }
        #ron_button {
            display: none;
        }
        .drop_area {
            left:200px;
            position:relative;
            width: 75%;
        }
        #startScreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('../images/start_screen.png') no-repeat center center;
            background-size: cover;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
            z-index: 100;
        }
        #startButton {
            padding: 15px 30px;
            font-size: 20px;
            cursor: pointer;
            background-color: rgba(255, 255, 255, 0.8);
            border: 2px solid black;
            border-radius: 10px;
        }
        #setting_icon {
            position: absolute;
            height: 6%;
            right: 5%;
            bottom: 5%;
            z-index: 101;
        }
        #winSettingsModal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border: 1px solid black;
            z-index: 102;
        }
        @media screen and (max-width: 959px) {
            /* タブレット */
        }
        @media screen and (max-width: 480px) {
            #winSettingsModal {
                left: 50%;
                width: 80%
            }
        }
        input[type="text"], input[type="number"], input[type="password"], input[type="email"] {
            width: 100%;  /* 横幅をデバイスに合わせる */
            min-width: 200px;  /* 最小幅を確保 */
            height: 48px;  /* 高さを確保 */
            font-size: 18px;  /* 文字を大きく */
            padding: 10px;  /* 余白を確保 */
            box-sizing: border-box;  /* padding を含めて計算 */
            border-radius: 5px;  /* 角を丸めてタップしやすく */
            border: 1px solid #ccc;  /* 境界線を設定 */
        }        
    </style>
    <script src="AI.js"></script>
</head>
<body>
    <div id="startScreen">
        <p id="startRate">レート: 0</p>
        <button id="startButton">スタート</button>
        <img src="../images/setting_icon.png" id="setting_icon">
    </div>
    <div id="p1_area" style="display: none;">
        <p id="p1_point">ポイント：0</p>
        <p id="p1_explain">　</p>
        <div id="p1_hand"></div>
    </div>
    <div id="dropped_area_p1" class="drop_area" style="display: none;"></div>
    <hr style="border: 2px solid black; margin: 20px 0; display: none;">
    <div id="dropped_area_p2" class="drop_area" style="display: none;"></div>
    <div id="p2_area" style="display: none;">
        <div id="p2_hand"></div>
        <p id="p2_point">ポイント：0</p>
        <p id="p2_explain">　</p>
        <button class="buttons" id="generate_button">ツモ</button>
        <button class="buttons" id="done_button">この役でアガる</button>
        <button class="buttons" id="nextButton"></button>
        <button class="buttons" id="ron_button">ロン</button>
    </div>
    <p id="rate_area" style="display: none;">レート：</p>
    <button id="dataDownload" style="display: none;">Data Download</button>
    <script src="game.js"></script>
    <div id="winSettingsModal">
        <label>WIN_POINT: <input type="number" id="winPointInput" value=250></label><br>
        <label>WIN_TURN: <input type="number" id="winTurnInput" value=10></label><br>
        <button onclick="saveWinSettings()">完了</button>
        <button onclick="closeWinSettings()">キャンセル</button>
    </div>
    <script>
        function returnToStartScreen() {
            document.getElementById("startScreen").style.display = "flex";
            document.getElementById("p1_area").style.display = "none";
            document.getElementById("dropped_area_p1").style.display = "none";
            document.getElementById("dropped_area_p2").style.display = "none";
            document.getElementById("p2_area").style.display = "none";
            document.getElementById("rate_area").style.display = "none";
            document.getElementById("dataDownload").style.display = "none";
            document.getElementById("startRate").textContent = "レート: " + document.getElementById("rate_area").textContent.replace("レート：", "");
        }
        document.getElementById("startButton").addEventListener("click", function() {
            document.getElementById("startScreen").style.display = "none";
            document.getElementById("p1_area").style.display = "block";
            document.getElementById("dropped_area_p1").style.display = "block";
            document.getElementById("dropped_area_p2").style.display = "block";
            document.getElementById("p2_area").style.display = "block";
            document.getElementById("rate_area").style.display = "block";
            document.getElementById("dataDownload").style.display = "block";
        });
    </script>
</body>
</html>
