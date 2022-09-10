// pages/camera/index.js

import { request } from "../../common/Web.js";
import { upload as _upload } from "../../common/QiniuUploader.js";
const app = getApp();

Page({

  log: [],
  response: {},

  targetImage: {
    path: "",
    width: 0,
    height: 0
  },

  sourceImage: {
    path: "",
    width: 0,
    height: 0
  },

  systemInfo: {
  },

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.systemInfo = {
          mobileModel: res.model,
          mobileePixelRatio: res.pixelRatio,
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          language: res.language,
          version: res.version
        };
      }
    });
  },

  chooseImage: function (options) {
    let that = this;
    this.log = [];
    this.log.push("chooseImage");
    this.log.push(this.systemInfo);
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.sourceImage.path = res.tempFilePaths[0];
        that.handleImage();
      },
      fail() {
        wx.showToast({
          title: '获取图片失败',
          image: '/image/failure.png'
        });
      }
    })
  },
  handleImage: function () {
    let that = this;
    this.log.push("handleImage " + that.sourceImage.path);
    wx.showLoading({
      title: '处理图片中',
    })
    wx.getImageInfo({
      src: that.sourceImage.path, //图片的路径，可以是相对路径，临时文件路径，存储文件路径，网络图片路径,  
      success: res => {

        let maxSize = 2048;
        let minSize = 48;
        let width = res.width;
        let height = res.height;
        that.sourceImage.width = res.width;
        that.sourceImage.height = res.height;
 
        if (width > height) {
          if (width > maxSize) {
            width = maxSize;
            height = maxSize * res.height / res.width;
          }
          if (height < minSize) {
            height = minSize;
            width = minSize * res.width / res.height;
          }
        } else {
          if (height > maxSize) {
            height = maxSize;
            width = maxSize * res.width / res.height;
          }
          if (width < minSize) {
            width = minSize;
            height = minSize * res.height / res.width;
          }
        }

        if (width < 48 || width > 2048 || height < 48 || height > 2048) {
          wx.hideLoading();
          wx.showToast({
            title: '像素不能大于2048，不能小于48',
            image: '/image/failure.png'
          });
          return;
        }

        this.log.push("handleImage1 " + width + "  " + height);
        that.setData({
          imageWidth: width,
          imageHeight: height
        });
 
        that.targetImage.width = width;
        that.targetImage.height = height;
        that.targetImage.path = res.path;
 
        that.log.push("handleImage2 " + res.width + "  " + res.height);

        that.getToken();
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '图片处理发生错误了',
          image: '/image/failure.png'
        });
      },
      complete: () => {}
    });
  },

  getToken: function () {
    let that = this;
    this.log.push("getToken " + that.targetImage.path);

    request("C1015", {}, {
      success: function (data) {
        data.path = that.targetImage.path;
        that.upload(data);
      },
      fail: function (code, msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg,
          image: '/image/failure.png'
        });
      }
    });
  },
  upload: function (data) {
    let that = this;
    this.log.push("upload");

    wx.showLoading({
      title: '上传图片',
    });
    _upload(data.path, (res) => {
      that.getAge(data);
    }, (error) => {
      wx.hideLoading();
      wx.showToast({
        title: error,
        image: '/image/failure.png'
      });
    }, {
      region: "SCN",
      //domain: "http://image.age.knxy.top", // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
      key: data.name, // [非必须]自定义文件 key。如果不设置，默认为使用微信小程序 API 的临时文件名
      // 以下方法三选一即可，优先级为：uptoken > uptokenURL > uptokenFunc
      uptoken: data.token, // 由其他程序生成七牛 uptoken 
    }, (res) => {
      wx.showLoading({
        title: '上传图片 ' + res.progress,
      });
    }, () => {
      // 取消上传
    }, () => {
      // `before` 上传前执行的操作
    }, (err) => {
      // `complete` 上传接受后执行的操作(无论成功还是失败都执行)
    });
  },
  getAge: function (d) {
    let that = this;
    this.log.push("getAge");
    wx.showLoading({
      title: '预计年龄',
    });
    request("C1013", {
      "name": d.name,
      "log": this.log
    }, {
      success: function (data) {
        that.response = data;
        that.showImage();
      },
      fail: function (code, msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg,
          image: '/image/failure.png'
        });
      }
    });
  },
  showImage: function () {
    let that = this;
    let data = this.response;
    let screenProportion = wx.getSystemInfoSync().windowWidth / 750;

    let maxWidth = 720 * screenProportion;
    let maxHeight = 800 * screenProportion;

    let imageWidth = this.data.imageWidth;
    let imageHeight = this.data.imageHeight;

    let canvasWidth = 0;
    let canvasHeight = 0;

    if (maxWidth / maxHeight > imageWidth / imageHeight) {
      canvasHeight = maxHeight;
      canvasWidth = imageWidth * maxHeight / imageHeight;
    } else {
      canvasWidth = maxWidth;
      canvasHeight = imageHeight * maxWidth / imageWidth;
    }


    let fontSize = 30 * screenProportion;
    let lineWidth = 2.5 * screenProportion;

    let pop = {
      rectHigth: 40 * screenProportion,
      rectWidth: 60 * screenProportion,
      triangleWidth: 30 * screenProportion,
      triangleHigth: 15 * screenProportion
    }

    let rpx10 = 10 * screenProportion;
    let rpx50 = 50 * screenProportion;

    let proportion = canvasWidth / that.targetImage.width;

    let faces = data.faces;
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      let rect = face.faceRectangle;
      rect.l = rect.left * proportion;
      rect.t = rect.top * proportion + rpx50;
      rect.b = rect.t + rect.height * proportion;
      rect.r = rect.l + rect.width * proportion;
    }

    this.setData({
      canvasHeight: canvasHeight + rpx50,
      canvasWidth: canvasWidth,
      "state": "show"
    });

    setTimeout(() => {
      let canvas = wx.createCanvasContext('canvas');
      canvas.clearRect(0, 0, canvasWidth, canvasHeight + rpx50);
      canvas.drawImage(that.targetImage.path, 0, rpx50, canvasWidth, canvasHeight);
      canvas.setLineWidth(lineWidth);
      canvas.setFontSize(fontSize)
      for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        let rect = face.faceRectangle;

        if (face.attributes == null || face.attributes.age == null)
          continue;

        canvas.setStrokeStyle('#ffffff');
        canvas.beginPath();

        canvas.moveTo(rect.l, rect.t);
        canvas.lineTo(rect.r, rect.t);
        canvas.lineTo(rect.r, rect.b);
        canvas.lineTo(rect.l, rect.b);
        canvas.lineTo(rect.l, rect.t);
        canvas.stroke();

        let startX = (rect.r - rect.l) / 2 + rect.l;
        let startY = rect.t;

        canvas.setFillStyle('#ffeb3b');
        canvas.beginPath();

        canvas.moveTo(startX, startY);
        canvas.lineTo(startX - pop.triangleWidth / 2, startY - pop.triangleHigth);
        canvas.lineTo(startX - pop.rectWidth / 2, startY - pop.triangleHigth);
        canvas.lineTo(startX - pop.rectWidth / 2, startY - pop.triangleHigth - pop.rectHigth);
        canvas.lineTo(startX + pop.rectWidth / 2, startY - pop.triangleHigth - pop.rectHigth);
        canvas.lineTo(startX + pop.rectWidth / 2, startY - pop.triangleHigth);
        canvas.lineTo(startX + pop.triangleWidth / 2, startY - pop.triangleHigth);
        canvas.lineTo(startX, startY);

        canvas.fill();

        canvas.setFillStyle('#ff3d00');
        canvas.setTextAlign('center')
        canvas.fillText(face.attributes.age.value, startX, startY - pop.triangleHigth - rpx10)
      }
      canvas.draw(true, function (res) {
        wx.hideLoading();
      });
    }, 300);
  },

  saveImage: function () {
    let that = this;

    let minWidth = 512;
    let imageWidth = that.sourceImage.width;
    let imageHeight = that.sourceImage.height;

    if (imageWidth < minWidth) {
      imageHeight = imageHeight * minWidth / imageWidth;
      imageWidth = minWidth;
    }

    let headerWidth = imageWidth;
    let headerHeight = headerWidth * 345 / 1024;

    let canvasWidth = imageWidth;
    let canvasHeight = headerHeight + imageHeight;

    that.setData({
      imageWidth: canvasWidth,
      imageHeight: canvasHeight
    });

    let proportion = (imageWidth * 1 / 800)

    let lineWidth = 2 * proportion;
    let fontSize = 30 * proportion;

    let pop = {
      rectHigth: 40 * proportion,
      rectWidth: 60 * proportion,
      triangleWidth: 30 * proportion,
      triangleHigth: 15 * proportion
    }
    let data = that.response;

    proportion = imageWidth / that.targetImage.width;
    let faces = data.faces;
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      let rect = face.faceRectangle;
      rect.l = rect.left * proportion;
      rect.t = rect.top * proportion + headerHeight;
      rect.b = rect.t + rect.height * proportion;
      rect.r = rect.l + rect.width * proportion;
    }

    let canvas = wx.createCanvasContext('creator');
    setTimeout(() => {
      canvas.drawImage("../../image/camera/header.png", 0, 0, headerWidth, headerHeight);
      canvas.drawImage(that.sourceImage.path, 0, headerHeight, imageWidth, imageHeight);

      canvas.setLineWidth(lineWidth);
      canvas.setFontSize(fontSize)
      for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        let rect = face.faceRectangle;

        if (face.attributes == null || face.attributes.age == null)
          continue;

        canvas.setStrokeStyle('#ffffff');
        canvas.beginPath()
        canvas.moveTo(rect.l, rect.t);
        canvas.lineTo(rect.r, rect.t);
        canvas.lineTo(rect.r, rect.b);
        canvas.lineTo(rect.l, rect.b);
        canvas.lineTo(rect.l, rect.t);
        canvas.stroke();

        let startX = (rect.r - rect.l) / 2 + rect.l;
        let startY = rect.t;

        canvas.setFillStyle('#ffeb3b');
        canvas.beginPath();

        canvas.moveTo(startX, startY);
        canvas.lineTo(startX - pop.triangleWidth / 2, startY - pop.triangleHigth);
        canvas.lineTo(startX - pop.rectWidth / 2, startY - pop.triangleHigth);
        canvas.lineTo(startX - pop.rectWidth / 2, startY - pop.triangleHigth - pop.rectHigth);
        canvas.lineTo(startX + pop.rectWidth / 2, startY - pop.triangleHigth - pop.rectHigth);
        canvas.lineTo(startX + pop.rectWidth / 2, startY - pop.triangleHigth);
        canvas.lineTo(startX + pop.triangleWidth / 2, startY - pop.triangleHigth);
        canvas.lineTo(startX, startY);

        canvas.fill();

        canvas.setFillStyle('#ff3d00');
        canvas.setTextAlign('center')
        canvas.fillText(face.attributes.age.value, startX, startY - pop.triangleHigth - pop.rectHigth * 1 / 6)
      }

      canvas.draw(false, function () {
        wx.canvasToTempFilePath({
          canvasId: 'creator',
          fileType: "jpg",
          success: function (res) {
            wx.getImageInfo({
              src: res.tempFilePath,
              success: res => {
                wx.saveImageToPhotosAlbum({
                  filePath: res.path,
                  success(res) {
                    wx.showToast({
                      title: "成功了,分享去",
                      image: '/image/success.png'
                    });
                  }
                });
              }
            });
          }
        });
      });
    }, 100);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "年龄相机",
      imageUrl: "/image/icon.png"
    }
  }
})