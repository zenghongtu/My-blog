---
title: 破解某网站url加密
category: "爬虫"
cover: cat2.jpg
author: Jason Zeng
---

想要爬取网站http://dir.scmor.com/google/ 中Google镜像站的链接，一眼看去还以为简单提取一下href就好，仔细看看好像没那么简单。

1. 分析

网页源码如下，点击现在访问执行visit函数，传入的字符串为base64编码。
```html
< a href="javascript:;" class="ok" onclick="visit('DSE8WyM3DBsjQGsWNj5YXSEsEgovACEETDBXUA==')"> 现在访问 </a>
```
直接将该字符串base64解码得到结果如下。乱码，说明不是简单的将url经过base64编码。
```bash
!<[#7#@k6>X]!,
/!L0WP
```
通过查找js文件，找到visit函数
```js
function visit(url) {
    var newTab = window.open('about:blank');
    if (Gword != '') url = strdecode(url);
    // var newTab = window.open(url);
    newTab.location.href = url;
    //newTab.location.reload(true);
}
```
通过javascript源码可以看出，将字符串经过strdecode函数处理后，即可得到真实的url。
strdecode函数代码如下
```js
function strdecode(string) {
    string = base64decode(string);
    key = Gword;
    len = key.length;
    code = '';
    for (i = 0; i < string.length; i++) {
        var k = i % len;
        code += String.fromCharCode(string.charCodeAt(i) ^ key.charCodeAt(k))
    }
    return base64decode(code)
}
```
通过查找，Gword的值为link@scmor.com。至此，已经了解了网址加密解密的整个过程，可以开始编写代码啦。

2. Coding

```python
import requests
import base64
import re
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:39.0) Gecko/20100101 Firefox/39.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive'}

def get_encoded_urls():
    html=requests.get('http://dir.scmor.com/google/',headers=headers).text.replace('\r','').replace('
','').replace(' ','')
    encoded_urls=re.findall('autourl\[\d+\]="(.*?)";',html)
    return encoded_urls

def from_char_code(a, *b):
    try:
        return unichr(a%65536) + ''.join([unichr(i%65536) for i in b])
    except:
        return chr(a%65536) + ''.join([chr(i%65536) for i in b])

def decode(string):
    string=base64.b64decode(string).decode('utf-8')
    key='link@scmor.com'
    length=len(key)
    code=''
    for i in range(len(string)):
        k=i%length
        code+=from_char_code(ord(string[i])^ord(key[k]))
    result=base64.b64decode(code).decode('utf-8')
    return result

def write_to_txt(urls):
    f=open('result.txt','w')
    for url in urls:
        f.write(url+'
')
    f.close()

def crawl():
    encoded_urls=get_encoded_urls()
    urls=[]
    for string in encoded_urls:
        url=decode(string)
        urls.append(url)
    write_to_txt(urls)

crawl()
```
