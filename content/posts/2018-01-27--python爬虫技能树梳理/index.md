---
title: python爬虫技能树梳理
category: "爬虫"
cover: old-books-436498_1280.jpg
author: Jason Zeng
---
## 解析 URL
#### 通用
* furl– 一个小的 Python 库，使得操纵 URL 简单化。
* purl– 一个简单的不可改变的 URL 以及一个干净的用于调试和操作的 API。
* urllib.parse– 用于打破统一资源定位器（URL）的字符串在组件（寻址方案，网络位置，路径等）之间的隔断，为了结合组件到一个 URL 字符串，并将“相对 URL”转化为一个绝对 URL，称之为“基本 URL”。
* tldextract– 从 URL 的注册域和子域中准确分离 TLD，使用公共后缀列表。
#### 网络地址
* netaddr– 用于显示和操纵网络地址的 Python 库。

## 发起请求

### 普通请求

* urllib -网络库(stdlib)。
* requests -网络库。
* grab –  网络库（基于 pycurl）。
* pycurl –  网络库（绑定 libcurl）。
* urllib3 – Python HTTP 库，安全连接池、支持文件 post、可用性高。
* httplib2 –  网络库。
* RoboBrowser –  一个简单的，无需独立的浏览器即可浏览网页。
* MechanicalSoup -一个与网站自动交互 Python 库。
* mechanize -有状态、可编程的 Web 浏览库。
* socket –  底层网络接口(stdlib)。
* Unirest for Python – Unirest 是可用于多种语言的轻量级的 HTTP 库。
* hyper – Python 的 HTTP/2 客户端。
* PySocks – 。作为 socket 模块的直接替换。
### 异步请求
* treq –  类似于 requests 的 API（基于 twisted）。
* aiohttp – asyncio 的 HTTP 客户端/服务器(PEP-3156)

###  多线程进程协程

#### 异步

* asyncio – （在 Python 3.4 +版本以上的 Python 标准库）异步 I/O，时间循环，协同程序和任务。
* Twisted – 基于事件驱动的网络引擎框架。
* Tornado – 一个网络框架和异步网络库。
* pulsar – Python 事件驱动的并发框架。
* diesel – Python 的基于绿色事件的 I/O 框架。
* gevent – 一个使用 greenlet  的基于协程的 Python 网络库。
* eventlet – 有 WSGI 支持的异步框架。
* Tomorrow – 异步代码的奇妙的修饰语法。
#### 队列
* celery – 基于分布式消息传递的异步任务队列/作业队列。
* huey – 小型多线程任务队列。
* mrq – Mr. Queue – 使用 redis & Gevent 的 Pyth- 分布式工作任务队列。
* RQ – 基于 Redis 的轻量级任务队列管理器。
* simpleq – 一个简单的，可无限扩展，基于 Amazon SQ- 队列。
* python-gearman – Gearman 的 Python API。
* redis — 基于内存的数据库，高速高效

### 浏览器自动化

* selenium – 自动化真正的浏览器（Chrome 浏览器，火狐浏览器，Opera 浏览器，IE 浏览器）。
* Ghost.py – 对 PyQt 的 webkit 的封装（需要 PyQT）。
* Spynner – 对 PyQt 的 webkit 的封装（需要 PyQT）。
* Splinter – 通用 API 浏览器模拟器（selenium web 驱动，Django 客户端，Zope）。
* phantomjs - 无界面浏览器。
* Headless Chrome - 用于自动化测试和不需要可视化用户界面的服务器。

## 解析数据

### HTML/XML 解析器

#### 通用

* lxml – C 语言编写高效 HTML/ XML 处理库。支持 XPath。
* cssselect –  解析 DOM 树和 CSS 选择器。
* pyquery –  解析 DOM 树和 jQuery 选择器。
* BeautifulSoup – 低效 HTML/ XML 处理库，纯 Python 实现。
* html5lib –  根据 WHATWG 规范生成 HTML/ XML 文档 DOM。该规范被用在现在所有的浏览器上。
* feedparser –  解析 RSS/ATOM feeds。
* MarkupSafe –  为 XML/HTML/XHTML 提供了安全转义的符串。
* xmltodict –  一个可以让你在处理 XML 时感觉像在处 JSON 一样的 Python 模块。
* xhtml2pdf –  将 HTML/CSS 转换为 PDF。
* untangle –  轻松实现将 XML 文件转换为 Python 对象。
#### 清理
* Bleach –  清理 HTML（需要 html5lib）。
* sanitize –  为混乱的数据世界带来清明。

### 自然语言处理

* NLTK -编写 Python 程序来处理人类语言数据的最好平台。
* Pattern – Python 的网络挖掘模块。他有自然语言处理工具，机器学习以及其它。
* TextBlob – 为深入自然语言处理任务提供了一致的 API。是基于 NLTK 以及 Pattern 的巨人之肩上发展的。
* jieba – 中文分词工具。
* SnowNLP – 中文文本处理库。
* loso – 另一个中文分词库。
* genius – 基于条件随机域的中文分词。
* langid.py – 独立的语言识别系统。
* Korean – 一个韩文形态库。
* pymorphy2 – 俄语形态分析器（词性标注+词形变化引擎）。
* PyPLN  – 用 Python 编写的分布式自然语言处理通道。这个项目的目标是创建一种简单的方法使用 NLTK 通过网络接口处理大语言库

### 文本处理

#### 通用

* difflib – （Python 标准库）帮助进行差异化比较。
* Levenshtein –  快速计算 Levenshtein 距离和字符串相似度。
* fuzzywuzzy –  模糊字符串匹配。
* esmre –  正则表达式加速器。
* ftfy –  自动整理 Unicode 文本，减少碎片化。
#### 转换
* unidecode – 将 Unicode 文本转为 ASCII。
#### 字符编码
* uniout –  打印可读字符，而不是被转义的字符串。
* chardet –  兼容 Python 的 2/3 的字符编码器。
* xpinyin –  一个将中国汉字转为拼音的库。
* pangu.py –  格式化文本中 CJK 和字母数字的间距。
#### Slug 化
* awesome-slugify –  一个可以保留 unicode 的 Python slugify 库。
* python-slugify –  一个可以将 Unicode 转为 ASCII 的 Python slugify 库。
* unicode-slugify – 一个可以将生成 Unicode slugs 的工具。
* pytils – 处理俄语字符串的简单工具（包括 pytils.translit.slugify）。
#### 通用解析器
* PLY – lex 和 yacc 解析工具的 Python 实现。
* pyparsing –  一个通用框架的生成语法分析器。
#### 人的名字
* python-nameparser -解析人的名字的组件。
#### 电话号码
* phonenumbers -解析，格式化，存储和验证国际电话号码。
#### 用户代理字符串
* python-user-agents – 浏览器用户代理的解析器。
* HTTP Agent Parser – Python 的 HTTP 代理分析器。

### 网页内容提取

#### HTML 页面的文本和元数据

* newspaper – 用 Python 进行新闻提取、文章提取和内容策展。
* html2text – 将 HTML 转为 Markdown 格式文本。
* python-goose – HTML 内容/文章提取器。
* lassie – 人性化的网页内容检索工具
* micawber – 一个从网址中提取丰富内容的小库。
* sumy -一个自动汇总文本文件和 HTML 网页的模块
* Haul – 一个可扩展的图像爬虫。
* python-readability – arc90 readability 工具的快速 Python 接口。
* scrapely – 从 HTML 网页中提取结构化数据的库。给出了一些 Web 页面和数据提取的示例，scrapely 为所有类似的网页构建一个分析器。
#### 视频
* youtube-dl – 一个从 YouTube 下载视频的小命令行程序。
* you-get – Python3 的 YouTube、优酷/ Niconico 视频下载器。
#### 维基
* WikiTeam – 下载和保存 wikis 的工具。
#### 整站下载—wget

###  计算机  视觉

* PIL - Python 平台事实上的图像处理标准库。
* OpenCV – 开源计算机视觉库。
* SimpleCV – 用于照相机、图像处理、特征提取、格式转换的简介，可读性强的接口（基于 OpenCV）。
* mahotas – 快速计算机图像处理算法（完全使用 C++ 实现），完全基于 numpy 的数组作为它的数据类型。

### 图片验证码

* tensorflow - 是一个采用数据流图(data flow graphs),用于数值计算的开源软件库。
* pytesseract - 一个很好用图像识别工具。

### 特殊格式处理

#### 通用

* tablib – 一个把数据导出为 XLS、CSV、JSON、YAML 等格式的模块。
* textract – 从各种文件中提取文本，比如 Word、PowerPoint、PDF 等。
* messytables – 解析混乱的表格数据的工具。
* rows – 一个常用数据接口，支持的格式很多（目前支持 CSV，HTML，XLS，TXT – 将来还会提供更多！）。
#### Office
* python-docx – 读取，查询和修改的 Microsoft Word2007/2008 的 docx 文件。
* xlwt / xlrd – 从 Excel 文件读取写入数据和格式信息。
* XlsxWriter – 一个创建 Excel.xlsx 文件的 Python 模块。
* xlwings – 一个 BSD 许可的库，可以很容易地在 Excel 中调用 Python，反之亦然。
* openpyxl – 一个用于读取和写入的 Excel2010 XLSX/ XLSM/ xltx/ XLTM 文件的库。
* Marmir – 提取 Python 数据结构并将其转换为电子表格。
#### PDF
* PDFMiner – 一个从 PDF 文档中提取信息的工具。
* PyPDF2 – 一个能够分割、合并和转换 PDF 页面的库。
* ReportLab – 允许快速创建丰富的 PDF 文档。
* pdftables – 直接从 PDF 文件中提取表格。
#### Markdown
* Python-Markdown – 一个用 Python 实现的 John Gruber 的 Markdown。
* Mistune – 速度最快，功能全面的 Markdown 纯 Python 解析器。
* markdown2 – 一个完全用 Python 实现的快速的 Markdown。
#### YAML
* PyYAML – 一个 Python 的 YAML 解析器。
#### CSS
* cssutils – 一个 Python 的 CSS 库。
#### ATOM/RSS
* feedparser – 通用的 feed 解析器。
#### SQL
* sqlparse – 一个非验证的 SQL 语句分析器。
#### HTTP
* http-parser – C 语言实现的 HTTP 请求/响应消息解析器。
#### 微格式
* opengraph – 一个用来解析 Open Graph 协议标签的 Python 模块。
#### 可移植的执行体
* pefile – 一个多平台的用于解析和处理可移植执行体（即 PE）文件的模块。
#### PSD
* psd-tools – 将 Adobe Photoshop PSD（即 PE）文件读取到 Python 数据结构。

### 存储

* MongoDB
* MySQL
* Redis(分布式爬虫)
* SQLite

### 网络爬虫框架

#### 功能齐全的爬虫

* grab –  网络爬虫框架（基于 pycurl/multicur）。
* scrapy –  网络爬虫框架（基于 twisted）。
* pyspider –  一个强大的爬虫系统（国人开发）。
* cola –  一个分布式爬虫框架。
#### 其他
* portia –  基于 Scrapy 的可视化爬虫。
* restkit – Python 的 HTTP 资源工具包。它可以让你轻松地访问 HTTP 资源，并围绕它建立的对象。
* demiurge –  基于 PyQuery 的爬虫微框架
