/**
 * 1.网络请求失败
 * 2.服务端处理失败
 */

function request(cmd, data, operation) {
  console.log("web request " + cmd + " data", data);
  let app = getApp();
  let cookie = "";
  app.cookie.forEach(function(value, key, map) {
    cookie = key + "=" + value + ";" + cookie;
  });
  console.log("WebRequest.cmd", cmd);
  console.log("WebRequest.data", data);
  console.log("WebRequest.cookie", cookie);
  wx.request({
    //url: 'http://192.168.101.23:8088/api',
    url: 'https://age.knxy.top/api',
    //url: 'http://127.0.0.1:8088/api',
    data: {
      "cmd": cmd,
      "data": data,
    },
    header: {
      "Cookie": cookie
    },
    method: 'POST',
    dataType: 'json',
    success: function(res) {
      try {
        console.log("WebRequest.success", res); 
        if (res.statusCode != 200) {
          operation.fail(-1000, "发生错误了");
          return;
        }

        setCookies(res);
        let d = res.data;
        if (d.code > 0) {
          operation.success(d.data, d.code);
        } else {
          if (!d.msg) {
            d.msg = "发生错误了";
          }
          if (!d.code) {
            d.code = "-1";
          }
          if (d.code == "-2") {
            login(cmd, data, operation);
            return;
          } else {
            operation.fail(d.code, d.msg);
          }
        }
      } catch (e) {
        console.log("WebRequest.fail", e);
        operation.fail(-1000, "发生错误了");
      }
    },
    fail: function(res) {
      console.log("WebRequest.fail", res);
      setCookies(res);
      operation.fail(-999, "网络出问题了");
    }
  });
}

function login(cmd, data, operation) {
  wx.login({
    success(res) {
      if (res.code) {
        // 发起网络请求
        request("C1003", {
          "jsCode": res.code
        }, {
          success: function(d) {
            getApp().isLogin = true;
            request(cmd, data, operation);
          },
          fail: function(code, msg) {
            operation.fail(code, msg);
          }
        });
      } else {
        operation.fail("-1", "登录失败");
      }
    },
    fail: function(res) {
      operation.fail("-1", "登录失败");
    }
  });
}

function setCookies(res) {
  let cookies = res.cookies;

  let app = getApp();
  if (cookies) {
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].split(";")[0].split("=");
      app.cookie.set(cookie[0], cookie[1]);
    }
    return;
  }

  try {
    cookies = res.header["Set-Cookie"];
  } catch (err) {}
  if (cookies) {
    let kvs = cookies.split(";");
    if (!kvs || kvs.length < 1) {
      return;
    }

    for (let i = 0; i < kvs.length; i++) {
      let kv = kvs[i];
      kv = kv.split("=");
      if (!kv || kv.length < 2) {
        break;
      }
      let key = kv[0].trim();
      let value = kv[1].trim();
      if (!key || key == "Path") {
        break;
      }
      app.cookie.set(key, value);
    }
  }
}

module.exports = {
  request: request,
}