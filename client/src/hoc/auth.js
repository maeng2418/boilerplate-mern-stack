import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action';

export default function (SpedificiComponent, option, adminRoute = null) {

    // option 설명
    // null => 아무나 출입이 가능한 페이지
    // true => 로그인한 유저만 출입이 가능한 페이지
    // false => 로그인한 유저는 출입 불가능한 페이지

    // adminRoute 설명
    // admin유저만 들어가기를 원하는 페이지

    function AuthenticationCheck(props) {

        const dispatch = useDispatch();

        useEffect(() => {
            dispatch(auth())
            .then(response => {
                // 로그인 하지 않은 상태
                if(!response.payload.isAuth) {
                    if(response.payload.error) localStorage.removeItem('jwt');
                    if(option) {
                        props.history.push('/login');
                    }
                } else {
                    // 로그인한 상태
                    if(adminRoute && !response.payload.isAdmin){ // 일반유저가 어드민페이지 접근 시
                        props.history.push('/');
                    } else {
                        if(option === false) { // 로그인한 유저가 로그인하지 않은 페이지 접근 시 (회원가입, 로그인페이지...)
                            props.history.push('/');
                        }
                    }
                }
            })
        }, []);

        return (
            <SpedificiComponent/>
        );
    }

    return AuthenticationCheck
} 