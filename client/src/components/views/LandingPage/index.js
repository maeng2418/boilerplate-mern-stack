import React, { useEffect } from 'react';
import axios from 'axios';
import { logout } from '../../../_actions/user_action';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';

function LandingPage(props) {

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    axios.get('/api/hello')
      .then(response => { console.log(response) })
  }, [])

  const dispatch = useDispatch();

  const onClickHandler = () => {
    dispatch(logout())
      .then(response => {
        if (response.payload.success) {
          localStorage.removeItem('jwt');
          props.history.push('/login');
        } else {
          alert("로그아웃 하는데 실패했습니다.")
        }
      })
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}>
      <h2>시작 페이지</h2>
      <button onClick={onClickHandler}>
        로그아웃
      </button>
    </div>
  )
}

export default withRouter(LandingPage);
