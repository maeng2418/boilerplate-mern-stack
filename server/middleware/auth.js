const { User } = require('../models/User');

let auth = (req, res, next) => {

    // 인증 처리를 하는 곳

    // 토큰을 가져온다.
    let authHeader = req.header('Authorization');
    let token = authHeader.split(' ')[1];
    
    // 토큰을 복호화한 후 유저를 찾는다.
    User.findByToken(token, (err, user) => {
        //if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: err })

        req.token = token; // 토큰과 유저 가져 올 수 있음
        req.user = user;
        next(); // 다음으로...
    });

    // 유저가 있으면 인증 OKay

    // 유저가 없으면 인증 No !
}

module.exports = { auth };