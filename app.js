/* global React, ReactDOM */
function App(){
  return React.createElement('div',{style:{padding:20,fontFamily:'sans-serif'}},[
    React.createElement('h2',null,'MET・WAT + 心拍・Borg・血圧 ログ（PWA v4.4 fix3-now2）'),
    React.createElement('p',null,'✅ 生成直後にすぐダウンロードしてください。')
  ]);
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));