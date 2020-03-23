// 백엔드 시작점.
const express = require('express') // express 모듈 가져옴
const app = express(); // 새로운 express 앱을 만듬
const port = 5000; // 포트 설정
const bodyParser = require('body-parser'); // Body 데이터를 분석(parse)해서 req.body로 출력해주는 것
const { User } = require('./models/User'); // 유저모델 가져오기
const config = require('./config/key'); // mongoURI 가져오기
const { auth } = require('./middleware/auth'); // auth 미들웨어 가져오기

// aplication/json
app.use(bodyParser.json());

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended : true}));

const mongoose = require('mongoose'); // 몽고DB 모듈 가져옴
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false // 오류 막기 위함
}).then(() => console.log('MongoDB connected...')).catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello wolrd!')); // 루트 디렉토리로 오면 Hello world 출력

app.post('/api/users/register', (req, res) => {

    // 회원가입 할때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터베이스에 넣어준다.

    // req.body는 JSON 형태
    const user = new User(req.body); // 유저 인스턴스 생성

    // 정보들을 유저모델에 저장
    user.save((err, userInfo) => { 
        if(err) return res.json({success: false, err}) // err시 json형태로 실패한 정보 전달.
        return res.status(200).json({
            success: true
        });
    }); 
});

app.post('/api/users/login', (req, res) => {

    // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, userInfo) => {
        if(!userInfo) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            });
        }
        // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인. (메소드 제작)
        userInfo.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."});
            
            // 비밀번호까지 맞다면 토큰을 생성하기. (메소드 제작)
            userInfo.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                
                // 쿠키에 토큰을 저장하고 client로 쿠키를 전달하여 로컬스토리지에 저장하도록 한다.
                res.status(200).json({ loginSuccess: true, userId: user._id, jwt: user.token });
            });
        });
    });
});

app.get('/api/users/auth', auth, (req, res) => { // auth라는 미들웨어 추가. 엔드포인트에서 request받고 callback전에 중간 처리.

    // 여기가지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True 라는 말.
    res.status(200).json({
        _id: req.user._id, // auth 미들웨어 통해 가져왔기 때문에 사용 가능
        isAdmin: req.user.role === 0 ? false : true, // role : 0 -> 일반유저
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    });
});

app.get('/api/users/logout', auth, (req, res) => {

    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        })
    })
})

app.get('/api/hello', (req, res) => {
    res.send('안녕하세요 ~');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));  // 포트 5000에서 실행 