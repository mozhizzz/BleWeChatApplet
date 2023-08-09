// pages/Ble-list/bleList.js
import { ab2hex, stringToHexArray, arrayBufferToHexString } from '../../utils/TypeConversion'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bleList: [],    // 设备列表
    filterName: 'MTC', // 过滤条件-名称(名称字符串中包含该字符串)
    filterRssi: -100,  // 过滤条件-rssi大于该值的

    searchAnimation: {}
  },

//***************************************自定义函数 *****/
  /**
   * 自定义函数--开始蓝牙扫描
   */
  startScan() {
    // 清空蓝牙设备列表
    if (!this.data.bleList.length == 0) {
      this.setData({
        bleList: []
      })
    }

    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this._bleisScan = true
        wx.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: true,
          success: (res) => {
            // 5秒后停止扫描
            setTimeout(() => {
              wx.stopBluetoothDevicesDiscovery() 
            }, 5000)

            this.onDeviceFound()
          },
          fail: (res) => {
            wx.showModal({
              title: "BLE Scan Fail",
              content: res.errMsg,
            })
          }
        })
      },
      fail: (res) => {
        wx.showModal({
          title: "BLE Open Adapter Fail",
          content: res.errMsg,
        })
      }
    })
  },

  /**
   * 自定义函数--解析广播数据
   */
  parseAdvData(buffer) {
    let dataView = new DataView(buffer);
    let advertisedData = {};
    // 遍历广播数据
    try {
      for (let i = 0; i < dataView.byteLength; ) {
        console.log(i)
          let length = dataView.getUint8(i++);
          let type = dataView.getUint8(i++);
  
          // 读取数据
          let data = [];
          for (let j = 0; j < length - 1; j++) {
              data.push(dataView.getUint8(i++));
          }
  
          switch (type) {
              case 0x01: // Flags
                  advertisedData['flags'] = data;
                  break;
              case 0x02: // Incomplete List of 16-bit Service Class UUIDs
              case 0x03: // Complete List of 16-bit Service Class UUIDs
                  advertisedData['uuids16bit'] = data;
                  break;
              case 0x06: // Incomplete List of 128-bit Service Class UUIDs
              case 0x07: // Complete List of 128-bit Service Class UUIDs
                  advertisedData['uuids128bit'] = data;
                  break;
              case 0x09: // Complete Local Name
                  advertisedData['localName'] = String.fromCharCode.apply(null, data);
                  break;
              case 0xFF: // Manufacturer Specific Data
                  advertisedData['manufacturerData'] = data;
                  break;
              default:
                  advertisedData[`type_${type}`] = data;
                  break;
          }
      }
    } catch(e) {
      console.log(e)
    }
    
    return advertisedData;
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
    if (device.RSSI < this.data.filterRssi) {
      return
    }
    
    // 重复判断
    for (let i=0; i<this.data.bleList.length; i++) {
      if (device.localName == this.data.bleList[i].localName) {
        this.data.bleList[i].RSSI = device.RSSI

        this.setData({
          bleList: this.data.bleList
        })

        return
      }
    }

    console.log(device)

    if (device.serviceData) {
      let key = Object.keys(device.serviceData)[0];
      if (key) {
        let data = new Uint8Array(device.serviceData[key]);

        // 获取UUID中的0402
        let hexPartFromUuid = key.substr(4, 4).match(/.{1,2}/g).join(' ') + ' ';
  
        // 将ArrayBuffer中的数据转化为十六进制字符串
        let hexPartFromArrayBuffer = Array.from(data, byte => ('00' + byte.toString(16)).slice(-2)).join(' ');
  
        // 将两个十六进制字符串组合起来
        let combinedHexString = hexPartFromUuid + hexPartFromArrayBuffer;
        device.showAdvertiseData = combinedHexString
      } else {
        let data = new Uint8Array(device.advertisData);

        // 将ArrayBuffer中的数据转化为十六进制字符串
        let hexPartFromArrayBuffer = arrayBufferToHexString(device.advertisData.slice(0, 5))

        device.showAdvertiseData = hexPartFromArrayBuffer
      }
      
    } else if (device.advertisData){
      device.showAdvertiseData = arrayBufferToHexString(device.advertisData.slice(0, 5))
    } else {
      device.showAdvertiseData = ''
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

  /**
   * 自定义函数--播放搜索动画
   */
  searchAnimationPlay() {
    this.data.searchAnimation = wx.createAnimation({
      duration: 3000,
      timingFunction: 'linear',
    });

    this.data.searchAnimation.translateX(-5).step({ duration: 500 }).translateY(-5).step({ duration: 500 }).translateX(10).step({ duration: 500 }).translateY(10).step({ duration: 500 }).translateX(0).step({ duration: 500 }).translateY(0).step({ duration: 500 });

    this.setData({
      searchAnimation: this.data.searchAnimation.export()
    });
  },

//******************************************************/

//***************************************自定义事件回调 */

  /**
   * 自定义回调--滑动rssi滑动条回调
   */
  onFilterNameInput(event) {
    this.data.filterName = event.detail.value
  },

  /**
   * 自定义回调--滑动rssi滑动条回调
   */
  rssiSliderChange(event) {
    this.setData({
      filterRssi: event.detail.value
    })
  },

  /**
   * 自定义回调--点击Scan按钮回调
   */
  onScanStart(event) {
    this.searchAnimationPlay()

    this.startScan()
  },

  /**
   * 自定义回调-选择设备回调
   */
  onDeviceSelect(event) {
    let index = Number(event.currentTarget.id)
    
    wx.navigateTo({
      url: `/pages/Ble-slave/ble_slave?deviceId=${this.data.bleList[index].deviceId}&&deviceName=${this.data.bleList[index].localName}`
    })
  },

//******************************************************/

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 清空列表
    this.data.bleList = []

    this.searchAnimationPlay()
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