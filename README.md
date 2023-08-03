# 蓝牙调试小工具

## 介绍

这是一个用于微信小程序的蓝牙调试工具，旨在帮助开发者更轻松地进行蓝牙设备的开发和测试。

## 功能

- **设备扫描**：该工具可以扫描并显示周围的蓝牙设备，包括设备的基本信息如设备名、信号强度、广播数据等。
- **设备连接**：允许用户选择并连接到特定的蓝牙设备进行进一步的操作。
- **服务和特征发现**：在连接到设备后，工具可以列出设备提供的所有服务和特征。
- **读取和写入特征值**：可以读取特定特征的值，也可以写入新的值。
- **订阅和取消订阅通知**：对于支持通知的特征，可以订阅其变化，每当特征值发生变化时，工具都会接收并显示新的值。
- **广播数据解析**：工具可以自动解析设备的广播数据，将其转换成易于理解的格式。

## 使用方法

1. 打开微信小程序，点击“开始扫描”开始搜索蓝牙设备。
2. 扫描到的设备将会出现在列表中，点击设备名进行连接。
3. 连接成功后，点击“获取服务”和“获取特征”来列出设备提供的所有服务和特征。
4. 在特征列表中，点击特征名可以进行读取和写入操作。
5. 对于支持通知的特征，还可以点击“订阅”或“取消订阅”来接收特征值的变化。
6. 当设备广播数据时，工具会自动解析并显示广播数据。

## 注意事项

- 蓝牙功能需要用户授权才能使用，请确保已经在设备设置中打开了蓝牙和定位权限。
- 工具的使用可能受到设备特性和蓝牙规范的限制，如果遇到问题，请参考设备的说明文档和蓝牙规范。

## 支持

如果你在使用过程中遇到任何问题，或者有任何建议和反馈，欢迎通过以下方式联系我们：

- 邮箱：your-email@example.com
- 微信：your-wechat-id

欢迎使用蓝牙调试小工具，希望它能为你的开发工作带来便利！
