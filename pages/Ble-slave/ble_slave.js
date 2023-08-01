import { ab2hex, stringToHexArray, arrayBufferToHexString } from '../../utils/TypeConversion'

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

    connectState: false,

    selectService: '',
    selectCharacteritisc: '',
    selectCharacteritiscNotifyState: false,

    isTimingSend: false,
    sendInterval: 1000,
    negotiation_mtu: 200,
    logInfo: '',
    sendMsg: '',
    sendTimer: null,
  },

//***************************************自定义函数 *****/
  /**
   * 自定义函数--发起蓝牙连接
   */
  printLog(str) {
    if (this.data.logInfo.length > 50000) {
      this.data.logInfo = ''
    }

    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    let day = date.getDate().toString().padStart(2, '0'); 
    let hour = date.getHours().toString().padStart(2, '0');
    let minute = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    let formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${seconds}: `;

    let strWithtime = formattedDate + str

    this.setData({
      logInfo: strWithtime + '\n' + this.data.logInfo
    })
  },

  /**
   * 自定义函数--发起蓝牙连接
   */
  checkConnectionState() {
    if (this.data.connectState) {
      return true
    } else {
      this.printLog("No Connection Exist!")
      return false
    }
  },

  /**
   * 自定义函数--发起蓝牙连接
   */
  initBleConnect(deviceInfo) {
    console.log(`start connection with ${deviceInfo.deviceName}`)
    wx.createBLEConnection({
      deviceId: deviceInfo.deviceId,
      success: (res) => {
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
   * 自定义函数--主动断开蓝牙连接
   */
  disconnectBleConnection(deviceInfo) {
    wx.closeBLEConnection({
      deviceId: deviceInfo.deviceId,
    })
  },

  /**
   * 自定义函数--使能notification
   */
  enableNotification(deviceId, serviceId, characteristiscId) {
    wx.notifyBLECharacteristicValueChange({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristiscId,
      state: true,
      success: (res) => {
        this.printLog("notify successfully!")

        wx.onBLECharacteristicValueChange((result) => {
          this.onBleCharacteristicValueChange(result)
        })
      },
      fail: (res) => {
        this.printLog("notify fail!" + res.errMsg)
      }
    })
  },

  /**
   * 自定义函数--往特征写入数据
   */
  writeCharacteristic(deviceId, serviceUUID, characteristicUUID, value) {
    console.log(deviceId, serviceUUID, characteristicUUID)
    this.printLog("Send->"+ arrayBufferToHexString(value))

    wx.writeBLECharacteristicValue({
      deviceId:deviceId,
      serviceId: serviceUUID,
      characteristicId: characteristicUUID,
      value: value,
      success: (res) => {
        console.log(res)
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  /**
   * 自定义函数--接收notification消息
   */
  receiveNotifiedMsg(buffer) {
    
  },

  /**
   * 自定义函数--往特征写入数据
   */
  getAllServiceAndCharacteristic(deviceId) {
    console.log('start find service and characteristic')
    // 清空一下服务列表，否则会一直叠加
    this.data.deviceInfo.deviceService = []

    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res) => {
        res.services.forEach((serItem) => {
          console.log('get service successfully, services UUID: ' + serItem.uuid)
          wx.getBLEDeviceCharacteristics({
            deviceId: deviceId,
            serviceId: serItem.uuid,
            success: (res) => {
              let chars = []
              res.characteristics.forEach((charItem) => {
                console.log('get characteristics successfully, characteristics UUID: '+ charItem.uuid)
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

//******************************************************/

//***************************************自定义事件回调 */

  /**
   * 自定义回调--连接断开回调
   */
  onBleDisconnect() {
    this.printLog("Disconnect successfully!")

    this.setData({
      connectState: false
    })

    if (this.data.sendTimer) {
      clearInterval(this.data.sendTimer)
    }
  },

  /**
   * 自定义回调--连接建立回调
   */
  onBleConnect() {
    this.printLog('Connect Successfully!')

    this.setData({
      connectState: true
    })
  },

  /**
   * 自定义回调--连接状态改变回调
   */
  onBleConnectStateChange(result) {
    console.log(result)
    console.log(`device ${result.deviceId} state has changed, connected: ${result.connected}`)

    if (!result.connected) {
      this.onBleDisconnect()
    } else {
      this.onBleConnect()
    }
  },

  /**
   * 自定义回调--特征值变化回调
   */
  onBleCharacteristicValueChange(result) {
    this.printLog("Rece<-" + ab2hex(result.value))

    this.receiveNotifiedMsg(result.value)
  },

  /**
   * 自定义回调--特征选择点击回调
   */
  characteritiscSelect(event) {
    if (!this.checkConnectionState()) {
      return
    }

    let serviceList = []
    let that = this
    let selectChar = ''
    this.data.deviceInfo.deviceService.forEach((item) => {
      serviceList.push(item.serviceUUID)
    })
    
    wx.showActionSheet({
        itemList: serviceList,
        success: (res) => {
            let index = res.tapIndex
            let charList = []
            
            this.data.selectService = serviceList[index]
            this.data.deviceInfo.deviceService[index].characteristics.forEach((item) => {
              charList.push(item.uuid)
            })

            wx.showActionSheet({
                itemList: charList,
                success: (res) => {
                    this.setData({
                      selectCharacteritisc: charList[res.tapIndex]
                    })
                },
                fail: (res) => {
                    console.log(res.errMsg)
                }
            })
        },
        fail: (res) => {
          console.log(res.errMsg)
        }
    })
  },

  /**
   * 自定义回调--连接状态点击回调
   */
  onConnectStateClick(result) {
    if (this.data.connectState) {
      this.disconnectBleConnection(this.data.deviceInfo)
    } else {
      this.initBleConnect(this.data.deviceInfo)
    }
  },

  /**
   * 自定义回调--点击Read按钮
   */
  onReadButtonClick(event) {
    if (!this.checkConnectionState()) {
      return
    }
    
    wx.readBLECharacteristicValue({
      deviceId: this.data.deviceInfo.deviceId,
      serviceId: this.data.selectService,
      characteristicId: this.data.selectCharacteritisc,
      success: (res) => {
        console.log(res)
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  /**
   * 自定义回调--定时选项点击事件
   */
  onTimerCheckboxChange(event) {
    if (this.data.isTimingSend) {
      clearInterval(this.data.sendTimer)
    }

    this.setData({
      isTimingSend: !this.data.isTimingSend
    })
  },

  /**
   * 自定义回调--点击Notify按钮
   */
  onNotifyButtonClick(event) {
    if (!this.checkConnectionState()) {
      return
    }

    this.enableNotification(this.data.deviceInfo.deviceId, this.data.selectService, this.data.selectCharacteritisc)
  },

  /**
   * 自定义回调--间隔输入框事件回调
   */
  onIntervalInput(event) {
    this.data.sendInterval = event.detail.value
  },

  /**
   * 自定义回调--输入框输入事件回调
   */
  onSendInput(event) {
    this.data.sendMsg = event.detail.value
  },

  /**
   * 自定义回调--点击发送按钮
   */
  onSendButtonClick(event) {
    if (!this.checkConnectionState()) {
      return
    }
    
    let value = stringToHexArray(this.data.sendMsg)

    if (this.data.isTimingSend) {
      if (!this.data.sendTimer) {
        this.data.sendTimer = setInterval(() => {
          this.writeCharacteristic(this.data.deviceInfo.deviceId, this.data.selectService, this.data.selectCharacteritisc, value)
        }, this.data.sendInterval)
      } else {
        clearInterval(this.data.sendTimer)
        this.data.sendTimer = setInterval(() => {
          this.writeCharacteristic(this.data.deviceInfo.deviceId, this.data.selectService, this.data.selectCharacteritisc, value)
        }, this.data.sendInterval)
      }
    } else {
      this.writeCharacteristic(this.data.deviceInfo.deviceId, this.data.selectService, this.data.selectCharacteritisc, value)
    }
  },

//******************************************************/

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.data.deviceInfo.deviceId = options.deviceId
    this.data.deviceInfo.deviceName = options.deviceName

    this.initBleConnect(this.data.deviceInfo)

    wx.onBLEConnectionStateChange((result) => {
      this.onBleConnectStateChange(result)
    })
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
    this.data.connectState = false

    wx.closeBLEConnection({
      deviceId: this.data.deviceInfo.deviceId,
    })
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