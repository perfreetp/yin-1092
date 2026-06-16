import { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { SleepProvider } from './store/SleepContext';
import './app.scss';

function App(props) {
  useEffect(() => {
    console.log('[App] App component mounted');
  }, []);

  useDidShow(() => {
    console.log('[App] App did show');
  });

  useDidHide(() => {
    console.log('[App] App did hide');
  });

  return <SleepProvider>{props.children}</SleepProvider>;
}

export default App;
