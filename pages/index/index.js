//index.js
//获取应用实例
const app = getApp()
const web = require("../../common/Web.js");
Page({
  data: {
    date: '1994-01-01',
    realAge: "", //周岁
    voidAge: "", //虚岁
    zodiacYear: "", //生肖
    lunarBirthday: "", //农历生日
    realBirthDvalue: "", //离公历生日还有几天
    voidBirthDvalue: "", //离农历生日还有几天
    liftTime: "", //生日也现在的时间差
    voidNewYearDvalue: "", //距离农历新年还有几天
    isResultGet: false
  },
  bindDateChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    });
  },
  onLoad: function() {

  },
  compute: function() {
    if (!this.data.isResultGet) {
      var heightAnima = wx.createAnimation({
        duration: 400,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50% 0",
      });
      heightAnima.height(0).step();

      var opacityAnima = wx.createAnimation({
        duration: 400,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50% 0",
      });
      opacityAnima.opacity(1).scaleY(1).step();

      var buttonAnima = wx.createAnimation({
        duration: 400,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50% 0",
      });
      buttonAnima.width("100%").step();

      var systemInfo = wx.getSystemInfoSync();
      var pickerNameAnima = wx.createAnimation({
        duration: 400,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50% 0",
      });
      pickerNameAnima.translate3d(-120 / 750 * wx.getSystemInfoSync().windowWidth,
        87 / 750 * wx.getSystemInfoSync().windowWidth,
        0).
      step();

      var pickerValueAnima = wx.createAnimation({
        duration: 400,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50% 0",
      });
      pickerValueAnima.translate3d(
        150 / 750 * wx.getSystemInfoSync().windowWidth,
        0,
        0).
      step();

      var lineAnimate = wx.createAnimation({
        duration: 400,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50% 0",
      });
      lineAnimate.width("0").step();

      var selectionAnima = wx.createAnimation({
        duration: 400,
        timingFunction: "ease",
        delay: 0,
        transformOrigin: "50% 50% 0",
      });
      selectionAnima.translateY(-50 / 750 * wx.getSystemInfoSync().windowWidth).
      step();

      this.setData({
        isResultGet: true,
        heightAnima: heightAnima.export(),
        opacityAnima: opacityAnima.export(),
        buttonAnima: buttonAnima.export(),
        pickerNameAnima: pickerNameAnima.export(),
        pickerValueAnima: pickerValueAnima.export(),
        lineAnimate: lineAnimate.export(),
        selectionAnima: selectionAnima.export(),
      });
    }

    let birthday = this.data.date.split("-");
    birthday[0] = parseInt(birthday[0]);
    birthday[1] = parseInt(birthday[1]);
    birthday[2] = parseInt(birthday[2]);
    let that = require("../../common/AgeUtils.js"); 
    this.setData({
      realAge: that.getRealAge(birthday),
      voidAge: that.getVoidAge(birthday),
      zodiacYear: that.getZodiacYear(birthday),
      lunarBirthday: that.getLunarBirthday(birthday),
      realBirthDvalue: that.getRealBirthDvalue(birthday),
      voidBirthDvalue: that.getVoidBirthDvalue(birthday),
      liftTime: that.getLiftTime(birthday),
      voidNewYearDvalue: that.getVoidNewYearDvalue(birthday)
    });
  },
  toVoid: function() {
    wx.navigateTo({
      url: 'question/index',
    })
  },
  toReal: function() {
    wx.navigateTo({
      url: 'question/index',
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: "年龄岁数计算器",
      imageUrl: "/image/icon.png"
    }
  },
  reward: function() {
     wx:wx.navigateTo({
       url: 'reward/index',
     })
  },
   
})