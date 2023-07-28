// pages/Ble-list/bleList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bleList: [],    // 设备列表
    filterName: 'MTC', // 过滤条件-名称(名称字符串中包含该字符串)
    filterRssi: -100,  // 过滤条件-rssi大于该值的
  },

//***************************************自定义函数 *****/
  /**
   * 自定义函数--开始蓝牙扫描
   */
  startScan() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this._bleisScan = true
        wx.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: true,
          success: (res) => {
            console.log('startBluetoothDevicesDiscovery success', res)

            // 5秒后停止扫描
            setTimeout(() => {
              wx.stopBluetoothDevicesDiscovery() 
            }, 5000)

            this.onDeviceFound()
          },
        })
      },
      fail: (res) => {
        console.log('error', res.errCode)
        
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this._bleisScan = true
              const data = {}
              data[`bleScanState`] = this.data.lang.s2
              this.setData(data)
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },

  /**
   * 自定义函数--添加设备逻辑
   */
  addDevice(device) {
    // null判断
    if (!device || !device.localName) {
      return
    }

    // 名称过滤
    if (device.localName.indexOf(this.data.filterName) == -1) {
      return
    }

    // rssi过滤
    if (device.rssi < this.data.filterRssi) {
      return
    }
    
    // 重复判断
    for (let i=0; i<this.data.bleList.length; i++) {
      if (device.localName == this.data.bleList[i].localName) {
        return
      }
    }
    this.data.bleList.push(device)
    
    this.setData({
      bleList: this.data.bleList
    })
  },

  /**
   * 自定义函数--搜索到蓝牙设备回调
   */
  onDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        this.addDevice(device)
      })
    })
  },
//******************************************************/

//***************************************自定义事件回调 */
  rssiSliderChange(event) {
    this.setData({
      filterRssi: event.detail.value
    })
  },

//******************************************************/

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 清空列表
    this.data.bleList = []

    // 开始扫描
    this.startScan()
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

  },
})