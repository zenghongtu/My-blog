---
title: ECS部署SS科学上网
category: "ss"
cover: clay-banks-765259-unsplash.jpg
author: Jason Zeng
---

1.安装shadowsocks

```bash
sudo pip install shadowsocks
```
2.启动

命令方式启动

```bash
sslocal -s 222.22.2.2 -p 222 -b 127.0.0.1 -l 1080 -k passwd -t 600 -m aes-256-cfb
```

配置文件启动

```bash
sslocal -c shadowsocks.json
```

配置文件格式：
```json
{
"server" : "222.22.2.2",
"local_address": "127.0.0.1",
"server_port" : 222,
"local_port" : 1080,
"password" : "passwd",
"timeout" : 600,
"method" : "aes-256-cfb",
"fast_open":false
}
```
3.使用polipo进行二次转发

安装polipo
```bash
sudo apt-get install polipo
```
配置polipo

修改/etc/polipo/config

```bash
logSyslog = true
logFile = /var/log/polipo/polipo.log

proxyAddress = "0.0.0.0"

socksParentProxy = "127.0.0.1:1080"
socksProxyType = socks5

chunkHighMark = 50331648
objectHighMark = 16384

serverMaxSlots = 64
serverSlots = 16
serverSlots1 = 32
```

重启polipo
```bash
sudo /etc/init.d/polipo restart
```
polipo默认是运行在8123端口

4.Python3使用shadowsocks代理

shadowsocks使用的是socks5协议，需要Python支持socks5代理

安装pysocks

```bash
sudo pip install pysocks
```

使用示例：

```python
import requests

proxies={'http':'socks5://127.0.0.1:1080'}
html=requests.get('http://httpbin.org/ip',proxies=proxies).text
print(html)
or

import requests
import socks
import socket

socks.setdefaultproxy(socks.PROXY_TYPE_SOCKS5, "127.0.0.1", 1080)
socket.socket = socks.socksocket

html=requests.get('http://httpbin.org/ip').text
print(html)
```
