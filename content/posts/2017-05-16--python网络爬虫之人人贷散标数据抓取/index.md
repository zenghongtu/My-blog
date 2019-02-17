---
title: python网络爬虫之人人贷散标数据抓取
category: "爬虫"
cover: cat0.jpg
author: Jason Zeng
---
1. 登录
借款人的详细信息需要登录后才能查看，因此爬虫需要模拟登录

Cookie登录
直接获取登录后的cookie填入请求的headers中

```python
cookie=''#填写cookie
headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:39.0) Gecko/20100101 Firefox/39.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cookie':cookie,
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive'}
2)post登录
 def login(username,password):
     session=requests.session()
     data={
         'j_username':username,
         'j_password':password,#password是加密后的
         'rememberme':'on',
         'targetUrl':'http://www.we.com/',
         'returnUrl':'https://www.we.com/account/index.action'}
    session.post('https://www.we.com/j_spring_security_check',data=data,headers=headers)
    return session
```
2. 抓取

散标的链接是：http://www.we.com/loan/2071082 ,每一个标对应一个id,改变id就可以获取到不同的标
目前人人贷上id的范围从1-808500,2000001-2071082,因此可以编写一个循环来获取所有的标
```python
def main():
    id_from=2007050#起始id
    id_to=2008550#结束id
    for load_id in range(int(id_from),int(id_to)+1):
        try:
            items=get_page('http://www.we.com/loan/'+str(load_id))#获取标的信息
        except:
            failed_f=open('failed.txt','a')#失败则写入failed
            failed_f.write(str(load_id)+'
')
            failed_f.close()
            print(load_id,'failed')
            continue
        items['id']=str(load_id)
        print(load_id,'ok')
        write_to_text(items)#写入文件

def write_to_text(items):#写入文件
    text_f=open('result.txt','a')
    text=''
    for key in keys:
        text+=items[key].replace(' ','')+' ||'
    text_f.write(text+'
')
    text_f.close()

def get_page(url):#获取页面并解析
    html=requests.get(url,headers=headers).text
    infor=parser(html)
    return infor
```
3. 解析

使用BeautifulSoup4，lxml解析网页，解析程序是根据网页编写的，要看懂代码需要结合网页
```python
def parser(html):
    soup=BeautifulSoup(html,'lxml').find('div',id='pg-loan-invest')
    infor_one=soup.find('div',id='loan-basic-panel')
    infor={}
    infor['Loan_type']=infor_one.find('div',attrs={'class':'fn-left fn-text-overflow pl25'}).get('title')
    infor['Loan_Title']=infor_one.find('em',attrs={'class':'title-text'}).get_text()
    em=infor_one.find('div',attrs={'class':'fn-clear'}).find_all('em')
    infor['Amount']=em[0].get_text()
    infor['Interest_Rate']=em[1].get_text()
    infor['Term']=em[3].get_text()
    ul=infor_one.find('div',attrs={'class':'fn-left pt10 loaninfo '}).find('ul').find_all('li')
    infor['Guarantee_Type']=ul[0].find('span',attrs={'class':'fn-left basic-value last'}).get_text()
    infor['Early_Repayment_Rate']=ul[0].find('span',attrs={'class':'fn-left basic-value num'}).get_text()
    infor['Repayment_Type']=ul[1].find('span',attrs={'class':'fn-left basic-value'}).get_text()
    statue=infor_one.find('div',attrs={'class':'pl25 pr25 fn-clear'}).find('div',attrs={'class':'stamp'}).find('em').get('class')
    infor['Loan_Status']=statue[0]
    if statue==['REPAYING']:
        infor['Term_Remain']=infor_one.find('div',attrs={'class':'pl25 pr25 fn-clear'}).find('div',attrs={'class':'box box-top'}).find('i').get_text()
        infor['Next_Payment_Day']=infor_one.find('div',attrs={'class':'pl25 pr25 fn-clear'}).find('div',attrs={'class':'box box-bottom'}).find('i').get_text()
    else:
        infor['Term_Remain']=''
        infor['Next_Payment_Day']=''
    table=soup.find('div',id='loan-details').find('table',attrs={'class':'ui-table-basic-list'}).find_all('tr')
    infor['Borrower_Id']=table[0].find('em').get_text()
    infor['Userid']=table[0].find('em').find('a').get('href').replace('/account/myInfo.action?userId=','')
    infor['Credit_Score']=table[0].find_all('em')[1].get('title')
    infor['Des']=soup.find('div',attrs={'class':'ui-tab-list color-dark-text'}).get_text().replace('
','').replace('\t','')
    em=table[2].find_all('em')
    infor['Age']=em[0].get_text().replace('
','').replace('\t','')
    infor['Education']=em[1].get_text().replace('
','').replace('\t','')
    infor['Marital status']=em[2].get_text().replace('
','').replace('\t','')
    em=table[4].find_all('em')
    infor['Number_of_Borrow']=em[0].get_text().replace('
','').replace('\t','')
    infor['Credit_Limit']=em[1].get_text().replace('
','').replace('\t','')
    infor['Overdue_amount']=em[2].get_text().replace('
','').replace('\t','')
    em=table[5].find_all('em')
    infor['Number_of_Succesful_Loan']=em[0].get_text().replace('
','').replace('\t','')
    infor['Total_Amount']=em[1].get_text().replace('
','').replace('\t','')
    infor['Number_Arrears']=em[2].get_text().replace('
','').replace('\t','')
    em=table[6].find_all('em')
    infor['Number_of_Repaid']=em[0].get_text().replace('
','').replace('\t','')
    infor['Outstanding']=em[1].get_text().replace('
','').replace('\t','')
    infor['Severe_overdue']=em[2].get_text().replace('
','').replace('\t','')
    em=table[8].find_all('em')
    infor['Income_Range_Monthly']=em[0].get_text().replace('
','').replace('\t','')
    infor['Homeowner']=em[1].get_text().replace('
','').replace('\t','')
    infor['Mortgage']=em[2].get_text().replace('
','').replace('\t','')
    em=table[9].find_all('em')
    infor['Car']=em[0].get_text().replace('
','').replace('\t','')
    infor['Car_Loan']=em[1].get_text().replace('
','').replace('\t','')
    em=table[11].find_all('em')
    infor['Working_City']=em[0].get_text().replace('
','').replace('\t','')
    infor['Emploment_Length']=em[1].get_text().replace('
','').replace('\t','')
    for item in soup.find('div',id='loan-details').find('table',attrs={'class':'ui-table-basic-list'}).find_all('td'):
        if item.get_text()[:4]==u'公司行业':
            infor['Employment_Sector']=item.find('em').get_text()
        if item.get_text()[:4]==u'公司规模':
            infor['Company_Scale']=item.find('em').get_text()
        if item.get_text()[:4]==u'岗位职位':
            infor['Position']=item.find('em').get_text()
    return infor
```
4. 完整代码

```python
#coding:utf-8

import requests
from bs4 import BeautifulSoup


Cookie=""
headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:39.0) Gecko/20100101 Firefox/39.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cookie':Cookie,
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive'}

keys=['id','Loan_Title','Loan_type', 'Loan_Status','Amount', 'Interest_Rate', 'Term','Next_Payment_Day','Term_Remain', 'Repayment_Type','Des','Guarantee_Type','Early_Repayment_Rate',
        'Borrower_Id','Userid','Age','Education',  'Marital status','Working_City','Company_Scale','Position','Employment_Sector', 'Emploment_Length','Homeowner', 'Mortgage', 'Car', 'Car_Loan',
        'Total_Amount','Number_of_Succesful_Loan', 'Income_Range_Monthly', 'Number_of_Borrow', 'Number_of_Repaid', 'Outstanding','Overdue_amount','Severe_overdue','Credit_Score',  'Number_Arrears', 'Credit_Limit']

def write_to_text(items):
    text_f=open('result.txt','a',encoding='utf-8')
    text=''
    for key in lists:
        text+=items[key].replace(' ','')+' ||'
    text_f.write(text+'
')
    text_f.close()

def get_page(url):
    html=requests.get(url,headers=headers).text
    infor=parser(html)
    return infor

def parser(html):
    soup=BeautifulSoup(html,'lxml').find('div',id='pg-loan-invest')
    infor_one=soup.find('div',id='loan-basic-panel')
    infor={}
    infor['Loan_type']=infor_one.find('div',attrs={'class':'fn-left fn-text-overflow pl25'}).get('title')
    infor['Loan_Title']=infor_one.find('em',attrs={'class':'title-text'}).get_text()
    em=infor_one.find('div',attrs={'class':'fn-clear'}).find_all('em')
    infor['Amount']=em[0].get_text()
    infor['Interest_Rate']=em[1].get_text()
    infor['Term']=em[3].get_text()
    ul=infor_one.find('div',attrs={'class':'fn-left pt10 loaninfo '}).find('ul').find_all('li')
    infor['Guarantee_Type']=ul[0].find('span',attrs={'class':'fn-left basic-value last'}).get_text()
    infor['Early_Repayment_Rate']=ul[0].find('span',attrs={'class':'fn-left basic-value num'}).get_text()
    infor['Repayment_Type']=ul[1].find('span',attrs={'class':'fn-left basic-value'}).get_text()
    statue=infor_one.find('div',attrs={'class':'pl25 pr25 fn-clear'}).find('div',attrs={'class':'stamp'}).find('em').get('class')
    infor['Loan_Status']=statue[0]
    if statue==['REPAYING']:
        infor['Term_Remain']=infor_one.find('div',attrs={'class':'pl25 pr25 fn-clear'}).find('div',attrs={'class':'box box-top'}).find('i').get_text()
        infor['Next_Payment_Day']=infor_one.find('div',attrs={'class':'pl25 pr25 fn-clear'}).find('div',attrs={'class':'box box-bottom'}).find('i').get_text()
    else:
        infor['Term_Remain']=''
        infor['Next_Payment_Day']=''
    table=soup.find('div',id='loan-details').find('table',attrs={'class':'ui-table-basic-list'}).find_all('tr')
    infor['Borrower_Id']=table[0].find('em').get_text()
    infor['Userid']=table[0].find('em').find('a').get('href').replace('/account/myInfo.action?userId=','')
    infor['Credit_Score']=table[0].find_all('em')[1].get('title')
    infor['Des']=soup.find('div',attrs={'class':'ui-tab-list color-dark-text'}).get_text().replace('
','').replace('\t','')
    em=table[2].find_all('em')
    infor['Age']=em[0].get_text().replace('
','').replace('\t','')
    infor['Education']=em[1].get_text().replace('
','').replace('\t','')
    infor['Marital status']=em[2].get_text().replace('
','').replace('\t','')
    em=table[4].find_all('em')
    infor['Number_of_Borrow']=em[0].get_text().replace('
','').replace('\t','')
    infor['Credit_Limit']=em[1].get_text().replace('
','').replace('\t','')
    infor['Overdue_amount']=em[2].get_text().replace('
','').replace('\t','')
    em=table[5].find_all('em')
    infor['Number_of_Succesful_Loan']=em[0].get_text().replace('
','').replace('\t','')
    infor['Total_Amount']=em[1].get_text().replace('
','').replace('\t','')
    infor['Number_Arrears']=em[2].get_text().replace('
','').replace('\t','')
    em=table[6].find_all('em')
    infor['Number_of_Repaid']=em[0].get_text().replace('
','').replace('\t','')
    infor['Outstanding']=em[1].get_text().replace('
','').replace('\t','')
    infor['Severe_overdue']=em[2].get_text().replace('
','').replace('\t','')
    em=table[8].find_all('em')
    infor['Income_Range_Monthly']=em[0].get_text().replace('
','').replace('\t','')
    infor['Homeowner']=em[1].get_text().replace('
','').replace('\t','')
    infor['Mortgage']=em[2].get_text().replace('
','').replace('\t','')
    em=table[9].find_all('em')
    infor['Car']=em[0].get_text().replace('
','').replace('\t','')
    infor['Car_Loan']=em[1].get_text().replace('
','').replace('\t','')
    em=table[11].find_all('em')
    infor['Working_City']=em[0].get_text().replace('
','').replace('\t','')
    infor['Emploment_Length']=em[1].get_text().replace('
','').replace('\t','')
    for item in soup.find('div',id='loan-details').find('table',attrs={'class':'ui-table-basic-list'}).find_all('td'):
        if item.get_text()[:4]==u'公司行业':
            infor['Employment_Sector']=item.find('em').get_text()
        if item.get_text()[:4]==u'公司规模':
            infor['Company_Scale']=item.find('em').get_text()
        if item.get_text()[:4]==u'岗位职位':
            infor['Position']=item.find('em').get_text()
    return infor

def main():
    id_from=2007050#起始id
    id_to=2008550#结束id
    for load_id in range(int(id_from),int(id_to)+1):
        try:
            items=get_page('http://www.we.com/loan/'+str(load_id))
        except:
            failed_f=open('failed.txt','a',encoding='utf-8')
            failed_f.write(str(load_id)+'
')
            failed_f.close()
            print(load_id,'failed')
            continue
        items['id']=str(load_id)
        print(load_id,'ok')
        write_to_text(items)

if __name__=='__main__':
    main()
```
5. 运行环境

需要安装BeautifulSoup4,requests,lxml这三个第三方库
BeautifulSoup4和requests可以直接使用命令安装
```bash
pip install bs4
pip install requests
```
