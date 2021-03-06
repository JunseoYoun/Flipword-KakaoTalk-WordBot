// 카카오톡 모듈
module.exports = function(app, fs) {
    // 키보드
    app.get('/keyboard', function(req, res) {
        fs.readFile(__dirname + "/../data/" + "keyboard.json", 'utf8', function(err, data) {
            // console.log(data);
            res.end(data);
        });
    });

    // 메시지
    app.post('/message', function(req, res) {
        var result = {};
        // CHECK REQ VALIDITY
        if (!req.body["user_key"] || !req.body["type"] || !req.body["content"]) {
            result["success"] = 0;
            result["error"] = "invalid request";
            res.json(result);
            return;
        }

        if (req.body["content"] == "도움말" || req.body["content"] == "만든이") {
            fs.readFile(__dirname + "/../data/message.json", 'utf8', function(err, data) {
                var messages = JSON.parse(data);
                if (req.body["content"] == "도움말") {
                    messages["message"] = {
                        "text": "영어단어를 입력하시면 뜻이 표시됩니다."
                    };
                } else {
                    messages["message"] = {
                        "text": "slopcat99.dothome.co.kr에서 개발하였습니다."
                    };
                }

                fs.writeFile(__dirname + "/../data/message.json", JSON.stringify(messages, null, '\t'), "utf8", function(err, data) {})
                fs.readFile(__dirname + "/../data/message.json", 'utf8', function(err, data) {
                    // console.log("Request_user_key : " + req.body["user_key"]);
                    // console.log("Request_type : keyboard - " + req.body["content"]);
                    res.end(data);
                    return;
                })
            })
        } else {
            // 단어 파싱
            var request = require('request');
            var cheerio = require("cheerio");
            var str = req.body["content"];
            var check = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
            var chk_han = str.match(check);;
            var url = "";

            //if (!chk_han) {
            url = 'http://alldic.daum.net/search.do?q=' + str;
            //} else {
            //    url = 'http://dic.daum.net/search.do?q=' + str + '&dic=eng';
            //}

            fs.readFile(__dirname + "/../data/message.json", 'utf8', function(err, data) {
                var messages = JSON.parse(data);
                request(url, function(error, response, body) {
                    var $ = cheerio.load(body);
                    var wordpage = $("#mArticle div.cleanword_type.kuke_type").first();
                    // var word = wordpage.find("div.search_cleanword strong a span").text();
                    var meanUl = $("ul.list_search").first();
                    var meanLi = $(meanUl).find("li");
                    var meanArray = "";
                    meanLi.each(function() {
                        var num = $(this).find("li > span.num_search").text();
                        var en_mean = $(this).find("li > span.txt_search").text();
                        meanArray += num + en_mean + " ";
                    });

                    messages["message"] = {
                        "text": meanArray.toString()
                    };

                    fs.writeFile(__dirname + "/../data/message.json", JSON.stringify(messages, null, '\t'), "utf8", function(err, data) {})
                    fs.readFile(__dirname + "/../data/message.json", 'utf8', function(err, data) {
                        res.end(data);
                        return;
                    })
                });
            })
        }
    });

    // 친구추가
    app.post('/friend', function(req, res) {
        var result = {};

        // 요청 param 체크
        if (!req.body["user_key"]) {
            result["success"] = 0;
            result["error"] = "invalid request";
            res.json(result);
            return;
        }

        // 파일 입출력
        fs.readFile(__dirname + "/../data/friend.json", 'utf8', function(err, data) {
            var users = JSON.parse(data);
            // 이미 존재하는 친구일 경우
            if (users[req.body["user_key"]]) {
                result["success"] = 0;
                result["error"] = "duplicate";
                res.json(result);
                return;
            }

            // 친구추가
            users[req.body["user_key"]] = req.body;
            fs.writeFile(__dirname + "/../data/friend.json",
                JSON.stringify(users, null, '\t'), "utf8",
                function(err, data) {
                    result = 200;
                    res.json(result);
                    return;
                })
        })
    });

    // 친구삭제(차단)
    app.delete('/friend/:user_key', function(req, res) {
        var result = {};

        // 파일 입출력
        fs.readFile(__dirname + "/../data/friend.json", "utf8", function(err, data) {
            var users = JSON.parse(data);

            // 존재하지 않는 친구일 경우
            if (!users[req.params.user_key]) {
                result["success"] = 0;
                result["error"] = "not found";
                res.json(result);
                return;
            }
            // 친구 삭제
            delete users[req.params.user_key];
            fs.writeFile(__dirname + "/../data/friend.json",
                JSON.stringify(users, null, '\t'), "utf8",
                function(err, data) {
                    result = 200;
                    res.json(result);
                    return;
                })
        })
    })

    // 채팅방 나가기
    app.delete('/chat_room/:user_key', function(req, res) {
        var result = {};
        result = 200;
        res.json(result);
        return;
    })
}
