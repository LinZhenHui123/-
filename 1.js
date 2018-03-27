let http = require('http')
let fs = require('fs')
let urlLib = require('url');
let querystring = require('querystring')

let sql = {};//{alex:alex123,ppp:ppp123} 假库

http.createServer((req, res) => {
  if (req.url != '/favicon.ico') {
    let str = '';
    req.on('data', (chunk) => {
      str += chunk;
    });

    req.on('end', () => {

      if (req.url.indexOf('ajx') != -1) {
        //处理ajax请求
        checkAjax(req, res, str);
      } else if (req.url.indexOf('from') != -1) {
        //处理表单请求
        checkForm(req, res, str);
      } else {
        //服务:静态页面托管
        static('./www', req, res);
      }
    })
  }
}).listen(8002);

//ajax处理
function checkAjax(req, res, str) {

  let post = querystring.parse(str);
  let get = urlLib.parse(req.url, true).query;

  let data = get.act ? get : post;

  switch (data.act) {
    case 'login':
      if(sql[data.username]){
        //校验密码
        if(data.password == sql[data.username]){
          res.write('{error:0,msg:"登录成功",data:{fans:1212}}');
        }else{
          res.write('{error:1,msg:"用户名或者密码有误"}');
        }
      }else{
        res.write('{error:1,msg:"用户名不存在"}');
      }
      break;
    case 'reg':
      if(sql[data.username]){
        res.write('{error:1,msg:"用户名已存在"}');
      }else{
        sql[data.username]=data.password //更新假库
        res.write('{error:0,msg:"注册成功"}');
      }
      break;
    default:
      res.write('{error:1,msg:"错误的ACT"}');
  }
  console.log(sql);
  res.end();//一定要结束，浏览器才会统一接收
}
//表单请求处理
function checkForm(req, res, str) {
  //GET处理
  let data = urlLib.parse(req.url, true).query;
  console.log('收到的表单GET数据', data);

  //GET处理
  let data2 = querystring.parse(str);
  console.log('接收到的POST数据', data2);
}

//静态页面托管
function static(target, req, res) {
  let path = req.url == '/' ? '/index.html' : req.url;
  fs.readFile(target + path, (err, data) => {
    if (err) {
      fs.readFile(target + '/error.html', (err, data) => {
        res.write(data);
        res.end();
      });
    } else {
      res.write(data);
      res.end()
    }

  });

}
