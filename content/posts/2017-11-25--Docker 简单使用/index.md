---
title: Docker 简单使用
category: "Docker"
cover: cat3.jpg
author: Jason Zeng
---

# 安装Docker
详见Docker官网：https://www.docker.com/

# Preparing Dockerfile
创建Dockerfile文件，修改username和userpasswd写入：
```bash
# setting base image
FROM debian

 # new a directory for sshd to run
RUN mkdir -p /var/run/sshd

 # installing ssh server
RUN apt-get update
RUN apt-get install -y openssh-server

 # installing sudo
RUN apt-get install -y sudo

 # make ssh services use IPv4 to let X11 forwarding work correctly
RUN echo AddressFamily inet >> /etc/ssh/sshd_config

 # defining user account imformation
ARG username=username  #用户名
ARG userpasswd=passwd  #密码

 # adding user
RUN useradd -ms /bin/bash $username && (echo $username:$userpasswd | chpasswd)

 # adding user to sudo group
RUN adduser $username sudo

 # setting running application
CMD /usr/sbin/sshd -D
```
# Building Docker Image
在Dockerfile文件目录下执行以下命令构建镜像
```bash
docker build -t linux-debian .
```
查看镜像
```bash
docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
linux-debian        latest              9dede0b26399        28 hours ago        210MB
debian              latest              6d83de432e98        5 weeks ago         100MB
```
# 创建Debian容器
镜像构建完成后，执行以下命令创建容器
```bash
docker create --name=linux -p 20022:22 linux-debian
```
查看容器
```bash
docker ps -a
```
启动容器
```bash
docker start linux
```
# 配置SSH免密登录
登录到创建的linux
```bash
ssh -p 20022 username@127.0.0.1
```
查看自己电脑~/.ssh/目录下是否已存在秘钥对，不存在则创建
```bash
ssh-keygen -t rsa
```
将公钥`~/.ssh/id_rsa.pub`的内容填入linux中的`~/.ssh/authorized_keys`文件，并修改权限
```bash
chmod 600 ~/.ssh/authorized_keys
```
