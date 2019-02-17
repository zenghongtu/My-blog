import React from "react";

class BaiduTongji extends React.Component {
  componentDidMount() {
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?c00791bae4ab61eb6ca5707e6bc51bc9";
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();
  }

  render() {
    return null;
  }
}

export default BaiduTongji;
