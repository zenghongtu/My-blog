---
title: 破解Geetest极验滑动验证码
category: "爬虫"
cover: cat4.jpg
author: Jason Zeng
---

1. 截取验证码直接获取验证码图片实现起来比较麻烦，因此这里采用 selenium 截图的方式截取验证码图片。鼠标左键点击滑动条时，验证码会显示出来，此时通过 get_screenshot_as_png 方法将页面截取下来，再通过验证码在页面中的位置，将验证码截取出来。代码如下：

```python
def get_captcha_img(self):
    slider_element=self.browser.find_element_by_class_name('gt_slider_knob')
    item=self.browser.find_element_by_class_name('gt_box')
    self.action.click_and_hold(on_element=slider_element).perform()
    time.sleep(0.3)
    screenshot=self.browser.get_screenshot_as_png()
    left = item.location['x']
    right = left + item.size['width']
    top = item.location['y']
    bottom = top + item.size['height']
    img=Image.open(BytesIO(screenshot))
    captcha=img.crop((left,top,right,bottom))
    return captcha
```

2. 计算滑动位置拼图的位置是一块阴影，设定一个阈值，将图片二值化，可以计算出拼图凹槽的位置。

```python
def cal_slider_offset(self):
    captcha=self.get_captcha_img()
    image=captcha.convert('L')
    flag=0
    for x in range(60,image.size[0]):
        sum_pix=0
        for y in range(image.size[1]):
            pix=image.getpixel((x,y))
            if pix<55:
                sum_pix+=1
        if sum_pix>self.threshold:
            return x-flag
        if sum_pix==0:
            flag=0
        else:
            flag+=1
        if flag>3:
            return x-flag
    return -1
```

3. 模拟轨迹，滑动认证
   Geetest 通过滑动的轨迹来判断是不是真人操作，因此滑动要尽量模拟人的操作。下面的方法只是简单地模拟了一下，“被怪物吃掉”的概率较大。如果需要更高的通过率，可以采集自己鼠标滑动的轨迹数据来认证。

```python
def get_track(self,offset):
    line=[]
    while offset>5:
        num=random.randint(1,4)
        line.append(num)
        offset-=num
    for i in range(offset):
        line.append(1)
    return line

def drag_and_drop_by_offset(self,offset):
    element=self.browser.find_element_by_class_name('gt_slider_knob')
    line=self.get_track(offset)
    for x in line:
        self.action.move_by_offset(x,random.randint(0,5)).perform()
        self.action.reset_actions()
        time.sleep(random.randint(1,500)/1000)
    self.action.release().perform()
    time.sleep(2)
    gt_info_text=self.browser.find_element_by_class_name('gt_info_text').text
    print(gt_info_text)
    screenshot=self.browser.get_screenshot_as_png()
    img=Image.open(BytesIO(screenshot))
    img.show()
```

4. 完整代码

```python
import requests
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
import time
import logging
from PIL import Image
from io import BytesIO
import random

class HackGeetest():
    def __init__(self):
        self.browser=webdriver.PhantomJS('./phantomjs')
        #self.browser=webdriver.Chrome('./chromedriver')
        self.browser.maximize_window()
        self.browser.implicitly_wait(10)
        self.action=ActionChains(self.browser)
        self.threshold=10

    def get_captcha_img(self):
        slider_element=self.browser.find_element_by_class_name('gt_slider_knob')
        item=self.browser.find_element_by_class_name('gt_box')
        self.action.click_and_hold(on_element=slider_element).perform()
        time.sleep(0.3)
        screenshot=self.browser.get_screenshot_as_png()
        left = item.location['x']
        right = left + item.size['width']
        top = item.location['y']
        bottom = top + item.size['height']
        img=Image.open(BytesIO(screenshot))
        captcha=img.crop((left,top,right,bottom))
        return captcha

    def cal_slider_offset(self):
        captcha=self.get_captcha_img()
        captcha.show()
        image=captcha.convert('L')
        flag=0
        for x in range(60,image.size[0]):
            sum_pix=0
            for y in range(image.size[1]):
                pix=image.getpixel((x,y))
                if pix<55:
                    sum_pix+=1
            print(x,sum_pix)
            if sum_pix>self.threshold:
                return x-flag
            if sum_pix==0:
                flag=0
            else:
                flag+=1
            if flag>4:
                return x-flag
        return -1

    def load_page(self,url):
        self.browser.get(url)

    def get_track(self,offset):
        line=[]
        while offset>5:
            num=random.randint(1,5)
            line.append(num)
            offset-=num
        for i in range(offset):
            line.append(1)
        return line

    def drag_and_drop_by_offset(self,offset):
        element=self.browser.find_element_by_class_name('gt_slider_knob')
        line=self.get_track(offset)
        for x in line:
            self.action.move_by_offset(x,random.randint(1,20)).perform()
            self.action.reset_actions()
            time.sleep(random.randint(50,200)/1000)
        self.action.release().perform()
        time.sleep(2)
        screenshot=self.browser.get_screenshot_as_png()
        #结果
        img=Image.open(BytesIO(screenshot))
        img.show()

    def quit(self):
        self.browser.quit()

if __name__=='__main__':
    geetest=HackGeetest()
    geetest.load_page('...') #url
    time.sleep(2)
    offset=geetest.cal_slider_offset()
    if offset!=-1:
        geetest.drag_and_drop_by_offset(offset-5)
        time.sleep(20)
        geetest.quit()
```
