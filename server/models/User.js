const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 하기
const saltRounds = 10; // Salt를 이용해서 비밀번호를 암호화 => salt를 10자리로 설정.
const jwt = require('jsonwebtoken'); // jwt 만들기

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50 // 최대길이 제한
    },
    email: {
        type: String,
        trim: true, // 스페이스(공백) 없애줌
        unique: 1 // 유일함
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    // 관리자인지 일반 유저인지
    role: {
        type: Number,
        default: 0
    },
    image: String,
    // 유효성 관리
    token: {
        type: String
    },
    // 토큰 유효기간 설정
    tokenExp: {
        type: Number
    }
});

// 정보들을 유저모델을 저장하기 전에 실행해줌.
userSchema.pre('save', function( next ){
    var user = this; // userSchema를 가리키게 됨.

    if(user.isModified('password')){ // 비밀번호가 바뀔 때만 암호화
        // 비밀번호 암호화
        bcrypt.genSalt(saltRounds, function(err, salt) { // Salt 생성
            if(err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hash){
                if(err) return next(err);
                // Store hash in you password DB
                user.password = hash // 암호화된 비밀번호로 교체
                next(); // 다음꺼 실행(유저모델 저장)
            });
        });
    } else { // 비밀번호가 아닌 다른정보 바꿀시 그냥 넘어감(next())
        next();
    }
});

// 메소드 제작
userSchema.methods.comparePassword = function(plainPassword, cb) { // cb는 callback function

    // plainPassword 1234567    암호화된 비밀번호 $23243n2oidsoidnf232o3ifnwenif
    // plainPassword 암호화해서 DB password와 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err); // 비밀번호가 같지 않다.
        cb(null, isMatch); // 비밀번호가 같다. -> isMatch = True
    });
};

userSchema.methods.generateToken = function(cb) {
    
    var user = this;
    // jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken'); // user._id + 'secretToken' = token
    // user에 토큰 넣어주기
    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    });
};

// methods는 인스턴스를 가리키고, statics는 모델 자체를 가리킴. (this 바인딩 차이)
userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // 토큰을 decode 한다
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, function(error, user){
            if (err) return cb(err);
            cb(null, user);
        });
    });
};

const User = mongoose.model('User', userSchema); // schema를 모델로 감싸줌. (모델이름, 스키마)

module.exports = {User}; // 다른곳에서도 쓸 수 있음.