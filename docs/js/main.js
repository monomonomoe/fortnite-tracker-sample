window.onload = (() => {
    'use strict';

    /**
     * 学生さんへ
     * こんなコードまねしちゃ駄目だぞ。
     * 
     * エンジニアさんへ
     * 普段はもうちょっとしっかりしたコード書いてます！
     * コメントうざいくらい書いてます！サーバーサイドの人間なんです！許してください！
     * お仕事ください！
     */
    

    const urlUserMetaAPI = 'https://fortnite-public-api.theapinetwork.com/prod09/users/id';
    const urlUserStatusAPI = 'https://fortnite-public-api.theapinetwork.com/prod09/users/public/br_stats_v2';
    
    const tweetURL = 'https://twitter.com/intent/tweet';
    const tweetOptions = '&url=https://monomonomoe.github.io/fortnite-tracker-sample/';
    
    const buttonStart = document.querySelector('#start');
    const textUserName = document.querySelector('#user_name');
    const textUserId = document.querySelector('#user_id');
    const result = document.querySelector('#result');
    const message = document.querySelector('#message');
    const playstyle = document.querySelector('#playstyle');

    const twitter_listdocument = document.querySelector("#twitter_list");
    const twitter_solo = document.querySelector("#twitter-solo");
    const twitter_duo = document.querySelector("#twitter-duo");
    const twitter_squad = document.querySelector("#twitter-squad");

    buttonStart.addEventListener('click', () => {
        if (!validation()) return false;
        message.innerHTML = '';
        result.innerHTML = '';
        twitter_listdocument.style.display = "none";
        if (textUserId.value == '') {
            getUserMeta(textUserName.value);
        } else {
            getUserStatus(textUserId.value);
        }
    })

    const getUserMeta = (userName) => {
        const url = `${urlUserMetaAPI}?username=${userName}`
        console.log(url);
        fetch(url)
            .then((res) => {
                return res.json();
            }).then((json) => {
                if (json.error == true) {
                    let text;
                    text = `入力いただいたユーザ名から情報が取れませんでした…` + `</br>`;
                    text += `</br>`;
                    text += `ユーザ名は正しく入力されていますか？半角全角は正しいですか？IDに記号とか特殊な文字が入ってたりしますか？` + `</br>`;
                    text += `※正しく打ち込んでいてもダメな人もいるみたいです…おのれエピック…` + `</br>`;
                    text += `</br>`;
                    text += `英語読める人用にエラーメッセージ出しておくね。` + `</br>`;
                    text += `エラーコード:${json.errorCode}` + `</br>`;
                    text += `エラー詳細:${json.errorMessage}` + `</br>`;
                    message.innerHTML = text;
                    message.appendChild(createHr());
                } else {
                    console.log(json);
                    getUserStatus(json.uid);
                }
            }).catch( (err) => {
                console.log(err);
        });
    };

    const getUserStatus = (uid) => {
        const url = `${urlUserStatusAPI}?user_id=${uid}`
        console.log(url);
        fetch(url)
            .then((res) => {
                return res.json();
            }).then((json) => {
                if (json.error) {
                    let text;
                    text = `ユーザ情報の取得はできたんだけど戦績は取得できませんでした…` + `</br>`;
                    text += `おのれEpicGames` + `</br>`;
                    text += `</br>`;
                    text += `英語詳しい人用にエラーメッセージ出しておくね。` + `</br>`;
                    text += `エラーコード:${json.error.code}` + `</br>`;
                    text += `エラー詳細:${json.error.msg}` + `</br>`;
                    message.innerHTML = text;
                    result.appendChild(createHr());

                } else {
                    console.log(json);
                    setData(json);
                }
            }).catch( (err) => {
                console.log(err);
        });
    }

    const setData = (json) => {
        let data;
        if (playstyle.value == 'gamepad') {
            data = json.data.gamepad;
        } else if (playstyle.value == 'keyboardmouse') {
            data = json.data.keyboardmouse;
        } else if (playstyle.value == 'touch') {
            data = json.data.touch;
        };
        if (!data) { return setMessage('選んだ端末での戦闘データが無いみたいです…'); }
        createSoloData(data);
        createDuoData(data);
        createSquadData(data);
        twitter_listdocument.style.display = "block";
    }
    
    const createSoloData = (data) => {
        let div = createDiv('solo');
        div.appendChild(createH2('ソロ'));
        if (data.defaultsolo) {
            div = createDivRuleData(div, data.defaultsolo.default);
            twitter_solo.href = createTweetURL(data.defaultsolo.default, 'ソロ');
        } else {
            div.appendChild(createP('ソロの戦闘データがありません。'));
        }
        result.appendChild(div);
    }
    
    const createDuoData = (data) => {
        let div = createDiv('duo');
        div.appendChild(createH2('デュオ'));
        if (data.defaultduo) {
            div = createDivRuleData(div, data.defaultduo.default);
            twitter_duo.href = createTweetURL(data.defaultduo.default, 'デュオ');
        } else {
            div.appendChild(createP('デュオの戦闘データがありません。'));
        }
        result.appendChild(div);
    }
    
    const createSquadData = (data) => {
        let div = createDiv('squad');
        div.appendChild(createH2('スクアッド'));
        if (data.defaultsquad) {
            div = createDivRuleData(div, data.defaultsquad.default);
            twitter_squad.href = createTweetURL(data.defaultsquad.default, 'スクアッド');
        } else {
            div.appendChild(createP('スクアッドの戦闘データがありません。'));
        }
        result.appendChild(div);
    }

    const createDivRuleData = (div, json) => {
        // データない場合はnullとかかえってくるので0を入れてあげる
        const matchesplayed = json.matchesplayed ? json.matchesplayed : 0;
        const placetop1 = json.placetop1 ? json.placetop1 : 0;
        const kills = json.kills ? json.kills : 0;
        const killsDeath = roundSecondDecimal(kills / (matchesplayed - placetop1));
        const killsGame = roundSecondDecimal(kills / matchesplayed);
        // 結果を生成
        div.appendChild(createP('プレイ数 : ' + matchesplayed));
        div.appendChild(createP('ビクロイ数 : ' + placetop1));
        div.appendChild(createP('キル数 : ' + kills));
        div.appendChild(createP('キル/デス比 : ' + killsDeath));
        div.appendChild(createP('キル/ゲーム比 : ' + killsGame));
        div.appendChild(createHr());
        return div;
    }

    const createTweetURL = (json, rule) => {
        const matchesplayed = json.matchesplayed ? json.matchesplayed : 0;
        const placetop1 = json.placetop1 ? json.placetop1 : 0;
        const kills = json.kills ? json.kills : 0;
        const killsDeath = roundSecondDecimal(kills / (matchesplayed - placetop1));
        const killsGame = roundSecondDecimal(kills / matchesplayed);
        let tweetText = `?text=`;
        tweetText += `${rule}の戦績です！` + `%0a`;
        tweetText += `プレイ数%20:%20` + matchesplayed + `%0a`;
        tweetText += `ビクロイ数%20:%20` + placetop1 + `%0a`;
        tweetText += `キル数%20:%20` + kills + `%0a`;
        tweetText += `キル/デス比%20:%20` + killsDeath + `%0a`;
        tweetText += `キル/ゲーム比%20:%20` + killsGame + `%0a`;
        console.log( tweetURL + tweetText + tweetOptions);
        return tweetURL + tweetText + tweetOptions;
    }

    const createDiv = (id) => {
        const div = document.createElement('div');
        div.id = 'result_' + id;
        div.className = 'result_list'
        return div;
    }

    const createP = (msg) => {
        const p = document.createElement('p');
        p.textContent = msg;
        return p;
    }

    const createH2 = (msg) => {
        const h2 = document.createElement('h2');
        h2.textContent = msg;
        return h2;
    }

    const createHr = () => {
        const Hr = document.createElement('Hr');
        return Hr;
    }

    const setMessage = (msg) => {
        const text = msg + '</br>';
        message.innerHTML = text;
        result.appendChild(createHr());
        return;
    }
    
    const roundSecondDecimal = (number) => {
        return Math.round(number * 100) / 100;
    }

    /**
     * 入力チェックを行う。
     * 問題があった場合はalert出してfalseを返す
     * @return boolean
     */
    const validation = () => {
        if (textUserName.value == '' && textUserId.value == '') return errorAlert('ユーザ名またはepicアカウントIDを入力してください');
        if (playstyle.value == '') return errorAlert('端末を選択してください');
        return true;
    }

    const errorAlert = (msg) => {
        alert(msg);
        return false;
    }
    getUserStatus('38b70dd013154afea2df409ae71abb8f');
});
