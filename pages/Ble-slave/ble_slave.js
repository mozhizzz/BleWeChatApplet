// pages/Ble-slave/ble_slave.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: {
      deviceId: '',
      deviceName: '',
      deviceService: []
    },
    negotiation_mtu: 200,
  },

  /**
   * 自定义函数--发起蓝牙连接
   */
  initBleConnect(deviceInfo) {
    console.log(`start connection with ${deviceInfo.deviceName}`)
    wx.createBLEConnection({
      deviceId: deviceInfo.deviceId,
      success: (res) => {
        console.log('success', res)
        
        // 手机操作系统判断，非IOS要进行MTU协商
        try {
          const systemInfo = wx.getSystemInfoSync();
          if (systemInfo.platform === 'ios') {
            console.log('当前环境是 iOS');
          } else {
            console.log('当前环境不是 iOS');
            try {
              wx.setBLEMTU({
                deviceId: deviceInfo.deviceId,
                mtu: this.data.negotiation_mtu,
                fail: (res) => {
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

        console.log('Connect successfully, deviceId: ', deviceInfo.deviceId)

        this.getAllServiceAndCharacteristic(deviceInfo.deviceId)
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
   * 自定义函数--使能notification
   */
  enableNotification(deviceId) {
    
  },

  /**
   * 自定义函数--往特征写入数据
   */
  writeCharacteristic(deviceId, serviceUUID, characteristicUUID) {
    
  },

  /**
   * 自定义函数--接收notification消息
   */
  onCharacteristicNotifiedMsg() {
    
  },

  /**
   * 自定义函数--往特征写入数据
   */
  getAllServiceAndCharacteristic(deviceId) {
    console.log('start find service and characteristic')

    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res) => {
        res.services.forEach((serItem) => {
          console.log('get service successfully, services UUID: ', serItem.uuid)
          wx.getBLEDeviceCharacteristics({
            deviceId: deviceId,
            serviceId: serItem.uuid,
            success: (res) => {
              let chars = []
              res.characteristics.forEach((charItem) => {
                console.log('get characteristics successfully, characteristics UUID: ', charItem.uuid)
                chars.push(charItem)
              })

              this.data.deviceInfo.deviceService.push({
                serviceUUID: serItem.uuid,
                characteristics: chars
              })
            },
            fail: (res) => {
              console.log('get characteristic fail', res)
            }
          })
        })
      },
      fail: (res) => {
        console.log('get serivce fail', res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.data.deviceInfo.deviceId = options.deviceId
    this.data.deviceInfo.deviceName = options.deviceName

    this.initBleConnect(this.data.deviceInfo)
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