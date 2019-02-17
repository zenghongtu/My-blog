---
title: PIL生成验证码
category: "PIL"
cover: cat1.jpg
author: Jason Zeng
---

PIL 生成验证码为了防止程序恶意请求，使用图片验证码是最常见的手段。

1. PIL
   PIL 是一个非常强大的图像处理库，这里我们使用 PIL 来生成图片验证码安装 PIL

```python
pip install Pillow
```

Windows 下可以直接到官网下载 exe 安装包

2. 绘制字符

```python
#随机生成RGB颜色
def randcolor():
    return (random.randint(64, 255), random.randint(64, 255), random.randint(64, 255))

def randcolor_2():
    return (random.randint(32, 127), random.randint(32, 127), random.randint(32, 127))

#随机生成1-20内的加减乘算数表达式，并绘制
size=(160,50)
firstnum=random.randint(1,20)
secondnum=random.randint(1,20)
operator=random.choice('+-*')
verifystr=str(firstnum)+operator+str(secondnum)
result=eval(verifystr)#验证码结果
img=Image.new('RGB',size, (255,255,255))
draw=ImageDraw.Draw(img)
font=ImageFont.truetype('DejaVuSerif-Bold.ttf',36)
verifystr+='=?'
for index in range(len(verifystr)):
    draw.text((10+20*index,10),text=verifystr[index],font=font,fill=randcolor_2())
img=img.filter(ImageFilter.CONTOUR)#模糊
```

3. 绘制干扰线，干扰点

```python
def create_lines(draw,size):
    line_num=random.randint(5,8)#干扰线数目
    for num in range(line_num):
        begin=(random.randint(0,size[0]),random.randint(0,size[1]))#起始点
        end=(random.randint(0,size[0]),random.randint(0,size[1]))#结束点
        draw.line([begin,end],fill=randcolor_2())#绘制
    return draw

def create_points(draw,size):
    point_num=random.randint(200,400)#干扰点数目
    while point_num:
        w=random.randint(0,size[0])
        h=random.randint(0,size[1])
        draw.point((w,h),fill=randcolor())
        point_num-=1
    return draw
```

4. 在 Django 中加入验证码模块生成的验证码可以不用保存到本地再显示，这里我们使用 Python 的 io 模块

```python
from io import BytesIO
from verify import create_verifycode

def verifycode(request):
    img,code=create_verifycode()#生成验证码
    mstream =BytesIO()
    request.session['verifycode']=code#将验证码的结果保存在session中，当用户提交时，与session中的结果比较
    img.save(mstream, "jpeg")
    return HttpResponse(mstream.getvalue(),content_type="image/jpeg")
```
