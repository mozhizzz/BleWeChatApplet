// pages/Ble-slave/ble_slave.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceID: null,
  },

  /**
   * 自定义函数--发起蓝牙连接
   */
  initBleConnect(deviceId) {
    wx.createBLEConnection({
      // connectionPriority: high,
      deviceId: deviceId,
      success: (res) => {
        console.log('success', res)
        // this.getBLEDeviceServices(deviceId)
        
        try {
          const systemInfo = wx.getSystemInfoSync();
          if (systemInfo.platform === 'ios') {
            console.log('当前环境是 iOS');
          } else {
            console.log('当前环境不是 iOS');
            try {
              wx.setBLEMTU({
                deviceId: deviceId,
                mtu: self.constData.BLE_MTU_SIZE,
                fail: (res) => {
                  self.errMsg(self.data.lang.s2, self.data.lang.s3)
                  console.log('setBLEMTU ERROR: ', res.errCode)
                }
              })
            } catch (error) {
              console.log(error)
            }
          }
        } catch (err) {
          console.error('获取系统信息失败:', err);
        }
        console.log('self.data.ble.deviceId: ', self.data.ble.deviceId)

        this.getBLEDeviceServices(deviceId)

        setTimeout(() => {
          wx.notifyBLECharacteristicValueChange({
            deviceId: deviceId,
            serviceId: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
            characteristicId: "6E4000FF-B5A3-F393-E0A9-E50E24DCCA9E",
            state: true,
            success: (res) => {
              console.log('notifyBLECharacteristicValueChange SUCCESS: ', res.errCode)
              wx.onBLECharacteristicValueChange(self.onBLECharacteristicValueChange)
              self.getVersion()
              setTimeout(() => {
                if (self.data.ble.connected == false) {
                  this.closeBLEConnection()
                  wx.showModal({
                    title: this.data.lang.s5,
                    content: this.data.lang.s6,
                    confirmText: this.data.lang.s7,
                    showCancel: false,
                    success: (res) => {
                      wx.hideLoading()
                    }
                  })
                }
              }, 2000);
            },
            fail: (res) => {
              console.log('notifyBLECharacteristicValueChange ERROR: ', res.errCode)
              console.log(deviceId)
              self.errMsg(this.data.lang.s8, this.data.lang.s9)
            }
          })
        }, 1500);
      },
      
      fail: (res) => {
        wx.hideLoading()
        console.log(res)
        wx.showModal({
          showCancel: false,
          success: (res) => {
            this.closeBLEConnection()
            wx.reLaunch({
              url: 'pages/Ble-list/ble_list'
            })
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})